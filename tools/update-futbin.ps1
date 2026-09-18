[CmdletBinding()]
param(
  [Parameter()]
  [string]$Candidate,

  [Parameter()]
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$PlayersDataPath = Join-Path $RepoRoot "players-data.js"
$ValidatorPath = Join-Path $PSScriptRoot "validate-futbin-catalog.mjs"
$ValidatorTestPath = Join-Path $PSScriptRoot "validate-futbin-catalog.test.mjs"
$BackupPath = $null
$Applied = $false
$Committed = $false
$PushFailed = $false

function Invoke-Native {
  param(
    [Parameter(Mandatory = $true)][string]$Command,
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [string]$Description = $Command,
    [switch]$AllowFailure
  )
  $previousErrorAction = $ErrorActionPreference
  try {
    # Windows PowerShell 5.1 wraps native stderr as ErrorRecord. Keep it as
    # command output and decide success exclusively from the native exit code.
    $ErrorActionPreference = "Continue"
    $output = @(& $Command @Arguments 2>&1)
    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousErrorAction
  }
  if ($exitCode -ne 0 -and -not $AllowFailure) {
    $detail = ($output | ForEach-Object { "$_" }) -join [Environment]::NewLine
    throw "$Description fallo con codigo $exitCode.$([Environment]::NewLine)$detail"
  }
  [pscustomobject]@{ ExitCode = $exitCode; Output = $output }
}

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [string]$Description = "git $($Arguments -join ' ')",
    [switch]$AllowFailure
  )
  Invoke-Native -Command "git" -Arguments $Arguments -Description $Description -AllowFailure:$AllowFailure
}

function Resolve-CandidatePath {
  param([string]$ExplicitPath)
  if ($ExplicitPath) {
    if (-not (Test-Path -LiteralPath $ExplicitPath -PathType Leaf)) {
      throw "No existe el candidato indicado: $ExplicitPath"
    }
    return (Resolve-Path -LiteralPath $ExplicitPath).Path
  }
  $downloads = Join-Path $env:USERPROFILE "Downloads"
  if (-not (Test-Path -LiteralPath $downloads -PathType Container)) {
    throw "No existe la carpeta de descargas: $downloads"
  }
  $latest = Get-ChildItem -LiteralPath $downloads -Filter "players-data.candidate*.js" -File |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  if (-not $latest) {
    throw "No se encontro players-data.candidate*.js en $downloads"
  }
  return $latest.FullName
}

function Assert-NoGitOperation {
  $operations = @(
    @{ Name = "merge"; Path = "MERGE_HEAD" },
    @{ Name = "rebase"; Path = "rebase-merge" },
    @{ Name = "rebase"; Path = "rebase-apply" },
    @{ Name = "cherry-pick"; Path = "CHERRY_PICK_HEAD" },
    @{ Name = "revert"; Path = "REVERT_HEAD" }
  )
  foreach ($operation in $operations) {
    $gitPathResult = Invoke-Git -Arguments @("rev-parse", "--git-path", $operation.Path)
    $gitPath = "$($gitPathResult.Output[0])"
    if (Test-Path -LiteralPath $gitPath) {
      throw "Hay una operacion Git en curso: $($operation.Name)."
    }
  }
}

function Assert-Repository {
  $inside = Invoke-Git -Arguments @("rev-parse", "--is-inside-work-tree") -Description "Comprobacion del repositorio"
  if ("$($inside.Output[0])".Trim() -ne "true") {
    throw "El script no se esta ejecutando dentro de un repositorio Git."
  }
  $top = Invoke-Git -Arguments @("rev-parse", "--show-toplevel")
  $topPath = [System.IO.Path]::GetFullPath("$($top.Output[0])")
  if (-not [string]::Equals($topPath.TrimEnd("\", "/"), $RepoRoot.TrimEnd("\", "/"), [System.StringComparison]::OrdinalIgnoreCase) -or
      (Split-Path -Leaf $topPath) -ne "xolugg-tradelab") {
    throw "Repositorio inesperado: $topPath"
  }
  $origin = Invoke-Git -Arguments @("remote", "get-url", "origin") -Description "Comprobacion de origin"
  $originUrl = "$($origin.Output[0])".Trim()
  if (-not $originUrl -or $originUrl -notmatch "(?i)(?:^|[/:])xolugg-tradelab(?:\.git)?$") {
    throw "origin no apunta al repositorio esperado xolugg-tradelab: $originUrl"
  }
  Assert-NoGitOperation
  $main = Invoke-Git -Arguments @("show-ref", "--verify", "--quiet", "refs/heads/main") -AllowFailure
  if ($main.ExitCode -ne 0) {
    throw "No existe la rama local main."
  }
  return $originUrl
}

function Invoke-CatalogValidator {
  param(
    [Parameter(Mandatory = $true)][string]$CurrentPath,
    [Parameter(Mandatory = $true)][string]$CandidatePath
  )
  $run = Invoke-Native -Command "node" -Arguments @(
    $ValidatorPath, "--current", $CurrentPath, "--candidate", $CandidatePath, "--json"
  ) -Description "Validador semantico" -AllowFailure
  $text = ($run.Output | ForEach-Object { "$_" }) -join [Environment]::NewLine
  try {
    $result = $text | ConvertFrom-Json
  } catch {
    throw "El validador no devolvio JSON valido.$([Environment]::NewLine)$text"
  }
  if ($run.ExitCode -ne 0 -and $result.valid) {
    throw "El validador termino con codigo $($run.ExitCode) pese a indicar un resultado valido."
  }
  return $result
}

function Show-ValidationSummary {
  param(
    [Parameter(Mandatory = $true)]$Result,
    [Parameter(Mandatory = $true)][string]$CandidatePath,
    [Parameter(Mandatory = $true)][string]$Sha256
  )
  Write-Host ""
  Write-Host "XoluGG FUTBIN Update"
  Write-Host "===================="
  Write-Host ""
  Write-Host "Candidato:"
  Write-Host $CandidatePath
  Write-Host ""
  Write-Host "SHA-256:"
  Write-Host $Sha256
  Write-Host ""
  if ($Result.summary) {
    $summary = $Result.summary
    Write-Host ("{0,-28} {1,8}" -f "Catalogo actual:", $summary.currentCatalog)
    Write-Host ("{0,-28} {1,8}" -f "Catalogo candidato:", $summary.candidateCatalog)
    Write-Host ("{0,-28} {1,8}" -f "Cartas nuevas:", $summary.newCards)
    Write-Host ("{0,-28} {1,8}" -f "IDs unicos:", $summary.uniqueIds)
    Write-Host ("{0,-28} {1,8}" -f "Con FUTBIN:", $summary.withFutbin)
    Write-Host ("{0,-28} {1,8}" -f "Sin FUTBIN:", $summary.withoutFutbin)
    Write-Host ("{0,-28} {1,8}" -f "Precios null:", $summary.nullPrices)
    Write-Host ("{0,-28} {1,8}" -f "Precios cero:", $summary.zeroPrices)
    Write-Host ("{0,-28} {1,8}" -f "IDs eliminados:", $summary.removedIds)
    Write-Host ("{0,-28} {1,8}" -f "Registros con cambios:", $summary.changedExisting)
    Write-Host ("{0,-28} {1,8}" -f "Errores de validacion:", $summary.validationErrors)
    $candidateState = if ($Result.hasChanges) { "CAMBIOS DETECTADOS" } else { "SIN CAMBIOS" }
    Write-Host ("{0,-28} {1,20}" -f "Estado del candidato:", $candidateState)
    Write-Host ""
    Write-Host "Cambios permitidos en registros existentes:"
    foreach ($field in @("precioReferencia", "popularidadFuente", "ratingFuente", "valorSecundarioFuente", "fuente", "futbin")) {
      Write-Host ("  {0,-26} {1,8}" -f $field, $summary.marketChanges.$field)
    }
  }
  if ($Result.missingIds.Count -gt 0) {
    Write-Host ""
    Write-Host "IDs faltantes:"
    $Result.missingIds | ForEach-Object { Write-Host "  $_" }
  }
  if ($Result.errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Errores:"
    $Result.errors | ForEach-Object { Write-Host "  [$($_.code)] $($_.message)" }
  }
}

function Assert-OnlyPlayersDataStaged {
  $stagedResult = Invoke-Git -Arguments @("diff", "--cached", "--name-only")
  $staged = @($stagedResult.Output | ForEach-Object { "$_".Trim() } | Where-Object { $_ })
  if ($staged.Count -ne 1 -or $staged[0] -ne "players-data.js") {
    throw "El commit incluiria archivos inesperados: $($staged -join ', ')"
  }
}

try {
  Set-Location -LiteralPath $RepoRoot
  $CandidatePath = Resolve-CandidatePath -ExplicitPath $Candidate
  if ([string]::Equals([System.IO.Path]::GetFullPath($CandidatePath), [System.IO.Path]::GetFullPath($PlayersDataPath),
      [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "El candidato no puede ser el propio players-data.js."
  }
  $candidateItem = Get-Item -LiteralPath $CandidatePath
  $candidateHash = (Get-FileHash -LiteralPath $CandidatePath -Algorithm SHA256).Hash

  Write-Host "Candidato seleccionado"
  Write-Host "====================="
  Write-Host "Ruta:   $($candidateItem.FullName)"
  Write-Host "Nombre: $($candidateItem.Name)"
  Write-Host "Fecha:  $($candidateItem.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))"
  Write-Host "Tamano: $($candidateItem.Length) bytes"
  Write-Host "SHA-256: $candidateHash"

  $originUrl = Assert-Repository
  $status = Invoke-Git -Arguments @("status", "--porcelain=v1", "--untracked-files=all")
  $dirty = @($status.Output | Where-Object { "$_".Trim() }).Count -gt 0

  if ($DryRun) {
    Write-Host ""
    Write-Host "Modo DryRun: no se cambiara de rama ni se ejecutara git pull."
    Write-Host "Rama actual: $((Invoke-Git -Arguments @('branch', '--show-current')).Output[0])"
    Write-Host "Origin: $originUrl"
    Write-Host "Working tree limpio: $(-not $dirty)"
  } else {
    if ($dirty) {
      throw "El working tree no esta limpio. No se modifico ningun archivo."
    }
    $branch = "$((Invoke-Git -Arguments @('branch', '--show-current')).Output[0])".Trim()
    if ($branch -ne "main") {
      Invoke-Git -Arguments @("switch", "main") -Description "git switch main" | Out-Null
    }
    Invoke-Git -Arguments @("pull", "--ff-only", "origin", "main") -Description "git pull --ff-only origin main" | Out-Null
    Assert-NoGitOperation
    $postPullStatus = Invoke-Git -Arguments @("status", "--porcelain=v1", "--untracked-files=all")
    if (@($postPullStatus.Output | Where-Object { "$_".Trim() }).Count -gt 0) {
      throw "El working tree dejo de estar limpio despues de actualizar main."
    }
  }

  Invoke-Native -Command "node" -Arguments @("--check", $CandidatePath) -Description "node --check del candidato" | Out-Null
  Invoke-Native -Command "node" -Arguments @("--check", $ValidatorPath) -Description "node --check del validador" | Out-Null
  $validation = Invoke-CatalogValidator -CurrentPath $PlayersDataPath -CandidatePath $CandidatePath
  Show-ValidationSummary -Result $validation -CandidatePath $CandidatePath -Sha256 $candidateHash
  if (-not $validation.valid) {
    throw "El candidato no supera la validacion semantica."
  }
  Invoke-Native -Command "node" -Arguments @("--test", $ValidatorTestPath) -Description "Tests del validador" | Out-Null
  Invoke-Git -Arguments @("diff", "--check") -Description "git diff --check" | Out-Null
  $hashAfterValidation = (Get-FileHash -LiteralPath $CandidatePath -Algorithm SHA256).Hash
  if ($hashAfterValidation -ne $candidateHash) {
    throw "El candidato cambio durante la validacion."
  }

  if ($DryRun) {
    Write-Host ""
    Write-Host "DRY RUN OK"
    Write-Host "players-data.js no fue modificado. No se creo commit ni se hizo push."
    exit 0
  }

  if (-not $validation.hasChanges) {
    Write-Host ""
    Write-Host "SIN CAMBIOS PARA PUBLICAR"
    Write-Host "El candidato es semanticamente identico al catalogo actual."
    exit 0
  }

  Write-Host ""
  Write-Host -NoNewline "Escribe PUBLICAR para continuar: "
  $confirmation = Read-Host
  if ($confirmation -cne "PUBLICAR") {
    Write-Host "Publicacion cancelada."
    exit 0
  }

  $BackupPath = Join-Path ([System.IO.Path]::GetTempPath()) ("xolugg-players-data-{0}-{1}.js" -f $PID, [guid]::NewGuid().ToString("N"))
  Copy-Item -LiteralPath $PlayersDataPath -Destination $BackupPath
  Copy-Item -LiteralPath $CandidatePath -Destination $PlayersDataPath -Force
  $Applied = $true

  Invoke-Native -Command "node" -Arguments @("--check", $PlayersDataPath) -Description "node --check players-data.js" | Out-Null
  Invoke-Git -Arguments @("diff", "--check") -Description "git diff --check" | Out-Null
  $appliedValidation = Invoke-CatalogValidator -CurrentPath $BackupPath -CandidatePath $PlayersDataPath
  if (-not $appliedValidation.valid) {
    throw "El archivo aplicado no supera la validacion semantica."
  }
  Invoke-Native -Command "node" -Arguments @("--test", $ValidatorTestPath) -Description "Tests del validador despues de copiar" | Out-Null
  $appliedHash = (Get-FileHash -LiteralPath $PlayersDataPath -Algorithm SHA256).Hash
  if ($appliedHash -ne $candidateHash) {
    throw "players-data.js no coincide con el SHA-256 validado."
  }

  $preStaged = Invoke-Git -Arguments @("diff", "--cached", "--name-only")
  if (@($preStaged.Output | Where-Object { "$_".Trim() }).Count -gt 0) {
    throw "Ya existen archivos staged. No se creara el commit."
  }
  Invoke-Git -Arguments @("add", "--", "players-data.js") | Out-Null
  Assert-OnlyPlayersDataStaged
  Invoke-Git -Arguments @("diff", "--cached", "--check") -Description "git diff --cached --check" | Out-Null

  $commitMessage = "Update FUTBIN market catalog - $(Get-Date -Format 'yyyy-MM-dd')"
  Invoke-Git -Arguments @("commit", "-m", $commitMessage) -Description "Creacion del commit" | Out-Null
  $Committed = $true
  $commitHash = "$((Invoke-Git -Arguments @('rev-parse', 'HEAD')).Output[0])".Trim()
  $branch = "$((Invoke-Git -Arguments @('branch', '--show-current')).Output[0])".Trim()

  $push = Invoke-Git -Arguments @("push", "origin", "main") -Description "git push origin main" -AllowFailure
  if ($push.ExitCode -ne 0) {
    $PushFailed = $true
    $detail = ($push.Output | ForEach-Object { "$_" }) -join [Environment]::NewLine
    throw "El commit $commitHash quedo local y el push fallo. GitHub puede haber rechazado el push directo por proteccion de rama. No se reintentara ni se usara force push.$([Environment]::NewLine)$detail"
  }

  Write-Host ""
  Write-Host ("PUBLICACI{0}N COMPLETADA" -f [char]0x00D3)
  Write-Host "- commit hash: $commitHash"
  Write-Host "- branch: $branch"
  Write-Host "- catalogo anterior: $($validation.summary.currentCatalog)"
  Write-Host "- catalogo nuevo: $($validation.summary.candidateCatalog)"
  Write-Host "- cartas nuevas: $($validation.summary.newCards)"
  Write-Host "- SHA-256 del candidato: $candidateHash"
} catch {
  if ($Applied -and -not $Committed -and $BackupPath -and (Test-Path -LiteralPath $BackupPath)) {
    Invoke-Git -Arguments @("restore", "--staged", "--", "players-data.js") -AllowFailure | Out-Null
    Copy-Item -LiteralPath $BackupPath -Destination $PlayersDataPath -Force
    Write-Host ("Actualizaci{0}n cancelada. players-data.js fue restaurado." -f [char]0x00F3)
  }
  Write-Error "ERROR: $($_.Exception.Message)"
  if ($PushFailed) { exit 5 }
  exit 1
} finally {
  if ($BackupPath -and (Test-Path -LiteralPath $BackupPath)) {
    Remove-Item -LiteralPath $BackupPath -Force
  }
}
