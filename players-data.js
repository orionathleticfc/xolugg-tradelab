/* =========================================================
   XOLUGG TRADELAB - POPULAR PLAYERS CATALOG
   Fuente: PDF "EA FC 27 Popular Players | FUTBIN"

   - 250 cartas extraídas de las páginas 1-16 del PDF.
   - Cada registro representa una CARTA, no únicamente un jugador.
   - precioReferencia conserva el primer valor económico mostrado
     por FUTBIN en el PDF; 0/no disponible se representa como null.
   - valorSecundarioFuente conserva el segundo valor mostrado,
     sin atribuirle un significado que el PDF exportado no etiqueta.
   - version/tipoCarta quedan en null cuando el PDF no los expone
     textualmente de forma inequívoca. No se inventan datos.
   - Los precios del usuario NO se guardan aquí; seguirán en
     localStorage y tendrán prioridad sobre precioReferencia.
========================================================= */

window.PLAYERS_DATA = [
  {
    "id": "barcola-85-lw-92-76-78-84-39-67",
    "nombre": "Barcola",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "RM",
      "LM",
      "RW"
    ],
    "stats": {
      "pac": 92,
      "sho": 76,
      "pas": 78,
      "dri": 84,
      "def": 39,
      "phy": 67
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 86.6,
    "popularidadFuente": 309,
    "precioReferencia": 58000,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 1,
      "precioPrincipalRaw": "58K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "frimpong-81-rb-94-62-74-82-72-62",
    "nombre": "Frimpong",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "RB",
    "posiciones": [
      "RB",
      "RM",
      "RW"
    ],
    "stats": {
      "pac": 94,
      "sho": 62,
      "pas": 74,
      "dri": 82,
      "def": 72,
      "phy": 62
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 83.5,
    "popularidadFuente": 275,
    "precioReferencia": 7000,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 1,
      "precioPrincipalRaw": "7K",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "messi-89-cam-76-87-89-90-33-63",
    "nombre": "Messi",
    "version": null,
    "tipoCarta": null,
    "ovr": 89,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "RM",
      "RW",
      "ST"
    ],
    "stats": {
      "pac": 76,
      "sho": 87,
      "pas": 89,
      "dri": 90,
      "def": 33,
      "phy": 63
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 91.8,
    "popularidadFuente": 241,
    "precioReferencia": 63000,
    "valorSecundarioFuente": 11000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 1,
      "precioPrincipalRaw": "63K",
      "valorSecundarioRaw": "11K"
    },
    "activo": true
  },
  {
    "id": "van-de-ven-81-cb-90-60-65-72-80-81",
    "nombre": "van de Ven",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB",
      "LB"
    ],
    "stats": {
      "pac": 90,
      "sho": 60,
      "pas": 65,
      "dri": 72,
      "def": 80,
      "phy": 81
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 82.1,
    "popularidadFuente": 238,
    "precioReferencia": null,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 1,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "gordon-82-lw-91-78-77-82-50-71",
    "nombre": "Gordon",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "LM",
      "ST"
    ],
    "stats": {
      "pac": 91,
      "sho": 78,
      "pas": 77,
      "dri": 82,
      "def": 50,
      "phy": 71
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 81.4,
    "popularidadFuente": 203,
    "precioReferencia": 5000,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 1,
      "precioPrincipalRaw": "5K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "vicky-lopez-84-rw-85-80-81-86-47-60",
    "nombre": "Vicky López",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "CDM",
      "RM",
      "CM",
      "CAM",
      "ST"
    ],
    "stats": {
      "pac": 85,
      "sho": 80,
      "pas": 81,
      "dri": 86,
      "def": 47,
      "phy": 60
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 84.2,
    "popularidadFuente": 196,
    "precioReferencia": 12750,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 1,
      "precioPrincipalRaw": "12.75K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "marmoush-82-lw-87-83-76-83-34-69",
    "nombre": "Marmoush",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "LM",
      "CAM",
      "ST"
    ],
    "stats": {
      "pac": 87,
      "sho": 83,
      "pas": 76,
      "dri": 83,
      "def": 34,
      "phy": 69
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 81.3,
    "popularidadFuente": 184,
    "precioReferencia": 8500,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 1,
      "precioPrincipalRaw": "8.5K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "rashford-82-lw-92-83-78-81-33-68",
    "nombre": "Rashford",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "LM",
      "ST"
    ],
    "stats": {
      "pac": 92,
      "sho": 83,
      "pas": 78,
      "dri": 81,
      "def": 33,
      "phy": 68
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 3,
    "ratingFuente": 82.4,
    "popularidadFuente": 180,
    "precioReferencia": 29750,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 1,
      "precioPrincipalRaw": "29.75K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "adeyemi-82-rm-95-80-72-82-36-69",
    "nombre": "Adeyemi",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "LM",
      "CAM",
      "RW",
      "ST",
      "LW"
    ],
    "stats": {
      "pac": 95,
      "sho": 80,
      "pas": 72,
      "dri": 82,
      "def": 36,
      "phy": 69
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 82.8,
    "popularidadFuente": 173,
    "precioReferencia": 26000,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 1,
      "precioPrincipalRaw": "26K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "pedro-neto-81-rm-91-76-77-82-40-70",
    "nombre": "Pedro Neto",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "LM",
      "RW",
      "LW"
    ],
    "stats": {
      "pac": 91,
      "sho": 76,
      "pas": 77,
      "dri": 82,
      "def": 40,
      "phy": 70
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 84.1,
    "popularidadFuente": 158,
    "precioReferencia": 5000,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 1,
      "precioPrincipalRaw": "5K",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "balde-82-lb-90-52-75-79-77-69",
    "nombre": "Balde",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "LM"
    ],
    "stats": {
      "pac": 90,
      "sho": 52,
      "pas": 75,
      "dri": 79,
      "def": 77,
      "phy": 69
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 81.2,
    "popularidadFuente": 155,
    "precioReferencia": 5000,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 1,
      "precioPrincipalRaw": "5K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "claudia-pina-89-lw-91-89-84-88-45-73",
    "nombre": "Claudia Pina",
    "version": null,
    "tipoCarta": null,
    "ovr": 89,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "LM",
      "ST"
    ],
    "stats": {
      "pac": 91,
      "sho": 89,
      "pas": 84,
      "dri": 88,
      "def": 45,
      "phy": 73
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 5,
    "ratingFuente": 91.5,
    "popularidadFuente": 155,
    "precioReferencia": 1000000,
    "valorSecundarioFuente": 11000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 1,
      "precioPrincipalRaw": "1M",
      "valorSecundarioRaw": "11K"
    },
    "activo": true
  },
  {
    "id": "lamine-yamal-91-rw-x-x-x-x-x-x",
    "nombre": "Lamine Yamal",
    "version": null,
    "tipoCarta": null,
    "ovr": 91,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM"
    ],
    "stats": {
      "pac": null,
      "sho": null,
      "pas": null,
      "dri": null,
      "def": null,
      "phy": null
    },
    "pie": "L",
    "skills": 5,
    "weakFoot": 3,
    "ratingFuente": 94.2,
    "popularidadFuente": 154,
    "precioReferencia": 7000000,
    "valorSecundarioFuente": 35620,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "7M",
      "valorSecundarioRaw": "35.62K"
    },
    "activo": true
  },
  {
    "id": "victor-munoz-79-lm-94-74-70-80-50-65",
    "nombre": "Víctor Muñoz",
    "version": null,
    "tipoCarta": null,
    "ovr": 79,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "RM",
      "RW",
      "LW"
    ],
    "stats": {
      "pac": 94,
      "sho": 74,
      "pas": 70,
      "dri": 80,
      "def": 50,
      "phy": 65
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 79.7,
    "popularidadFuente": 135,
    "precioReferencia": 3700,
    "valorSecundarioFuente": 160,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "3.7K",
      "valorSecundarioRaw": "160"
    },
    "activo": true
  },
  {
    "id": "szoboszlai-86-cam-82-83-86-84-74-77",
    "nombre": "Szoboszlai",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "RB",
      "CDM",
      "RM",
      "CM"
    ],
    "stats": {
      "pac": 82,
      "sho": 83,
      "pas": 86,
      "dri": 84,
      "def": 74,
      "phy": 77
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 85.8,
    "popularidadFuente": 132,
    "precioReferencia": 30750,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "30.75K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "alvaro-carreras-81-lb-86-66-77-80-75-81",
    "nombre": "Álvaro Carreras",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "CB",
      "LM"
    ],
    "stats": {
      "pac": 86,
      "sho": 66,
      "pas": 77,
      "dri": 80,
      "def": 75,
      "phy": 81
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 83.2,
    "popularidadFuente": 127,
    "precioReferencia": 9400,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "9.4K",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "kika-nazareth-83-cm-85-82-82-84-60-80",
    "nombre": "Kika Nazareth",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CAM",
      "ST"
    ],
    "stats": {
      "pac": 85,
      "sho": 82,
      "pas": 82,
      "dri": 84,
      "def": 60,
      "phy": 80
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 85.1,
    "popularidadFuente": 86,
    "precioReferencia": 9700,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "9.7K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "diomande-84-rw-93-77-75-87-47-70",
    "nombre": "Diomande",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 93,
      "sho": 77,
      "pas": 75,
      "dri": 87,
      "def": 47,
      "phy": 70
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 85.6,
    "popularidadFuente": 78,
    "precioReferencia": 49250,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "49.25K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "musiala-87-cam-79-81-79-90-62-65",
    "nombre": "Musiala",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 79,
      "sho": 81,
      "pas": 79,
      "dri": 90,
      "def": 62,
      "phy": 65
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 4,
    "ratingFuente": 89.1,
    "popularidadFuente": 78,
    "precioReferencia": 30250,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "30.25K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "lavelle-87-cam-85-79-84-87-60-65",
    "nombre": "Lavelle",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "CM",
      "ST"
    ],
    "stats": {
      "pac": 85,
      "sho": 79,
      "pas": 84,
      "dri": 87,
      "def": 60,
      "phy": 65
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 87.2,
    "popularidadFuente": 75,
    "precioReferencia": 8800,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "8.8K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "konate-84-cb-77-34-65-68-84-85",
    "nombre": "Konaté",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 77,
      "sho": 34,
      "pas": 65,
      "dri": 68,
      "def": 84,
      "phy": 85
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 82.1,
    "popularidadFuente": 72,
    "precioReferencia": 8000,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "8K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "matheus-nunes-83-rb-87-70-80-79-78-75",
    "nombre": "Matheus Nunes",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "RB",
    "posiciones": [
      "RB",
      "CM"
    ],
    "stats": {
      "pac": 87,
      "sho": 70,
      "pas": 80,
      "dri": 79,
      "def": 78,
      "phy": 75
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 80.6,
    "popularidadFuente": 70,
    "precioReferencia": 4300,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "4.3K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "wirtz-86-cam-77-79-86-88-54-61",
    "nombre": "Wirtz",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "CM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 77,
      "sho": 79,
      "pas": 86,
      "dri": 88,
      "def": 54,
      "phy": 61
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 87.6,
    "popularidadFuente": 69,
    "precioReferencia": 23750,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "23.75K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "lacroix-83-cb-86-46-63-69-84-83",
    "nombre": "Lacroix",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 86,
      "sho": 46,
      "pas": 63,
      "dri": 69,
      "def": 84,
      "phy": 83
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 84.9,
    "popularidadFuente": 63,
    "precioReferencia": null,
    "valorSecundarioFuente": 513,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "513"
    },
    "activo": true
  },
  {
    "id": "openda-80-st-94-79-69-78-30-75",
    "nombre": "Openda",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "CAM"
    ],
    "stats": {
      "pac": 94,
      "sho": 79,
      "pas": 69,
      "dri": 78,
      "def": 30,
      "phy": 75
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 82.8,
    "popularidadFuente": 63,
    "precioReferencia": 7000,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "7K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "lamine-yamal-91-rw-87-85-88-94-40-63",
    "nombre": "Lamine Yamal",
    "version": null,
    "tipoCarta": null,
    "ovr": 91,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM"
    ],
    "stats": {
      "pac": 87,
      "sho": 85,
      "pas": 88,
      "dri": 94,
      "def": 40,
      "phy": 63
    },
    "pie": "L",
    "skills": 5,
    "weakFoot": 3,
    "ratingFuente": 94.2,
    "popularidadFuente": 61,
    "precioReferencia": 1030000,
    "valorSecundarioFuente": 23750,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "1.03M",
      "valorSecundarioRaw": "23.75K"
    },
    "activo": true
  },
  {
    "id": "cherki-86-rw-74-79-85-91-41-67",
    "nombre": "Cherki",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM",
      "CM",
      "CAM"
    ],
    "stats": {
      "pac": 74,
      "sho": 79,
      "pas": 85,
      "dri": 91,
      "def": 41,
      "phy": 67
    },
    "pie": "L",
    "skills": 5,
    "weakFoot": 5,
    "ratingFuente": 88.4,
    "popularidadFuente": 60,
    "precioReferencia": 40000,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "40K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "diaby-82-rm-94-69-76-85-44-59",
    "nombre": "Diaby",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "LM",
      "RW",
      "LW"
    ],
    "stats": {
      "pac": 94,
      "sho": 69,
      "pas": 76,
      "dri": 85,
      "def": 44,
      "phy": 59
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 84.7,
    "popularidadFuente": 59,
    "precioReferencia": 3000,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 2,
      "precioPrincipalRaw": "3K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "goretzka-82-cdm-77-78-80-80-80-82",
    "nombre": "Goretzka",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "CDM",
    "posiciones": [
      "CDM",
      "CM"
    ],
    "stats": {
      "pac": 77,
      "sho": 78,
      "pas": 80,
      "dri": 80,
      "def": 80,
      "phy": 82
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 80.5,
    "popularidadFuente": 59,
    "precioReferencia": 2400,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "2.4K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "ekitike-85-st-86-83-72-84-33-73",
    "nombre": "Ekitiké",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "CAM"
    ],
    "stats": {
      "pac": 86,
      "sho": 83,
      "pas": 72,
      "dri": 84,
      "def": 33,
      "phy": 73
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 80.5,
    "popularidadFuente": 59,
    "precioReferencia": 33000,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "33K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "hincapie-84-lb-83-48-71-72-84-81",
    "nombre": "Hincapié",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "CB"
    ],
    "stats": {
      "pac": 83,
      "sho": 48,
      "pas": 71,
      "dri": 72,
      "def": 84,
      "phy": 81
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 2,
    "ratingFuente": 82.7,
    "popularidadFuente": 58,
    "precioReferencia": 14500,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "14.5K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "rodman-87-lm-91-82-81-83-55-82",
    "nombre": "Rodman",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "RM",
      "RW",
      "LW"
    ],
    "stats": {
      "pac": 91,
      "sho": 82,
      "pas": 81,
      "dri": 83,
      "def": 55,
      "phy": 82
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 84.9,
    "popularidadFuente": 57,
    "precioReferencia": 25500,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "25.5K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "camavinga-81-cm-79-67-80-82-78-80",
    "nombre": "Camavinga",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "LB",
      "CDM"
    ],
    "stats": {
      "pac": 79,
      "sho": 67,
      "pas": 80,
      "dri": 82,
      "def": 78,
      "phy": 80
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 81.4,
    "popularidadFuente": 56,
    "precioReferencia": 4600,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "4.6K",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "rodrygo-84-lw-87-77-79-87-33-63",
    "nombre": "Rodrygo",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "RM",
      "LM",
      "CAM",
      "RW",
      "ST"
    ],
    "stats": {
      "pac": 87,
      "sho": 77,
      "pas": 79,
      "dri": 87,
      "def": 33,
      "phy": 63
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 83.4,
    "popularidadFuente": 56,
    "precioReferencia": 21500,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "21.5K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "salah-87-rm-84-83-83-86-45-72",
    "nombre": "Salah",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "CAM",
      "RW",
      "ST"
    ],
    "stats": {
      "pac": 84,
      "sho": 83,
      "pas": 83,
      "dri": 86,
      "def": 45,
      "phy": 72
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 88.9,
    "popularidadFuente": 56,
    "precioReferencia": 18000,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "18K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "yldz-84-cam-85-81-79-85-59-70",
    "nombre": "Yıldız",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "LM",
      "ST",
      "LW"
    ],
    "stats": {
      "pac": 85,
      "sho": 81,
      "pas": 79,
      "dri": 85,
      "def": 59,
      "phy": 70
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 5,
    "ratingFuente": 83.9,
    "popularidadFuente": 54,
    "precioReferencia": 7300,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "7.3K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "eder-militao-84-cb-79-54-71-72-85-82",
    "nombre": "Éder Militão",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 79,
      "sho": 54,
      "pas": 71,
      "dri": 72,
      "def": 85,
      "phy": 82
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 83.7,
    "popularidadFuente": 53,
    "precioReferencia": 18000,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "18K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "marquinhos-87-cb-74-56-75-73-89-78",
    "nombre": "Marquinhos",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 74,
      "sho": 56,
      "pas": 75,
      "dri": 73,
      "def": 89,
      "phy": 78
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 85.4,
    "popularidadFuente": 53,
    "precioReferencia": 13750,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "13.75K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "lamine-yamal-90-rw-86-84-87-93-38-61",
    "nombre": "Lamine Yamal",
    "version": null,
    "tipoCarta": null,
    "ovr": 90,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM"
    ],
    "stats": {
      "pac": 86,
      "sho": 84,
      "pas": 87,
      "dri": 93,
      "def": 38,
      "phy": 61
    },
    "pie": "L",
    "skills": 5,
    "weakFoot": 3,
    "ratingFuente": 91.9,
    "popularidadFuente": 51,
    "precioReferencia": 550000,
    "valorSecundarioFuente": 14000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "550K",
      "valorSecundarioRaw": "14K"
    },
    "activo": true
  },
  {
    "id": "gravenberch-85-cdm-79-76-81-83-80-80",
    "nombre": "Gravenberch",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CDM",
    "posiciones": [
      "CDM",
      "CM"
    ],
    "stats": {
      "pac": 79,
      "sho": 76,
      "pas": 81,
      "dri": 83,
      "def": 80,
      "phy": 80
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 82.2,
    "popularidadFuente": 50,
    "precioReferencia": 34000,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "34K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "inaki-williams-80-rw-92-79-74-77-47-83",
    "nombre": "Iñaki Williams",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM",
      "ST"
    ],
    "stats": {
      "pac": 92,
      "sho": 79,
      "pas": 74,
      "dri": 77,
      "def": 47,
      "phy": 83
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 80.7,
    "popularidadFuente": 50,
    "precioReferencia": 3100,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "3.1K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "hasegawa-88-cdm-77-71-86-88-81-68",
    "nombre": "Hasegawa",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "CDM",
    "posiciones": [
      "CDM",
      "CM",
      "CAM"
    ],
    "stats": {
      "pac": 77,
      "sho": 71,
      "pas": 86,
      "dri": 88,
      "def": 81,
      "phy": 68
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 87.4,
    "popularidadFuente": 49,
    "precioReferencia": 6300,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "6.3K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "doku-84-lw-91-75-78-88-40-72",
    "nombre": "Doku",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "RM",
      "LM",
      "RW"
    ],
    "stats": {
      "pac": 91,
      "sho": 75,
      "pas": 78,
      "dri": 88,
      "def": 40,
      "phy": 72
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 90.4,
    "popularidadFuente": 49,
    "precioReferencia": 45000,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "45K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "eric-garcia-85-cb-79-58-77-76-86-82",
    "nombre": "Eric García",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB",
      "RB",
      "CDM",
      "CM"
    ],
    "stats": {
      "pac": 79,
      "sho": 58,
      "pas": 77,
      "dri": 76,
      "def": 86,
      "phy": 82
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 85.1,
    "popularidadFuente": 49,
    "precioReferencia": 23750,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 3,
      "precioPrincipalRaw": "23.75K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "joao-neves-88-cm-72-75-84-87-86-82",
    "nombre": "João Neves",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM"
    ],
    "stats": {
      "pac": 72,
      "sho": 75,
      "pas": 84,
      "dri": 87,
      "def": 86,
      "phy": 82
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 90.2,
    "popularidadFuente": 48,
    "precioReferencia": 32750,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "32.75K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "endrick-79-st-87-81-66-80-30-73",
    "nombre": "Endrick",
    "version": null,
    "tipoCarta": null,
    "ovr": 79,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "RM",
      "CAM",
      "RW"
    ],
    "stats": {
      "pac": 87,
      "sho": 81,
      "pas": 66,
      "dri": 80,
      "def": 30,
      "phy": 73
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 2,
    "ratingFuente": 80.4,
    "popularidadFuente": 48,
    "precioReferencia": 2600,
    "valorSecundarioFuente": 160,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "2.6K",
      "valorSecundarioRaw": "160"
    },
    "activo": true
  },
  {
    "id": "aguero-86-st-85-86-73-84-30-70",
    "nombre": "Agüero",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": 85,
      "sho": 86,
      "pas": 73,
      "dri": 84,
      "def": 30,
      "phy": 70
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 88.6,
    "popularidadFuente": 47,
    "precioReferencia": null,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "malen-83-st-86-83-73-85-38-68",
    "nombre": "Malen",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": 86,
      "sho": 83,
      "pas": 73,
      "dri": 85,
      "def": 38,
      "phy": 68
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 82.4,
    "popularidadFuente": 47,
    "precioReferencia": 6900,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "6.9K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "joao-cancelo-83-lb-84-72-84-85-77-72",
    "nombre": "João Cancelo",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "RB",
      "RM",
      "LM"
    ],
    "stats": {
      "pac": 84,
      "sho": 72,
      "pas": 84,
      "dri": 85,
      "def": 77,
      "phy": 72
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 83.8,
    "popularidadFuente": 47,
    "precioReferencia": 2300,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "2.3K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "upamecano-87-cb-80-45-65-75-86-83",
    "nombre": "Upamecano",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 80,
      "sho": 45,
      "pas": 65,
      "dri": 75,
      "def": 86,
      "phy": 83
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 86.2,
    "popularidadFuente": 47,
    "precioReferencia": 59500,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "59.5K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "lacroix-82-cb-86-45-61-67-83-82",
    "nombre": "Lacroix",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 86,
      "sho": 45,
      "pas": 61,
      "dri": 67,
      "def": 83,
      "phy": 82
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 2,
    "ratingFuente": 81.9,
    "popularidadFuente": 46,
    "precioReferencia": 25500,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "25.5K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "khusanov-82-cb-88-39-64-68-83-80",
    "nombre": "Khusanov",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 88,
      "sho": 39,
      "pas": 64,
      "dri": 68,
      "def": 83,
      "phy": 80
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 83.6,
    "popularidadFuente": 46,
    "precioReferencia": 36750,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "36.75K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "davies-82-lb-93-66-78-84-74-76",
    "nombre": "Davies",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "LM"
    ],
    "stats": {
      "pac": 93,
      "sho": 66,
      "pas": 78,
      "dri": 84,
      "def": 74,
      "phy": 76
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 82.6,
    "popularidadFuente": 46,
    "precioReferencia": 6200,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "6.2K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "mario-gila-81-cb-85-53-68-75-81-79",
    "nombre": "Mario Gila",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 85,
      "sho": 53,
      "pas": 68,
      "dri": 75,
      "def": 81,
      "phy": 79
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 4,
    "ratingFuente": 80.9,
    "popularidadFuente": 46,
    "precioReferencia": 2400,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "2.4K",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "palestra-78-rb-90-65-69-80-70-81",
    "nombre": "Palestra",
    "version": null,
    "tipoCarta": null,
    "ovr": 78,
    "posicionPrincipal": "RB",
    "posiciones": [
      "RB",
      "RM"
    ],
    "stats": {
      "pac": 90,
      "sho": 65,
      "pas": 69,
      "dri": 80,
      "def": 70,
      "phy": 81
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 77.8,
    "popularidadFuente": 45,
    "precioReferencia": 3500,
    "valorSecundarioFuente": 140,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "3.5K",
      "valorSecundarioRaw": "140"
    },
    "activo": true
  },
  {
    "id": "kimmich-88-cdm-71-73-90-84-81-79",
    "nombre": "Kimmich",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "CDM",
    "posiciones": [
      "CDM",
      "RB",
      "CM"
    ],
    "stats": {
      "pac": 71,
      "sho": 73,
      "pas": 90,
      "dri": 84,
      "def": 81,
      "phy": 79
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 88.8,
    "popularidadFuente": 44,
    "precioReferencia": 8700,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "8.7K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "karchaoui-87-cm-89-76-87-88-79-72",
    "nombre": "Karchaoui",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "LB",
      "CDM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 89,
      "sho": 76,
      "pas": 87,
      "dri": 88,
      "def": 79,
      "phy": 72
    },
    "pie": "L",
    "skills": 5,
    "weakFoot": 4,
    "ratingFuente": 90.3,
    "popularidadFuente": 44,
    "precioReferencia": 46250,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "46.25K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "estevao-80-rm-89-76-75-84-33-57",
    "nombre": "Estêvão",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "RW"
    ],
    "stats": {
      "pac": 89,
      "sho": 76,
      "pas": 75,
      "dri": 84,
      "def": 33,
      "phy": 57
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 82.3,
    "popularidadFuente": 44,
    "precioReferencia": 3000,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "3K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "isak-86-st-81-87-72-82-39-72",
    "nombre": "Isak",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": 81,
      "sho": 87,
      "pas": 72,
      "dri": 82,
      "def": 39,
      "phy": 72
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 84.7,
    "popularidadFuente": 44,
    "precioReferencia": 19000,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "19K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "palmer-85-cam-75-83-85-85-50-64",
    "nombre": "Palmer",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "RM",
      "CM",
      "RW"
    ],
    "stats": {
      "pac": 75,
      "sho": 83,
      "pas": 85,
      "dri": 85,
      "def": 50,
      "phy": 64
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 86.8,
    "popularidadFuente": 43,
    "precioReferencia": 9600,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 4,
      "precioPrincipalRaw": "9.6K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "pedri-90-cm-76-75-89-91-77-75",
    "nombre": "Pedri",
    "version": null,
    "tipoCarta": null,
    "ovr": 90,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM",
      "CAM"
    ],
    "stats": {
      "pac": 76,
      "sho": 75,
      "pas": 89,
      "dri": 91,
      "def": 77,
      "phy": 75
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 93.1,
    "popularidadFuente": 43,
    "precioReferencia": 220000,
    "valorSecundarioFuente": 14000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "220K",
      "valorSecundarioRaw": "14K"
    },
    "activo": true
  },
  {
    "id": "bruno-fernandes-89-cam-67-85-92-85-68-75",
    "nombre": "Bruno Fernandes",
    "version": null,
    "tipoCarta": null,
    "ovr": 89,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "CM"
    ],
    "stats": {
      "pac": 67,
      "sho": 85,
      "pas": 92,
      "dri": 85,
      "def": 68,
      "phy": 75
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 89.9,
    "popularidadFuente": 42,
    "precioReferencia": 26000,
    "valorSecundarioFuente": 11000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "26K",
      "valorSecundarioRaw": "11K"
    },
    "activo": true
  },
  {
    "id": "rafael-leao-83-lw-93-79-79-83-30-73",
    "nombre": "Rafael Leão",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "LM",
      "CAM",
      "ST"
    ],
    "stats": {
      "pac": 93,
      "sho": 79,
      "pas": 79,
      "dri": 83,
      "def": 30,
      "phy": 73
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 4,
    "ratingFuente": 84.0,
    "popularidadFuente": 41,
    "precioReferencia": 24000,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "24K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "marmoush-82-lw-87-83-76-83-34-69-2",
    "nombre": "Marmoush",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "ST",
      "LM",
      "CAM"
    ],
    "stats": {
      "pac": 87,
      "sho": 83,
      "pas": 76,
      "dri": 83,
      "def": 34,
      "phy": 69
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 80.7,
    "popularidadFuente": 41,
    "precioReferencia": null,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "araujo-80-cb-79-54-64-59-78-81",
    "nombre": "Araujo",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB",
      "RB"
    ],
    "stats": {
      "pac": 79,
      "sho": 54,
      "pas": 64,
      "dri": 59,
      "def": 78,
      "phy": 81
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 80.8,
    "popularidadFuente": 40,
    "precioReferencia": 5500,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "5.5K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "diaz-88-lm-82-82-83-87-44-74",
    "nombre": "Díaz",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "ST",
      "LW"
    ],
    "stats": {
      "pac": 82,
      "sho": 82,
      "pas": 83,
      "dri": 87,
      "def": 44,
      "phy": 74
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 85.9,
    "popularidadFuente": 40,
    "precioReferencia": 21000,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "21K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "van-dijk-88-cb-70-60-72-70-89-85",
    "nombre": "van Dijk",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 70,
      "sho": 60,
      "pas": 72,
      "dri": 70,
      "def": 89,
      "phy": 85
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 87.3,
    "popularidadFuente": 40,
    "precioReferencia": 83500,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "83.5K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "tomori-80-cb-85-40-63-68-80-80",
    "nombre": "Tomori",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 85,
      "sho": 40,
      "pas": 63,
      "dri": 68,
      "def": 80,
      "phy": 80
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 4,
    "ratingFuente": 81.0,
    "popularidadFuente": 40,
    "precioReferencia": 4400,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "4.4K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "chawinga-89-lm-91-83-81-86-46-84",
    "nombre": "Chawinga",
    "version": null,
    "tipoCarta": null,
    "ovr": 89,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 91,
      "sho": 83,
      "pas": 81,
      "dri": 86,
      "def": 46,
      "phy": 84
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 87.5,
    "popularidadFuente": 39,
    "precioReferencia": 35500,
    "valorSecundarioFuente": 11000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "35.5K",
      "valorSecundarioRaw": "11K"
    },
    "activo": true
  },
  {
    "id": "tonali-85-cdm-79-74-82-80-81-84",
    "nombre": "Tonali",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CDM",
    "posiciones": [
      "CDM",
      "CM"
    ],
    "stats": {
      "pac": 79,
      "sho": 74,
      "pas": 82,
      "dri": 80,
      "def": 81,
      "phy": 84
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 82.6,
    "popularidadFuente": 39,
    "precioReferencia": 20000,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "20K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "kounde-85-rb-82-53-74-78-83-83",
    "nombre": "Koundé",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "RB",
    "posiciones": [
      "RB",
      "CB",
      "RM"
    ],
    "stats": {
      "pac": 82,
      "sho": 53,
      "pas": 74,
      "dri": 78,
      "def": 83,
      "phy": 83
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 80.9,
    "popularidadFuente": 39,
    "precioReferencia": 29250,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "29.25K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "hernandez-82-lb-89-78-78-82-76-83",
    "nombre": "Hernández",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "LM"
    ],
    "stats": {
      "pac": 89,
      "sho": 78,
      "pas": 78,
      "dri": 82,
      "def": 76,
      "phy": 83
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 83.6,
    "popularidadFuente": 39,
    "precioReferencia": 22000,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "22K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "bremer-86-cb-85-52-59-68-87-85",
    "nombre": "Bremer",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 85,
      "sho": 52,
      "pas": 59,
      "dri": 68,
      "def": 87,
      "phy": 85
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 2,
    "ratingFuente": 86.4,
    "popularidadFuente": 39,
    "precioReferencia": 27500,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "27.5K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "ferran-torres-84-st-88-84-78-82-40-74",
    "nombre": "Ferran Torres",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 88,
      "sho": 84,
      "pas": 78,
      "dri": 82,
      "def": 40,
      "phy": 74
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 83.2,
    "popularidadFuente": 38,
    "precioReferencia": 11000,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "11K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "greenwood-83-rm-83-85-78-84-37-63",
    "nombre": "Greenwood",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "CAM",
      "RW",
      "ST"
    ],
    "stats": {
      "pac": 83,
      "sho": 85,
      "pas": 78,
      "dri": 84,
      "def": 37,
      "phy": 63
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 5,
    "ratingFuente": 85.1,
    "popularidadFuente": 38,
    "precioReferencia": 5200,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "5.2K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "olise-90-rm-83-82-89-91-47-69",
    "nombre": "Olise",
    "version": null,
    "tipoCarta": null,
    "ovr": 90,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "CAM",
      "RW"
    ],
    "stats": {
      "pac": 83,
      "sho": 82,
      "pas": 89,
      "dri": 91,
      "def": 47,
      "phy": 69
    },
    "pie": "L",
    "skills": 5,
    "weakFoot": 3,
    "ratingFuente": 92.0,
    "popularidadFuente": 38,
    "precioReferencia": 265000,
    "valorSecundarioFuente": 14000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 5,
      "precioPrincipalRaw": "265K",
      "valorSecundarioRaw": "14K"
    },
    "activo": true
  },
  {
    "id": "barella-87-cm-77-78-84-86-81-72",
    "nombre": "Barella",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM"
    ],
    "stats": {
      "pac": 77,
      "sho": 78,
      "pas": 84,
      "dri": 86,
      "def": 81,
      "phy": 72
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 86.8,
    "popularidadFuente": 38,
    "precioReferencia": 10500,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "10.5K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "lookman-83-st-86-83-73-84-32-68",
    "nombre": "Lookman",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "LM",
      "CAM",
      "LW"
    ],
    "stats": {
      "pac": 86,
      "sho": 83,
      "pas": 73,
      "dri": 84,
      "def": 32,
      "phy": 68
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 83.0,
    "popularidadFuente": 38,
    "precioReferencia": 7000,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "7K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "rice-88-cdm-72-75-86-81-85-84",
    "nombre": "Rice",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "CDM",
    "posiciones": [
      "CDM",
      "CM"
    ],
    "stats": {
      "pac": 72,
      "sho": 75,
      "pas": 86,
      "dri": 81,
      "def": 85,
      "phy": 84
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 84.5,
    "popularidadFuente": 37,
    "precioReferencia": 9800,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "9.8K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "pau-cubarsi-86-cb-78-44-69-77-85-81",
    "nombre": "Pau Cubarsí",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 78,
      "sho": 44,
      "pas": 69,
      "dri": 77,
      "def": 85,
      "phy": 81
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 4,
    "ratingFuente": 82.0,
    "popularidadFuente": 37,
    "precioReferencia": 13500,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "13.5K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "guler-83-rm-77-79-85-84-55-57",
    "nombre": "Güler",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "CDM",
      "CM",
      "CAM",
      "RW"
    ],
    "stats": {
      "pac": 77,
      "sho": 79,
      "pas": 85,
      "dri": 84,
      "def": 55,
      "phy": 57
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 84.7,
    "popularidadFuente": 37,
    "precioReferencia": 2200,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "2.2K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "patri-guijarro-88-cdm-78-82-83-88-84-88",
    "nombre": "Patri Guijarro",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "CDM",
    "posiciones": [
      "CDM",
      "CM"
    ],
    "stats": {
      "pac": 78,
      "sho": 82,
      "pas": 83,
      "dri": 88,
      "def": 84,
      "phy": 88
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 90.0,
    "popularidadFuente": 37,
    "precioReferencia": 99500,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "99.5K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "tchouameni-84-cdm-74-70-79-77-83-82",
    "nombre": "Tchouaméni",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "CDM",
    "posiciones": [
      "CDM",
      "CB",
      "CM"
    ],
    "stats": {
      "pac": 74,
      "sho": 70,
      "pas": 79,
      "dri": 77,
      "def": 83,
      "phy": 82
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 85.8,
    "popularidadFuente": 37,
    "precioReferencia": 24500,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "24.5K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "laimer-85-rb-86-69-78-77-81-77",
    "nombre": "Laimer",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "RB",
    "posiciones": [
      "RB",
      "LB",
      "CDM",
      "RM"
    ],
    "stats": {
      "pac": 86,
      "sho": 69,
      "pas": 78,
      "dri": 77,
      "def": 81,
      "phy": 77
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 82.9,
    "popularidadFuente": 36,
    "precioReferencia": 8900,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "8.9K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "pulisic-83-cam-87-83-81-84-47-60",
    "nombre": "Pulisic",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "RM",
      "RW",
      "ST"
    ],
    "stats": {
      "pac": 87,
      "sho": 83,
      "pas": 81,
      "dri": 84,
      "def": 47,
      "phy": 60
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 5,
    "ratingFuente": 87.5,
    "popularidadFuente": 36,
    "precioReferencia": 15750,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "15.75K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "reijnders-84-cm-75-78-81-83-71-76",
    "nombre": "Reijnders",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM",
      "CAM"
    ],
    "stats": {
      "pac": 75,
      "sho": 78,
      "pas": 81,
      "dri": 83,
      "def": 71,
      "phy": 76
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 82.3,
    "popularidadFuente": 35,
    "precioReferencia": 3900,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "3.9K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "banda-88-st-92-84-64-80-33-82",
    "nombre": "Banda",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "CAM"
    ],
    "stats": {
      "pac": 92,
      "sho": 84,
      "pas": 64,
      "dri": 80,
      "def": 33,
      "phy": 82
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 85.6,
    "popularidadFuente": 35,
    "precioReferencia": 8900,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "8.9K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "caicedo-85-lw-93-75-78-89-37-68",
    "nombre": "Caicedo",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "CM",
      "LM",
      "CAM"
    ],
    "stats": {
      "pac": 93,
      "sho": 75,
      "pas": 78,
      "dri": 89,
      "def": 37,
      "phy": 68
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 86.5,
    "popularidadFuente": 35,
    "precioReferencia": 10000,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "10K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "alvarez-86-st-86-86-82-87-58-77",
    "nombre": "Alvarez",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "CAM"
    ],
    "stats": {
      "pac": 86,
      "sho": 86,
      "pas": 82,
      "dri": 87,
      "def": 58,
      "phy": 77
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 87.6,
    "popularidadFuente": 35,
    "precioReferencia": 63000,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "63K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "o-reilly-83-lb-83-70-78-79-81-81",
    "nombre": "O'Reilly",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "CDM",
      "CM"
    ],
    "stats": {
      "pac": 83,
      "sho": 70,
      "pas": 78,
      "dri": 79,
      "def": 81,
      "phy": 81
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 2,
    "ratingFuente": 77.7,
    "popularidadFuente": 34,
    "precioReferencia": 4800,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "4.8K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "salma-paralluelo-87-lw-93-84-79-85-46-78",
    "nombre": "Salma Paralluelo",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "RM",
      "LM",
      "CAM",
      "RW",
      "ST"
    ],
    "stats": {
      "pac": 93,
      "sho": 84,
      "pas": 79,
      "dri": 85,
      "def": 46,
      "phy": 78
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 87.1,
    "popularidadFuente": 34,
    "precioReferencia": 100000,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "100K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "nico-williams-84-lw-93-77-79-86-37-67",
    "nombre": "Nico Williams",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "LM"
    ],
    "stats": {
      "pac": 93,
      "sho": 77,
      "pas": 79,
      "dri": 86,
      "def": 37,
      "phy": 67
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 5,
    "ratingFuente": 86.5,
    "popularidadFuente": 34,
    "precioReferencia": 52000,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 6,
      "precioPrincipalRaw": "52K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "chiesa-80-rm-87-79-75-83-44-68",
    "nombre": "Chiesa",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "RW",
      "ST"
    ],
    "stats": {
      "pac": 87,
      "sho": 79,
      "pas": 75,
      "dri": 83,
      "def": 44,
      "phy": 68
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 82.4,
    "popularidadFuente": 33,
    "precioReferencia": 4000,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "4K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "cristiano-ronaldo-84-st-67-88-75-78-33-75",
    "nombre": "Cristiano Ronaldo",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": 67,
      "sho": 88,
      "pas": 75,
      "dri": 78,
      "def": 33,
      "phy": 75
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 81.1,
    "popularidadFuente": 33,
    "precioReferencia": 2000,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "2K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "mbappe-91-st-96-91-80-92-29-76",
    "nombre": "Mbappé",
    "version": null,
    "tipoCarta": null,
    "ovr": 91,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "LW"
    ],
    "stats": {
      "pac": 96,
      "sho": 91,
      "pas": 80,
      "dri": 92,
      "def": 29,
      "phy": 76
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 4,
    "ratingFuente": 95.4,
    "popularidadFuente": 33,
    "precioReferencia": 3350000,
    "valorSecundarioFuente": 19000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "3.35M",
      "valorSecundarioRaw": "19K"
    },
    "activo": true
  },
  {
    "id": "thuram-81-cm-79-74-78-79-81-85",
    "nombre": "Thuram",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM"
    ],
    "stats": {
      "pac": 79,
      "sho": 74,
      "pas": 78,
      "dri": 79,
      "def": 81,
      "phy": 85
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 81.2,
    "popularidadFuente": 33,
    "precioReferencia": 4000,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "4K",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "rogers-84-cam-76-82-82-84-67-78",
    "nombre": "Rogers",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "CM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 76,
      "sho": 82,
      "pas": 82,
      "dri": 84,
      "def": 67,
      "phy": 78
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 83.5,
    "popularidadFuente": 33,
    "precioReferencia": 3900,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "3.9K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "pajor-89-st-93-91-65-89-22-72",
    "nombre": "Pajor",
    "version": null,
    "tipoCarta": null,
    "ovr": 89,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "LM",
      "CAM",
      "LW"
    ],
    "stats": {
      "pac": 93,
      "sho": 91,
      "pas": 65,
      "dri": 89,
      "def": 22,
      "phy": 72
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 89.4,
    "popularidadFuente": 33,
    "precioReferencia": null,
    "valorSecundarioFuente": 11000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "11K"
    },
    "activo": true
  },
  {
    "id": "marcos-llorente-85-rb-91-79-80-82-79-83",
    "nombre": "Marcos Llorente",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "RB",
    "posiciones": [
      "RB",
      "RM",
      "CM"
    ],
    "stats": {
      "pac": 91,
      "sho": 79,
      "pas": 80,
      "dri": 82,
      "def": 79,
      "phy": 83
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 88.1,
    "popularidadFuente": 32,
    "precioReferencia": 68000,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "68K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "raphinha-88-lw-91-86-85-87-54-76",
    "nombre": "Raphinha",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "RM",
      "LM",
      "CAM",
      "RW",
      "ST"
    ],
    "stats": {
      "pac": 91,
      "sho": 86,
      "pas": 85,
      "dri": 87,
      "def": 54,
      "phy": 76
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 91.7,
    "popularidadFuente": 32,
    "precioReferencia": 400000,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "400K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "alvaro-carreras-83-lb-88-69-80-82-78-83",
    "nombre": "Álvaro Carreras",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "CB",
      "LM"
    ],
    "stats": {
      "pac": 88,
      "sho": 69,
      "pas": 80,
      "dri": 82,
      "def": 78,
      "phy": 83
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 87.3,
    "popularidadFuente": 32,
    "precioReferencia": 129000,
    "valorSecundarioFuente": 513,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "129K",
      "valorSecundarioRaw": "513"
    },
    "activo": true
  },
  {
    "id": "ibanez-83-cb-87-48-58-69-83-86",
    "nombre": "Ibañez",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB",
      "RB"
    ],
    "stats": {
      "pac": 87,
      "sho": 48,
      "pas": 58,
      "dri": 69,
      "def": 83,
      "phy": 86
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 2,
    "ratingFuente": 84.7,
    "popularidadFuente": 31,
    "precioReferencia": 23000,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "23K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "spence-80-lb-89-54-71-79-76-75",
    "nombre": "Spence",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "RB"
    ],
    "stats": {
      "pac": 89,
      "sho": 54,
      "pas": 71,
      "dri": 79,
      "def": 76,
      "phy": 75
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 79.2,
    "popularidadFuente": 31,
    "precioReferencia": 2400,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "2.4K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "pablo-barrios-83-cm-80-71-78-83-75-78",
    "nombre": "Pablo Barrios",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM"
    ],
    "stats": {
      "pac": 80,
      "sho": 71,
      "pas": 78,
      "dri": 83,
      "def": 75,
      "phy": 78
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 80.8,
    "popularidadFuente": 30,
    "precioReferencia": 1900,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "1.9K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "adeyemi-83-rm-95-82-75-83-38-70",
    "nombre": "Adeyemi",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "LM",
      "CAM",
      "RW",
      "ST",
      "LW"
    ],
    "stats": {
      "pac": 95,
      "sho": 82,
      "pas": 75,
      "dri": 83,
      "def": 38,
      "phy": 70
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 85.5,
    "popularidadFuente": 30,
    "precioReferencia": null,
    "valorSecundarioFuente": 513,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "513"
    },
    "activo": true
  },
  {
    "id": "remy-84-st-91-84-70-78-37-72",
    "nombre": "Remy",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "RM",
      "RW"
    ],
    "stats": {
      "pac": 91,
      "sho": 84,
      "pas": 70,
      "dri": 78,
      "def": 37,
      "phy": 72
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 85.8,
    "popularidadFuente": 30,
    "precioReferencia": null,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "wesley-80-lb-90-63-75-81-75-77",
    "nombre": "Wesley",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "RB",
      "RM",
      "LM"
    ],
    "stats": {
      "pac": 90,
      "sho": 63,
      "pas": 75,
      "dri": 81,
      "def": 75,
      "phy": 77
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 79.9,
    "popularidadFuente": 30,
    "precioReferencia": 2100,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "2.1K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "mctominay-86-cm-80-83-77-82-80-86",
    "nombre": "McTominay",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM",
      "CAM"
    ],
    "stats": {
      "pac": 80,
      "sho": 83,
      "pas": 77,
      "dri": 82,
      "def": 80,
      "phy": 86
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 81.0,
    "popularidadFuente": 29,
    "precioReferencia": 6800,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 7,
      "precioPrincipalRaw": "6.8K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "foden-84-cam-77-82-82-88-57-53",
    "nombre": "Foden",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "RM",
      "CM",
      "RW"
    ],
    "stats": {
      "pac": 77,
      "sho": 82,
      "pas": 82,
      "dri": 88,
      "def": 57,
      "phy": 53
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 2,
    "ratingFuente": 84.0,
    "popularidadFuente": 29,
    "precioReferencia": 2300,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "2.3K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "dos-santos-84-st-87-83-75-88-32-58",
    "nombre": "Dos Santos",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "RM",
      "LM",
      "CAM",
      "RW",
      "LW"
    ],
    "stats": {
      "pac": 87,
      "sho": 83,
      "pas": 75,
      "dri": 88,
      "def": 32,
      "phy": 58
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 86.1,
    "popularidadFuente": 29,
    "precioReferencia": null,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "rudiger-83-cb-75-54-71-69-83-85",
    "nombre": "Rüdiger",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 75,
      "sho": 54,
      "pas": 71,
      "dri": 69,
      "def": 83,
      "phy": 85
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 83.7,
    "popularidadFuente": 29,
    "precioReferencia": 4000,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "4K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "brugts-85-lb-88-75-80-82-82-76",
    "nombre": "Brugts",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "CM",
      "LM",
      "CAM",
      "ST",
      "LW"
    ],
    "stats": {
      "pac": 88,
      "sho": 75,
      "pas": 80,
      "dri": 82,
      "def": 82,
      "phy": 76
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 83.9,
    "popularidadFuente": 28,
    "precioReferencia": 29750,
    "valorSecundarioFuente": 2620,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "29.75K",
      "valorSecundarioRaw": "2.62K"
    },
    "activo": true
  },
  {
    "id": "quinones-84-st-91-83-70-81-37-82",
    "nombre": "Quiñones",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "LM",
      "CAM",
      "LW"
    ],
    "stats": {
      "pac": 91,
      "sho": 83,
      "pas": 70,
      "dri": 81,
      "def": 37,
      "phy": 82
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 82.6,
    "popularidadFuente": 28,
    "precioReferencia": 6500,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "6.5K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "sesko-82-st-85-82-67-78-46-77",
    "nombre": "Šeško",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": 85,
      "sho": 82,
      "pas": 67,
      "dri": 78,
      "def": 46,
      "phy": 77
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 81.4,
    "popularidadFuente": 28,
    "precioReferencia": 2500,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "2.5K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "zaire-emery-83-cm-79-71-78-81-79-85",
    "nombre": "Zaïre-Emery",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "RB",
      "CDM",
      "RM"
    ],
    "stats": {
      "pac": 79,
      "sho": 71,
      "pas": 78,
      "dri": 81,
      "def": 79,
      "phy": 85
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 83.9,
    "popularidadFuente": 28,
    "precioReferencia": 5700,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "5.7K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "moleiro-82-lm-86-76-77-84-51-68",
    "nombre": "Moleiro",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "CM",
      "CAM",
      "LW"
    ],
    "stats": {
      "pac": 86,
      "sho": 76,
      "pas": 77,
      "dri": 84,
      "def": 51,
      "phy": 68
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 84.2,
    "popularidadFuente": 28,
    "precioReferencia": 1000,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "1K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "mbeumo-84-rm-89-83-78-86-49-75",
    "nombre": "Mbeumo",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "RW",
      "ST"
    ],
    "stats": {
      "pac": 89,
      "sho": 83,
      "pas": 78,
      "dri": 86,
      "def": 49,
      "phy": 75
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 2,
    "ratingFuente": 86.1,
    "popularidadFuente": 28,
    "precioReferencia": 19750,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "19.75K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "dybala-85-cam-77-84-85-86-42-62",
    "nombre": "Dybala",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "ST"
    ],
    "stats": {
      "pac": 77,
      "sho": 84,
      "pas": 85,
      "dri": 86,
      "def": 42,
      "phy": 62
    },
    "pie": "L",
    "skills": 5,
    "weakFoot": 3,
    "ratingFuente": 87.1,
    "popularidadFuente": 28,
    "precioReferencia": 9000,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "9K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "schlotterbeck-87-cb-81-60-76-74-86-84",
    "nombre": "Schlotterbeck",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 81,
      "sho": 60,
      "pas": 76,
      "dri": 74,
      "def": 86,
      "phy": 84
    },
    "pie": "L",
    "skills": 2,
    "weakFoot": 2,
    "ratingFuente": 87.1,
    "popularidadFuente": 27,
    "precioReferencia": 23750,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "23.75K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "donnarumma-89-gk-90-83-72-90-46-88",
    "nombre": "Donnarumma",
    "version": null,
    "tipoCarta": null,
    "ovr": 89,
    "posicionPrincipal": "GK",
    "posiciones": [
      "GK"
    ],
    "stats": {
      "div": 90,
      "han": 83,
      "kic": 72,
      "ref": 90,
      "spd": 46,
      "pos": 88
    },
    "pie": "R",
    "skills": 1,
    "weakFoot": 3,
    "ratingFuente": null,
    "popularidadFuente": 27,
    "precioReferencia": 42000,
    "valorSecundarioFuente": 11000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "42K",
      "valorSecundarioRaw": "11K"
    },
    "activo": true
  },
  {
    "id": "doue-86-rw-83-81-79-90-55-80",
    "nombre": "Doué",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM",
      "CM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 83,
      "sho": 81,
      "pas": 79,
      "dri": 90,
      "def": 55,
      "phy": 80
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 4,
    "ratingFuente": 85.8,
    "popularidadFuente": 27,
    "precioReferencia": 34000,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "34K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "dumfries-83-rb-82-70-74-79-78-87",
    "nombre": "Dumfries",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "RB",
    "posiciones": [
      "RB",
      "RM"
    ],
    "stats": {
      "pac": 82,
      "sho": 70,
      "pas": 74,
      "dri": 79,
      "def": 78,
      "phy": 87
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 78.9,
    "popularidadFuente": 27,
    "precioReferencia": 1900,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "1.9K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "saliba-88-cb-77-41-68-73-90-82",
    "nombre": "Saliba",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 77,
      "sho": 41,
      "pas": 68,
      "dri": 73,
      "def": 90,
      "phy": 82
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 86.8,
    "popularidadFuente": 27,
    "precioReferencia": 145000,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "145K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "thuram-86-st-87-84-77-83-51-83",
    "nombre": "Thuram",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": 87,
      "sho": 84,
      "pas": 77,
      "dri": 83,
      "def": 51,
      "phy": 83
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 87.2,
    "popularidadFuente": 26,
    "precioReferencia": 49750,
    "valorSecundarioFuente": 5120,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 8,
      "precioPrincipalRaw": "49.75K",
      "valorSecundarioRaw": "5.12K"
    },
    "activo": true
  },
  {
    "id": "hato-78-lb-85-42-70-74-76-74",
    "nombre": "Hato",
    "version": null,
    "tipoCarta": null,
    "ovr": 78,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "CB",
      "CDM"
    ],
    "stats": {
      "pac": 85,
      "sho": 42,
      "pas": 70,
      "dri": 74,
      "def": 76,
      "phy": 74
    },
    "pie": "L",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 77.9,
    "popularidadFuente": 26,
    "precioReferencia": 2500,
    "valorSecundarioFuente": 140,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "2.5K",
      "valorSecundarioRaw": "140"
    },
    "activo": true
  },
  {
    "id": "nico-paz-84-cam-81-78-79-84-54-68",
    "nombre": "Nico Paz",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "ST"
    ],
    "stats": {
      "pac": 81,
      "sho": 78,
      "pas": 79,
      "dri": 84,
      "def": 54,
      "phy": 68
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 80.9,
    "popularidadFuente": 26,
    "precioReferencia": 1700,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "1.7K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "buhl-88-lm-84-85-85-86-37-74",
    "nombre": "Bühl",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 84,
      "sho": 85,
      "pas": 85,
      "dri": 86,
      "def": 37,
      "phy": 74
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 5,
    "ratingFuente": 89.2,
    "popularidadFuente": 25,
    "precioReferencia": 7400,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "7.4K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "fermin-85-cam-81-84-80-84-63-72",
    "nombre": "Fermín",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "CM",
      "LM"
    ],
    "stats": {
      "pac": 81,
      "sho": 84,
      "pas": 80,
      "dri": 84,
      "def": 63,
      "phy": 72
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 83.1,
    "popularidadFuente": 25,
    "precioReferencia": 7900,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "7.9K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "aitana-bonmati-90-cm-80-85-86-88-75-72",
    "nombre": "Aitana Bonmatí",
    "version": null,
    "tipoCarta": null,
    "ovr": 90,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CAM"
    ],
    "stats": {
      "pac": 80,
      "sho": 85,
      "pas": 86,
      "dri": 88,
      "def": 75,
      "phy": 72
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 5,
    "ratingFuente": 91.1,
    "popularidadFuente": 25,
    "precioReferencia": 240000,
    "valorSecundarioFuente": 14000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "240K",
      "valorSecundarioRaw": "14K"
    },
    "activo": true
  },
  {
    "id": "haaland-91-st-87-92-71-80-47-89",
    "nombre": "Haaland",
    "version": null,
    "tipoCarta": null,
    "ovr": 91,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": 87,
      "sho": 92,
      "pas": 71,
      "dri": 80,
      "def": 47,
      "phy": 89
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 88.7,
    "popularidadFuente": 25,
    "precioReferencia": 195000,
    "valorSecundarioFuente": 19000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "195K",
      "valorSecundarioRaw": "19K"
    },
    "activo": true
  },
  {
    "id": "asencio-78-cb-84-43-61-72-77-79",
    "nombre": "Asencio",
    "version": null,
    "tipoCarta": null,
    "ovr": 78,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB",
      "RB"
    ],
    "stats": {
      "pac": 84,
      "sho": 43,
      "pas": 61,
      "dri": 72,
      "def": 77,
      "phy": 79
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 78.7,
    "popularidadFuente": 25,
    "precioReferencia": 2000,
    "valorSecundarioFuente": 140,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "2K",
      "valorSecundarioRaw": "140"
    },
    "activo": true
  },
  {
    "id": "caicedo-86-cdm-69-68-77-81-84-82",
    "nombre": "Caicedo",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "CDM",
    "posiciones": [
      "CDM",
      "CM"
    ],
    "stats": {
      "pac": 69,
      "sho": 68,
      "pas": 77,
      "dri": 81,
      "def": 84,
      "phy": 82
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 88.4,
    "popularidadFuente": 25,
    "precioReferencia": 14000,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "14K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "diani-87-rm-91-84-81-88-56-73",
    "nombre": "Diani",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "RW"
    ],
    "stats": {
      "pac": 91,
      "sho": 84,
      "pas": 81,
      "dri": 88,
      "def": 56,
      "phy": 73
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 89.9,
    "popularidadFuente": 25,
    "precioReferencia": 76500,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "76.5K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "mariona-89-cm-79-85-86-90-78-82",
    "nombre": "Mariona",
    "version": null,
    "tipoCarta": null,
    "ovr": 89,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM"
    ],
    "stats": {
      "pac": 79,
      "sho": 85,
      "pas": 86,
      "dri": 90,
      "def": 78,
      "phy": 82
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 89.8,
    "popularidadFuente": 25,
    "precioReferencia": 46500,
    "valorSecundarioFuente": 11000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "46.5K",
      "valorSecundarioRaw": "11K"
    },
    "activo": true
  },
  {
    "id": "kelly-86-rm-89-85-85-84-43-69",
    "nombre": "Kelly",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "LM",
      "RW",
      "LW"
    ],
    "stats": {
      "pac": 89,
      "sho": 85,
      "pas": 85,
      "dri": 84,
      "def": 43,
      "phy": 69
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 86.5,
    "popularidadFuente": 24,
    "precioReferencia": 9800,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "9.8K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "joan-garcia-86-gk-85-85-80-88-46-84",
    "nombre": "Joan García",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "GK",
    "posiciones": [
      "GK"
    ],
    "stats": {
      "div": 85,
      "han": 85,
      "kic": 80,
      "ref": 88,
      "spd": 46,
      "pos": 84
    },
    "pie": "R",
    "skills": 1,
    "weakFoot": 3,
    "ratingFuente": null,
    "popularidadFuente": 24,
    "precioReferencia": 10000,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "10K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "vitinha-90-cm-72-81-88-91-75-70",
    "nombre": "Vitinha",
    "version": null,
    "tipoCarta": null,
    "ovr": 90,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM"
    ],
    "stats": {
      "pac": 72,
      "sho": 81,
      "pas": 88,
      "dri": 91,
      "def": 75,
      "phy": 70
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 91.1,
    "popularidadFuente": 24,
    "precioReferencia": 96000,
    "valorSecundarioFuente": 14000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "96K",
      "valorSecundarioRaw": "14K"
    },
    "activo": true
  },
  {
    "id": "ratiu-80-rb-94-67-74-81-74-71",
    "nombre": "Rațiu",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "RB",
    "posiciones": [
      "RB",
      "RM",
      "RW"
    ],
    "stats": {
      "pac": 94,
      "sho": 67,
      "pas": 74,
      "dri": 81,
      "def": 74,
      "phy": 71
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 82.2,
    "popularidadFuente": 24,
    "precioReferencia": 2100,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "2.1K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "osimhen-85-st-89-84-65-78-51-86",
    "nombre": "Osimhen",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": 89,
      "sho": 84,
      "pas": 65,
      "dri": 78,
      "def": 51,
      "phy": 86
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 84.2,
    "popularidadFuente": 24,
    "precioReferencia": 7900,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "7.9K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "de-jong-86-cm-77-70-85-84-77-77",
    "nombre": "de Jong",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM",
      "CAM"
    ],
    "stats": {
      "pac": 77,
      "sho": 70,
      "pas": 85,
      "dri": 84,
      "def": 77,
      "phy": 77
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 85.7,
    "popularidadFuente": 24,
    "precioReferencia": 79500,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 9,
      "precioPrincipalRaw": "79.5K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "diomande-81-cb-80-26-52-70-80-88",
    "nombre": "Diomande",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 80,
      "sho": 26,
      "pas": 52,
      "dri": 70,
      "def": 80,
      "phy": 88
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 83.6,
    "popularidadFuente": 23,
    "precioReferencia": 4800,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "4.8K",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "joao-pedro-83-st-77-83-74-84-38-74",
    "nombre": "João Pedro",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "CAM"
    ],
    "stats": {
      "pac": 77,
      "sho": 83,
      "pas": 74,
      "dri": 84,
      "def": 38,
      "phy": 74
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 80.9,
    "popularidadFuente": 23,
    "precioReferencia": 1900,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "1.9K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "gyokeres-86-st-81-87-72-78-44-87",
    "nombre": "Gyökeres",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": 81,
      "sho": 87,
      "pas": 72,
      "dri": 78,
      "def": 44,
      "phy": 87
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 84.1,
    "popularidadFuente": 23,
    "precioReferencia": 14000,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "14K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "joao-felix-83-cam-81-81-79-84-45-71",
    "nombre": "João Félix",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "LM",
      "ST",
      "LW"
    ],
    "stats": {
      "pac": 81,
      "sho": 81,
      "pas": 79,
      "dri": 84,
      "def": 45,
      "phy": 71
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 4,
    "ratingFuente": 86.1,
    "popularidadFuente": 23,
    "precioReferencia": 9500,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "9.5K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "endrick-79-st-87-81-66-80-30-73-2",
    "nombre": "Endrick",
    "version": null,
    "tipoCarta": null,
    "ovr": 79,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "RM",
      "CAM",
      "RW"
    ],
    "stats": {
      "pac": 87,
      "sho": 81,
      "pas": 66,
      "dri": 80,
      "def": 30,
      "phy": 73
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 2,
    "ratingFuente": 80.4,
    "popularidadFuente": 23,
    "precioReferencia": null,
    "valorSecundarioFuente": 160,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "160"
    },
    "activo": true
  },
  {
    "id": "nmecha-86-cm-84-80-80-85-83-89",
    "nombre": "Nmecha",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM"
    ],
    "stats": {
      "pac": 84,
      "sho": 80,
      "pas": 80,
      "dri": 85,
      "def": 83,
      "phy": 89
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 2,
    "ratingFuente": 84.9,
    "popularidadFuente": 22,
    "precioReferencia": 152000,
    "valorSecundarioFuente": 5120,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "152K",
      "valorSecundarioRaw": "5.12K"
    },
    "activo": true
  },
  {
    "id": "mendy-80-lb-80-62-74-75-78-81",
    "nombre": "Mendy",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB"
    ],
    "stats": {
      "pac": 80,
      "sho": 62,
      "pas": 74,
      "dri": 75,
      "def": 78,
      "phy": 81
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 5,
    "ratingFuente": 78.7,
    "popularidadFuente": 22,
    "precioReferencia": 1900,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "1.9K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "kudus-81-rm-88-76-74-86-60-74",
    "nombre": "Kudus",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "CAM",
      "RW",
      "ST"
    ],
    "stats": {
      "pac": 88,
      "sho": 76,
      "pas": 74,
      "dri": 86,
      "def": 60,
      "phy": 74
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 80.9,
    "popularidadFuente": 22,
    "precioReferencia": 1100,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "1.1K",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "oosterwolde-76-cb-88-42-64-72-75-81",
    "nombre": "Oosterwolde",
    "version": null,
    "tipoCarta": null,
    "ovr": 76,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB",
      "LB"
    ],
    "stats": {
      "pac": 88,
      "sho": 42,
      "pas": 64,
      "dri": 72,
      "def": 75,
      "phy": 81
    },
    "pie": "L",
    "skills": 2,
    "weakFoot": 2,
    "ratingFuente": 78.3,
    "popularidadFuente": 22,
    "precioReferencia": 2000,
    "valorSecundarioFuente": 100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "2K",
      "valorSecundarioRaw": "100"
    },
    "activo": true
  },
  {
    "id": "wilson-88-st-91-87-79-88-45-78",
    "nombre": "Wilson",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "CAM"
    ],
    "stats": {
      "pac": 91,
      "sho": 87,
      "pas": 79,
      "dri": 88,
      "def": 45,
      "phy": 78
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 5,
    "ratingFuente": 87.4,
    "popularidadFuente": 22,
    "precioReferencia": 249000,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "249K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "saka-87-rw-79-82-85-87-60-73",
    "nombre": "Saka",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM"
    ],
    "stats": {
      "pac": 79,
      "sho": 82,
      "pas": 85,
      "dri": 87,
      "def": 60,
      "phy": 73
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 86.5,
    "popularidadFuente": 22,
    "precioReferencia": 7000,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "7K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "alisson-87-gk-85-87-82-86-50-86",
    "nombre": "Alisson",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "GK",
    "posiciones": [
      "GK"
    ],
    "stats": {
      "div": 85,
      "han": 87,
      "kic": 82,
      "ref": 86,
      "spd": 50,
      "pos": 86
    },
    "pie": "R",
    "skills": 1,
    "weakFoot": 3,
    "ratingFuente": null,
    "popularidadFuente": 22,
    "precioReferencia": 27250,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "27.25K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "elanga-79-rw-94-70-74-80-39-65",
    "nombre": "Elanga",
    "version": null,
    "tipoCarta": null,
    "ovr": 79,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM"
    ],
    "stats": {
      "pac": 94,
      "sho": 70,
      "pas": 74,
      "dri": 80,
      "def": 39,
      "phy": 65
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 5,
    "ratingFuente": 80.8,
    "popularidadFuente": 22,
    "precioReferencia": 1500,
    "valorSecundarioFuente": 160,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "1.5K",
      "valorSecundarioRaw": "160"
    },
    "activo": true
  },
  {
    "id": "coman-83-rm-87-75-79-87-30-64",
    "nombre": "Coman",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "LM",
      "RW",
      "LW"
    ],
    "stats": {
      "pac": 87,
      "sho": 75,
      "pas": 79,
      "dri": 87,
      "def": 30,
      "phy": 64
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 3,
    "ratingFuente": 83.0,
    "popularidadFuente": 21,
    "precioReferencia": 950,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "950",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "gvardiol-85-cb-78-70-76-77-85-82",
    "nombre": "Gvardiol",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB",
      "LB"
    ],
    "stats": {
      "pac": 78,
      "sho": 70,
      "pas": 76,
      "dri": 77,
      "def": 85,
      "phy": 82
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 5,
    "ratingFuente": 83.4,
    "popularidadFuente": 21,
    "precioReferencia": 10000,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "10K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "stanway-86-cdm-82-79-80-86-78-78",
    "nombre": "Stanway",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "CDM",
    "posiciones": [
      "CDM",
      "CM"
    ],
    "stats": {
      "pac": 82,
      "sho": 79,
      "pas": 80,
      "dri": 86,
      "def": 78,
      "phy": 78
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 85.9,
    "popularidadFuente": 21,
    "precioReferencia": 7700,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 10,
      "precioPrincipalRaw": "7.7K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "ona-batlle-87-rb-88-62-80-82-82-72",
    "nombre": "Ona Batlle",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "RB",
    "posiciones": [
      "RB",
      "LB",
      "RM",
      "LM"
    ],
    "stats": {
      "pac": 88,
      "sho": 62,
      "pas": 80,
      "dri": 82,
      "def": 82,
      "phy": 72
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 87.5,
    "popularidadFuente": 21,
    "precioReferencia": 5900,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "5.9K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "debinha-87-cam-85-79-85-89-46-57",
    "nombre": "Debinha",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "ST"
    ],
    "stats": {
      "pac": 85,
      "sho": 79,
      "pas": 85,
      "dri": 89,
      "def": 46,
      "phy": 57
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 5,
    "ratingFuente": 89.4,
    "popularidadFuente": 21,
    "precioReferencia": 8600,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "8.6K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "murillo-82-cb-79-55-67-71-82-83",
    "nombre": "Murillo",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 79,
      "sho": 55,
      "pas": 67,
      "dri": 71,
      "def": 82,
      "phy": 83
    },
    "pie": "L",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 81.6,
    "popularidadFuente": 21,
    "precioReferencia": 4600,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "4.6K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "dani-olmo-84-cam-74-79-82-85-51-59",
    "nombre": "Dani Olmo",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "CM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 74,
      "sho": 79,
      "pas": 82,
      "dri": 85,
      "def": 51,
      "phy": 59
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 85.4,
    "popularidadFuente": 21,
    "precioReferencia": 1600,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "1.6K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "geyoro-84-cm-89-72-80-82-82-78",
    "nombre": "Geyoro",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM",
      "CAM"
    ],
    "stats": {
      "pac": 89,
      "sho": 72,
      "pas": 80,
      "dri": 82,
      "def": 82,
      "phy": 78
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 82.7,
    "popularidadFuente": 21,
    "precioReferencia": 13000,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "13K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "pubill-81-cb-79-56-71-74-81-82",
    "nombre": "Pubill",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB",
      "RB"
    ],
    "stats": {
      "pac": 79,
      "sho": 56,
      "pas": 71,
      "dri": 74,
      "def": 81,
      "phy": 82
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 82.0,
    "popularidadFuente": 21,
    "precioReferencia": 1700,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "1.7K",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "martinez-85-gk-83-81-82-85-50-85",
    "nombre": "Martínez",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "GK",
    "posiciones": [
      "GK"
    ],
    "stats": {
      "div": 83,
      "han": 81,
      "kic": 82,
      "ref": 85,
      "spd": 50,
      "pos": 85
    },
    "pie": "R",
    "skills": 1,
    "weakFoot": 4,
    "ratingFuente": null,
    "popularidadFuente": 21,
    "precioReferencia": 13000,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "13K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "kane-90-st-62-94-83-82-49-83",
    "nombre": "Kane",
    "version": null,
    "tipoCarta": null,
    "ovr": 90,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": 62,
      "sho": 94,
      "pas": 83,
      "dri": 82,
      "def": 49,
      "phy": 83
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 87.8,
    "popularidadFuente": 21,
    "precioReferencia": 30000,
    "valorSecundarioFuente": 14000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "30K",
      "valorSecundarioRaw": "14K"
    },
    "activo": true
  },
  {
    "id": "valverde-87-cm-90-84-83-81-81-85",
    "nombre": "Valverde",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "RB",
      "CDM",
      "RM",
      "RW"
    ],
    "stats": {
      "pac": 90,
      "sho": 84,
      "pas": 83,
      "dri": 81,
      "def": 81,
      "phy": 85
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 89.3,
    "popularidadFuente": 21,
    "precioReferencia": 277000,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "277K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "gullit-86-cam-80-82-82-81-80-86",
    "nombre": "Gullit",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "CB",
      "CDM",
      "CM",
      "ST"
    ],
    "stats": {
      "pac": 80,
      "sho": 82,
      "pas": 82,
      "dri": 81,
      "def": 80,
      "phy": 86
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 5,
    "ratingFuente": 88.4,
    "popularidadFuente": 21,
    "precioReferencia": null,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "ndiaye-82-lm-86-77-74-86-44-65",
    "nombre": "Ndiaye",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "RM",
      "RW",
      "LW"
    ],
    "stats": {
      "pac": 86,
      "sho": 77,
      "pas": 74,
      "dri": 86,
      "def": 44,
      "phy": 65
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 81.3,
    "popularidadFuente": 21,
    "precioReferencia": 1400,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "1.4K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "gabriel-martinelli-82-rw-90-80-77-84-48-72",
    "nombre": "Gabriel Martinelli",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 90,
      "sho": 80,
      "pas": 77,
      "dri": 84,
      "def": 48,
      "phy": 72
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 84.4,
    "popularidadFuente": 21,
    "precioReferencia": 14750,
    "valorSecundarioFuente": 425,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "14.75K",
      "valorSecundarioRaw": "425"
    },
    "activo": true
  },
  {
    "id": "thuram-85-st-86-83-75-81-50-81",
    "nombre": "Thuram",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": 86,
      "sho": 83,
      "pas": 75,
      "dri": 81,
      "def": 50,
      "phy": 81
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 83.0,
    "popularidadFuente": 20,
    "precioReferencia": 17000,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "17K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "gabriel-89-cb-64-44-64-66-91-84",
    "nombre": "Gabriel",
    "version": null,
    "tipoCarta": null,
    "ovr": 89,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 64,
      "sho": 44,
      "pas": 64,
      "dri": 66,
      "def": 91,
      "phy": 84
    },
    "pie": "L",
    "skills": 2,
    "weakFoot": 2,
    "ratingFuente": 85.3,
    "popularidadFuente": 20,
    "precioReferencia": 11750,
    "valorSecundarioFuente": 11000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "11.75K",
      "valorSecundarioRaw": "11K"
    },
    "activo": true
  },
  {
    "id": "bastoni-86-cb-74-47-76-78-86-82",
    "nombre": "Bastoni",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 74,
      "sho": 47,
      "pas": 76,
      "dri": 78,
      "def": 86,
      "phy": 82
    },
    "pie": "L",
    "skills": 2,
    "weakFoot": 2,
    "ratingFuente": 81.7,
    "popularidadFuente": 20,
    "precioReferencia": 3800,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "3.8K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "james-85-lm-90-81-78-87-40-82",
    "nombre": "James",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "RM",
      "RW",
      "LW"
    ],
    "stats": {
      "pac": 90,
      "sho": 81,
      "pas": 78,
      "dri": 87,
      "def": 40,
      "phy": 82
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 5,
    "ratingFuente": 88.2,
    "popularidadFuente": 20,
    "precioReferencia": 27000,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 11,
      "precioPrincipalRaw": "27K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "safonov-84-gk-83-78-81-87-52-85",
    "nombre": "Safonov",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "GK",
    "posiciones": [
      "GK"
    ],
    "stats": {
      "div": 83,
      "han": 78,
      "kic": 81,
      "ref": 87,
      "spd": 52,
      "pos": 85
    },
    "pie": "R",
    "skills": 1,
    "weakFoot": 2,
    "ratingFuente": null,
    "popularidadFuente": 20,
    "precioReferencia": 17000,
    "valorSecundarioFuente": 1040,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "17K",
      "valorSecundarioRaw": "1.04K"
    },
    "activo": true
  },
  {
    "id": "gabriel-jesus-79-st-78-79-74-84-39-68",
    "nombre": "Gabriel Jesus",
    "version": null,
    "tipoCarta": null,
    "ovr": 79,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "CAM"
    ],
    "stats": {
      "pac": 78,
      "sho": 79,
      "pas": 74,
      "dri": 84,
      "def": 39,
      "phy": 68
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 79.3,
    "popularidadFuente": 20,
    "precioReferencia": 900,
    "valorSecundarioFuente": 160,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "900",
      "valorSecundarioRaw": "160"
    },
    "activo": true
  },
  {
    "id": "reiten-86-lb-86-80-85-85-79-69",
    "nombre": "Reiten",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 86,
      "sho": 80,
      "pas": 85,
      "dri": 85,
      "def": 79,
      "phy": 69
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 89.6,
    "popularidadFuente": 20,
    "precioReferencia": 3800,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "3.8K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "rabiot-85-cm-81-79-81-81-78-85",
    "nombre": "Rabiot",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM"
    ],
    "stats": {
      "pac": 81,
      "sho": 79,
      "pas": 81,
      "dri": 81,
      "def": 78,
      "phy": 85
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 80.9,
    "popularidadFuente": 19,
    "precioReferencia": 6900,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "6.9K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "bellingham-90-cam-79-86-83-88-79-85",
    "nombre": "Bellingham",
    "version": null,
    "tipoCarta": null,
    "ovr": 90,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "CDM",
      "CM",
      "LM",
      "ST",
      "LW"
    ],
    "stats": {
      "pac": 79,
      "sho": 86,
      "pas": 83,
      "dri": 88,
      "def": 79,
      "phy": 85
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 89.6,
    "popularidadFuente": 19,
    "precioReferencia": 220000,
    "valorSecundarioFuente": 14000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "220K",
      "valorSecundarioRaw": "14K"
    },
    "activo": true
  },
  {
    "id": "martinez-87-st-80-88-76-85-51-74",
    "nombre": "Martínez",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": 80,
      "sho": 88,
      "pas": 76,
      "dri": 85,
      "def": 51,
      "phy": 74
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 86.9,
    "popularidadFuente": 19,
    "precioReferencia": 7000,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "7K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "matheus-cunha-84-lm-77-86-79-84-44-73",
    "nombre": "Matheus Cunha",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "CAM",
      "ST",
      "LW"
    ],
    "stats": {
      "pac": 77,
      "sho": 86,
      "pas": 79,
      "dri": 84,
      "def": 44,
      "phy": 73
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 82.6,
    "popularidadFuente": 19,
    "precioReferencia": 3700,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "3.7K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "semenyo-85-rw-82-85-79-84-46-80",
    "nombre": "Semenyo",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 82,
      "sho": 85,
      "pas": 79,
      "dri": 84,
      "def": 46,
      "phy": 80
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 5,
    "ratingFuente": 82.6,
    "popularidadFuente": 19,
    "precioReferencia": 7900,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "7.9K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "rummenigge-86-st-85-83-72-86-50-72",
    "nombre": "Rummenigge",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 85,
      "sho": 83,
      "pas": 72,
      "dri": 86,
      "def": 50,
      "phy": 72
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 86.2,
    "popularidadFuente": 19,
    "precioReferencia": null,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "barcola-85-lw-92-76-78-84-39-67-2",
    "nombre": "Barcola",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "RW",
      "LM",
      "RM"
    ],
    "stats": {
      "pac": 92,
      "sho": 76,
      "pas": 78,
      "dri": 84,
      "def": 39,
      "phy": 67
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 85.0,
    "popularidadFuente": 19,
    "precioReferencia": null,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "russo-88-st-84-88-73-86-39-78",
    "nombre": "Russo",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "CAM"
    ],
    "stats": {
      "pac": 84,
      "sho": 88,
      "pas": 73,
      "dri": 86,
      "def": 39,
      "phy": 78
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 87.0,
    "popularidadFuente": 18,
    "precioReferencia": 14500,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "14.5K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "nmecha-85-cm-83-78-78-84-82-88",
    "nombre": "Nmecha",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM"
    ],
    "stats": {
      "pac": 83,
      "sho": 78,
      "pas": 78,
      "dri": 84,
      "def": 82,
      "phy": 88
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 2,
    "ratingFuente": 83.3,
    "popularidadFuente": 18,
    "precioReferencia": null,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "udogie-79-lb-88-64-73-77-75-75",
    "nombre": "Udogie",
    "version": null,
    "tipoCarta": null,
    "ovr": 79,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "LM"
    ],
    "stats": {
      "pac": 88,
      "sho": 64,
      "pas": 73,
      "dri": 77,
      "def": 75,
      "phy": 75
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 76.1,
    "popularidadFuente": 18,
    "precioReferencia": 1700,
    "valorSecundarioFuente": 160,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "1.7K",
      "valorSecundarioRaw": "160"
    },
    "activo": true
  },
  {
    "id": "thompson-85-lm-93-81-78-83-47-67",
    "nombre": "Thompson",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "RM",
      "RW",
      "LW"
    ],
    "stats": {
      "pac": 93,
      "sho": 81,
      "pas": 78,
      "dri": 83,
      "def": 47,
      "phy": 67
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 83.7,
    "popularidadFuente": 18,
    "precioReferencia": 5000,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "5K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "athenea-84-rw-90-78-77-85-25-75",
    "nombre": "Athenea",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 90,
      "sho": 78,
      "pas": 77,
      "dri": 85,
      "def": 25,
      "phy": 75
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 5,
    "ratingFuente": 83.8,
    "popularidadFuente": 18,
    "precioReferencia": 4900,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "4.9K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "david-raya-88-gk-87-86-88-88-58-86",
    "nombre": "David Raya",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "GK",
    "posiciones": [
      "GK"
    ],
    "stats": {
      "div": 87,
      "han": 86,
      "kic": 88,
      "ref": 88,
      "spd": 58,
      "pos": 86
    },
    "pie": "R",
    "skills": 1,
    "weakFoot": 3,
    "ratingFuente": null,
    "popularidadFuente": 18,
    "precioReferencia": 46000,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 12,
      "precioPrincipalRaw": "46K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "schade-79-lm-92-75-71-78-30-73",
    "nombre": "Schade",
    "version": null,
    "tipoCarta": null,
    "ovr": 79,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "ST",
      "LW"
    ],
    "stats": {
      "pac": 92,
      "sho": 75,
      "pas": 71,
      "dri": 78,
      "def": 30,
      "phy": 73
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 79.2,
    "popularidadFuente": 17,
    "precioReferencia": 1100,
    "valorSecundarioFuente": 160,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "1.1K",
      "valorSecundarioRaw": "160"
    },
    "activo": true
  },
  {
    "id": "guehi-85-cb-69-46-70-72-85-82",
    "nombre": "Guéhi",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 69,
      "sho": 46,
      "pas": 70,
      "dri": 72,
      "def": 85,
      "phy": 82
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 5,
    "ratingFuente": 84.2,
    "popularidadFuente": 17,
    "precioReferencia": 4100,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "4.1K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "chawinga-87-lw-94-83-76-86-36-81",
    "nombre": "Chawinga",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "LM",
      "CAM",
      "ST"
    ],
    "stats": {
      "pac": 94,
      "sho": 83,
      "pas": 76,
      "dri": 86,
      "def": 36,
      "phy": 81
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 87.5,
    "popularidadFuente": 17,
    "precioReferencia": 45000,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "45K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "formiga-85-cdm-77-75-80-80-85-81",
    "nombre": "Formiga",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CDM",
    "posiciones": [
      "CDM",
      "CM"
    ],
    "stats": {
      "pac": 77,
      "sho": 75,
      "pas": 80,
      "dri": 80,
      "def": 85,
      "phy": 81
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 91.2,
    "popularidadFuente": 17,
    "precioReferencia": null,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "savinho-83-rw-90-76-79-87-37-56",
    "nombre": "Savinho",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 90,
      "sho": 76,
      "pas": 79,
      "dri": 87,
      "def": 37,
      "phy": 56
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 2,
    "ratingFuente": 84.3,
    "popularidadFuente": 17,
    "precioReferencia": null,
    "valorSecundarioFuente": 513,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "513"
    },
    "activo": true
  },
  {
    "id": "hemp-87-lm-92-77-83-87-63-69",
    "nombre": "Hemp",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 92,
      "sho": 77,
      "pas": 83,
      "dri": 87,
      "def": 63,
      "phy": 69
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 88.3,
    "popularidadFuente": 17,
    "precioReferencia": 6000,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "6K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "brown-81-lb-90-60-76-83-73-59",
    "nombre": "Brown",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "LM"
    ],
    "stats": {
      "pac": 90,
      "sho": 60,
      "pas": 76,
      "dri": 83,
      "def": 73,
      "phy": 59
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 80.9,
    "popularidadFuente": 17,
    "precioReferencia": 1300,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "1.3K",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "courtois-90-gk-87-89-78-90-46-90",
    "nombre": "Courtois",
    "version": null,
    "tipoCarta": null,
    "ovr": 90,
    "posicionPrincipal": "GK",
    "posiciones": [
      "GK"
    ],
    "stats": {
      "div": 87,
      "han": 89,
      "kic": 78,
      "ref": 90,
      "spd": 46,
      "pos": 90
    },
    "pie": "L",
    "skills": 1,
    "weakFoot": 3,
    "ratingFuente": null,
    "popularidadFuente": 17,
    "precioReferencia": 48250,
    "valorSecundarioFuente": 14000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "48.25K",
      "valorSecundarioRaw": "14K"
    },
    "activo": true
  },
  {
    "id": "robinson-80-lb-88-57-74-76-76-76",
    "nombre": "Robinson",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "LM"
    ],
    "stats": {
      "pac": 88,
      "sho": 57,
      "pas": 74,
      "dri": 76,
      "def": 76,
      "phy": 76
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 82.6,
    "popularidadFuente": 17,
    "precioReferencia": 2500,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "2.5K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "aguero-89-st-88-90-78-89-33-74",
    "nombre": "Agüero",
    "version": null,
    "tipoCarta": null,
    "ovr": 89,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": 88,
      "sho": 90,
      "pas": 78,
      "dri": 89,
      "def": 33,
      "phy": 74
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 92.1,
    "popularidadFuente": 17,
    "precioReferencia": null,
    "valorSecundarioFuente": 16500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "16.5K"
    },
    "activo": true
  },
  {
    "id": "minteh-80-rm-93-72-73-84-57-57",
    "nombre": "Minteh",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "LM",
      "RW",
      "LW"
    ],
    "stats": {
      "pac": 93,
      "sho": 72,
      "pas": 73,
      "dri": 84,
      "def": 57,
      "phy": 57
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 81.5,
    "popularidadFuente": 16,
    "precioReferencia": 1000,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "1K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "hancko-83-cb-77-67-74-75-83-84",
    "nombre": "Hancko",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB",
      "LB"
    ],
    "stats": {
      "pac": 77,
      "sho": 67,
      "pas": 74,
      "dri": 75,
      "def": 83,
      "phy": 84
    },
    "pie": "L",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 81.3,
    "popularidadFuente": 16,
    "precioReferencia": 1100,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "1.1K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "giuliano-82-rm-92-76-75-80-57-83",
    "nombre": "Giuliano",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "LM",
      "RW",
      "LW"
    ],
    "stats": {
      "pac": 92,
      "sho": 76,
      "pas": 75,
      "dri": 80,
      "def": 57,
      "phy": 83
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 81.1,
    "popularidadFuente": 16,
    "precioReferencia": 2700,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "2.7K",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "nuno-mendes-89-lb-94-77-80-86-84-80",
    "nombre": "Nuno Mendes",
    "version": null,
    "tipoCarta": null,
    "ovr": 89,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "LM"
    ],
    "stats": {
      "pac": 94,
      "sho": 77,
      "pas": 80,
      "dri": 86,
      "def": 84,
      "phy": 80
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 92.7,
    "popularidadFuente": 16,
    "precioReferencia": 289000,
    "valorSecundarioFuente": 11000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "289K",
      "valorSecundarioRaw": "11K"
    },
    "activo": true
  },
  {
    "id": "sangare-81-cm-80-67-76-81-78-72",
    "nombre": "Sangaré",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM"
    ],
    "stats": {
      "pac": 80,
      "sho": 67,
      "pas": 76,
      "dri": 81,
      "def": 78,
      "phy": 72
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 81.8,
    "popularidadFuente": 16,
    "precioReferencia": 1400,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "1.4K",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "aguero-86-st-x-x-x-x-x-x",
    "nombre": "Agüero",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST"
    ],
    "stats": {
      "pac": null,
      "sho": null,
      "pas": null,
      "dri": null,
      "def": null,
      "phy": null
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 88.6,
    "popularidadFuente": 16,
    "precioReferencia": null,
    "valorSecundarioFuente": 6150,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 13,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "6.15K"
    },
    "activo": true
  },
  {
    "id": "sanchez-80-cb-81-57-62-72-80-86",
    "nombre": "Sánchez",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 81,
      "sho": 57,
      "pas": 62,
      "dri": 72,
      "def": 80,
      "phy": 86
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 2,
    "ratingFuente": 80.7,
    "popularidadFuente": 16,
    "precioReferencia": 1500,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "1.5K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "brugts-84-lb-87-73-79-81-80-74",
    "nombre": "Brugts",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "CM",
      "LM",
      "CAM",
      "ST",
      "LW"
    ],
    "stats": {
      "pac": 87,
      "sho": 73,
      "pas": 79,
      "dri": 81,
      "def": 80,
      "phy": 74
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 81.1,
    "popularidadFuente": 16,
    "precioReferencia": 4900,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "4.9K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "timber-84-rb-76-48-76-78-83-78",
    "nombre": "Timber",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "RB",
    "posiciones": [
      "RB",
      "CB",
      "LB",
      "RM",
      "LM"
    ],
    "stats": {
      "pac": 76,
      "sho": 48,
      "pas": 76,
      "dri": 78,
      "def": 83,
      "phy": 78
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 80.1,
    "popularidadFuente": 15,
    "precioReferencia": 3000,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "3K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "maignan-87-gk-83-86-81-89-64-84",
    "nombre": "Maignan",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "GK",
    "posiciones": [
      "GK"
    ],
    "stats": {
      "div": 83,
      "han": 86,
      "kic": 81,
      "ref": 89,
      "spd": 64,
      "pos": 84
    },
    "pie": "R",
    "skills": 1,
    "weakFoot": 4,
    "ratingFuente": null,
    "popularidadFuente": 15,
    "precioReferencia": 12750,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "12.75K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "fellaini-85-cm-74-81-78-79-78-90",
    "nombre": "Fellaini",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM",
      "CAM",
      "ST"
    ],
    "stats": {
      "pac": 74,
      "sho": 81,
      "pas": 78,
      "dri": 79,
      "def": 78,
      "phy": 90
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 82.7,
    "popularidadFuente": 15,
    "precioReferencia": null,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "madueke-80-rw-88-75-74-83-45-69",
    "nombre": "Madueke",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM"
    ],
    "stats": {
      "pac": 88,
      "sho": 75,
      "pas": 74,
      "dri": 83,
      "def": 45,
      "phy": 69
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 79.8,
    "popularidadFuente": 15,
    "precioReferencia": 1100,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "1.1K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "rodri-90-cdm-62-78-86-81-85-81",
    "nombre": "Rodri",
    "version": null,
    "tipoCarta": null,
    "ovr": 90,
    "posicionPrincipal": "CDM",
    "posiciones": [
      "CDM",
      "CM"
    ],
    "stats": {
      "pac": 62,
      "sho": 78,
      "pas": 86,
      "dri": 81,
      "def": 85,
      "phy": 81
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 85.8,
    "popularidadFuente": 15,
    "precioReferencia": 19500,
    "valorSecundarioFuente": 14000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "19.5K",
      "valorSecundarioRaw": "14K"
    },
    "activo": true
  },
  {
    "id": "katoto-86-st-84-84-77-82-39-75",
    "nombre": "Katoto",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "CAM"
    ],
    "stats": {
      "pac": 84,
      "sho": 84,
      "pas": 77,
      "dri": 82,
      "def": 39,
      "phy": 75
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 84.8,
    "popularidadFuente": 15,
    "precioReferencia": 2900,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "2.9K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "kvaratskhelia-89-lw-86-85-84-90-59-81",
    "nombre": "Kvaratskhelia",
    "version": null,
    "tipoCarta": null,
    "ovr": 89,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "RM",
      "LM",
      "RW"
    ],
    "stats": {
      "pac": 86,
      "sho": 85,
      "pas": 84,
      "dri": 90,
      "def": 59,
      "phy": 81
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 5,
    "ratingFuente": 91.7,
    "popularidadFuente": 15,
    "precioReferencia": 178000,
    "valorSecundarioFuente": 11000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "178K",
      "valorSecundarioRaw": "11K"
    },
    "activo": true
  },
  {
    "id": "nmecha-86-cm-x-x-x-x-x-x",
    "nombre": "Nmecha",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM"
    ],
    "stats": {
      "pac": null,
      "sho": null,
      "pas": null,
      "dri": null,
      "def": null,
      "phy": null
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 2,
    "ratingFuente": 84.9,
    "popularidadFuente": 15,
    "precioReferencia": 480000,
    "valorSecundarioFuente": 7690,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "480K",
      "valorSecundarioRaw": "7.69K"
    },
    "activo": true
  },
  {
    "id": "mamardashvili-83-gk-82-81-75-83-47-82",
    "nombre": "Mamardashvili",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "GK",
    "posiciones": [
      "GK"
    ],
    "stats": {
      "div": 82,
      "han": 81,
      "kic": 75,
      "ref": 83,
      "spd": 47,
      "pos": 82
    },
    "pie": "L",
    "skills": 1,
    "weakFoot": 3,
    "ratingFuente": null,
    "popularidadFuente": 15,
    "precioReferencia": 2700,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "2.7K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "diomande-84-rw-93-77-75-87-47-70-2",
    "nombre": "Diomande",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 93,
      "sho": 77,
      "pas": 75,
      "dri": 87,
      "def": 47,
      "phy": 70
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 88.4,
    "popularidadFuente": 15,
    "precioReferencia": null,
    "valorSecundarioFuente": 1040,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "1.04K"
    },
    "activo": true
  },
  {
    "id": "vini-jr-89-lw-93-85-80-91-31-71",
    "nombre": "Vini Jr.",
    "version": null,
    "tipoCarta": null,
    "ovr": 89,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "LM",
      "ST"
    ],
    "stats": {
      "pac": 93,
      "sho": 85,
      "pas": 80,
      "dri": 91,
      "def": 31,
      "phy": 71
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 4,
    "ratingFuente": 93.0,
    "popularidadFuente": 15,
    "precioReferencia": 777000,
    "valorSecundarioFuente": 11000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "777K",
      "valorSecundarioRaw": "11K"
    },
    "activo": true
  },
  {
    "id": "heath-86-rw-84-80-83-86-51-73",
    "nombre": "Heath",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 84,
      "sho": 80,
      "pas": 83,
      "dri": 86,
      "def": 51,
      "phy": 73
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 5,
    "ratingFuente": 91.8,
    "popularidadFuente": 15,
    "precioReferencia": null,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "nagasato-85-cam-80-84-81-85-40-72",
    "nombre": "Nagasato",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "RM",
      "RW",
      "ST"
    ],
    "stats": {
      "pac": 80,
      "sho": 84,
      "pas": 81,
      "dri": 85,
      "def": 40,
      "phy": 72
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 5,
    "ratingFuente": 87.6,
    "popularidadFuente": 15,
    "precioReferencia": null,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "spence-83-lb-90-57-75-82-80-78",
    "nombre": "Spence",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "RB"
    ],
    "stats": {
      "pac": 90,
      "sho": 57,
      "pas": 75,
      "dri": 82,
      "def": 80,
      "phy": 78
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 83.8,
    "popularidadFuente": 14,
    "precioReferencia": null,
    "valorSecundarioFuente": 513,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 14,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "513"
    },
    "activo": true
  },
  {
    "id": "safonov-83-gk-82-76-80-86-50-83",
    "nombre": "Safonov",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "GK",
    "posiciones": [
      "GK"
    ],
    "stats": {
      "div": 82,
      "han": 76,
      "kic": 80,
      "ref": 86,
      "spd": 50,
      "pos": 83
    },
    "pie": "R",
    "skills": 1,
    "weakFoot": 2,
    "ratingFuente": null,
    "popularidadFuente": 14,
    "precioReferencia": 1900,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "1.9K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "cucurella-86-lb-75-64-79-78-84-78",
    "nombre": "Cucurella",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB"
    ],
    "stats": {
      "pac": 75,
      "sho": 64,
      "pas": 79,
      "dri": 78,
      "def": 84,
      "phy": 78
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 83.0,
    "popularidadFuente": 14,
    "precioReferencia": 3200,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "3.2K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "diaby-82-rm-94-69-76-85-44-59-2",
    "nombre": "Diaby",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "RW",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 94,
      "sho": 69,
      "pas": 76,
      "dri": 85,
      "def": 44,
      "phy": 59
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 84.7,
    "popularidadFuente": 14,
    "precioReferencia": null,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "riise-85-cm-79-78-84-85-70-69",
    "nombre": "Riise",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM",
      "CAM"
    ],
    "stats": {
      "pac": 79,
      "sho": 78,
      "pas": 84,
      "dri": 85,
      "def": 70,
      "phy": 69
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 88.6,
    "popularidadFuente": 14,
    "precioReferencia": null,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "miedema-87-cam-83-86-80-86-34-82",
    "nombre": "Miedema",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "ST"
    ],
    "stats": {
      "pac": 83,
      "sho": 86,
      "pas": 80,
      "dri": 86,
      "def": 34,
      "phy": 82
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 85.3,
    "popularidadFuente": 14,
    "precioReferencia": 3900,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "3.9K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "kalulu-81-cb-79-53-68-72-83-79",
    "nombre": "Kalulu",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB",
      "RB"
    ],
    "stats": {
      "pac": 79,
      "sho": 53,
      "pas": 68,
      "dri": 72,
      "def": 83,
      "phy": 79
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 77.9,
    "popularidadFuente": 14,
    "precioReferencia": 1000,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "1K",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "maradona-95-cam-90-91-91-96-40-77",
    "nombre": "Maradona",
    "version": null,
    "tipoCarta": null,
    "ovr": 95,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "ST"
    ],
    "stats": {
      "pac": 90,
      "sho": 91,
      "pas": 91,
      "dri": 96,
      "def": 40,
      "phy": 77
    },
    "pie": "L",
    "skills": 5,
    "weakFoot": 3,
    "ratingFuente": 96.4,
    "popularidadFuente": 14,
    "precioReferencia": null,
    "valorSecundarioFuente": 60000,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "60K"
    },
    "activo": true
  },
  {
    "id": "james-84-rb-76-71-83-78-83-82",
    "nombre": "James",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "RB",
    "posiciones": [
      "RB",
      "CDM",
      "CM"
    ],
    "stats": {
      "pac": 76,
      "sho": 71,
      "pas": 83,
      "dri": 78,
      "def": 83,
      "phy": 82
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 81.0,
    "popularidadFuente": 14,
    "precioReferencia": 4000,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "4K",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "oblak-88-gk-85-90-79-87-46-86",
    "nombre": "Oblak",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "GK",
    "posiciones": [
      "GK"
    ],
    "stats": {
      "div": 85,
      "han": 90,
      "kic": 79,
      "ref": 87,
      "spd": 46,
      "pos": 86
    },
    "pie": "R",
    "skills": 1,
    "weakFoot": 3,
    "ratingFuente": null,
    "popularidadFuente": 13,
    "precioReferencia": 9100,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "9.1K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "kerkez-81-lb-84-59-75-78-76-79",
    "nombre": "Kerkez",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "LM"
    ],
    "stats": {
      "pac": 84,
      "sho": 59,
      "pas": 75,
      "dri": 78,
      "def": 76,
      "phy": 79
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 3,
    "ratingFuente": 80.8,
    "popularidadFuente": 13,
    "precioReferencia": 1500,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "1.5K",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "alvaro-carreras-83-lb-x-x-x-x-x-x",
    "nombre": "Álvaro Carreras",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "CB",
      "LM"
    ],
    "stats": {
      "pac": null,
      "sho": null,
      "pas": null,
      "dri": null,
      "def": null,
      "phy": null
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 87.3,
    "popularidadFuente": 13,
    "precioReferencia": null,
    "valorSecundarioFuente": 769,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "769"
    },
    "activo": true
  },
  {
    "id": "elia-84-lw-91-74-77-87-34-68",
    "nombre": "Elia",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "LW",
    "posiciones": [
      "LW",
      "LM"
    ],
    "stats": {
      "pac": 91,
      "sho": 74,
      "pas": 77,
      "dri": 87,
      "def": 34,
      "phy": 68
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 3,
    "ratingFuente": 88.5,
    "popularidadFuente": 13,
    "precioReferencia": null,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "dimarco-86-lb-81-78-85-81-80-74",
    "nombre": "Dimarco",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "LM"
    ],
    "stats": {
      "pac": 81,
      "sho": 78,
      "pas": 85,
      "dri": 81,
      "def": 80,
      "phy": 74
    },
    "pie": "L",
    "skills": 3,
    "weakFoot": 2,
    "ratingFuente": 83.8,
    "popularidadFuente": 13,
    "precioReferencia": 2900,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "2.9K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "simakan-82-cb-78-43-66-70-83-83",
    "nombre": "Simakan",
    "version": null,
    "tipoCarta": null,
    "ovr": 82,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB",
      "RB"
    ],
    "stats": {
      "pac": 78,
      "sho": 43,
      "pas": 66,
      "dri": 70,
      "def": 83,
      "phy": 83
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 81.6,
    "popularidadFuente": 13,
    "precioReferencia": 900,
    "valorSecundarioFuente": 340,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "900",
      "valorSecundarioRaw": "340"
    },
    "activo": true
  },
  {
    "id": "kerolin-nicoli-85-rm-85-78-81-84-43-77",
    "nombre": "Kerolin Nicoli",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "RM",
    "posiciones": [
      "RM",
      "CAM",
      "RW",
      "ST"
    ],
    "stats": {
      "pac": 85,
      "sho": 78,
      "pas": 81,
      "dri": 84,
      "def": 43,
      "phy": 77
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 82.1,
    "popularidadFuente": 13,
    "precioReferencia": 2200,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "2.2K",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "dumornay-88-st-92-85-79-90-60-73",
    "nombre": "Dumornay",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "CDM",
      "CM",
      "CAM"
    ],
    "stats": {
      "pac": 92,
      "sho": 85,
      "pas": 79,
      "dri": 90,
      "def": 60,
      "phy": 73
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 5,
    "ratingFuente": 91.1,
    "popularidadFuente": 12,
    "precioReferencia": 250000,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 15,
      "precioPrincipalRaw": "250K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "ngumoha-75-lm-90-71-68-79-37-49",
    "nombre": "Ngumoha",
    "version": null,
    "tipoCarta": null,
    "ovr": 75,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 90,
      "sho": 71,
      "pas": 68,
      "dri": 79,
      "def": 37,
      "phy": 49
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 78.3,
    "popularidadFuente": 12,
    "precioReferencia": 3400,
    "valorSecundarioFuente": 90,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "3.4K",
      "valorSecundarioRaw": "90"
    },
    "activo": true
  },
  {
    "id": "beerensteyn-83-st-90-82-73-86-50-76",
    "nombre": "Beerensteyn",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "RM",
      "LM",
      "RW",
      "LW"
    ],
    "stats": {
      "pac": 90,
      "sho": 82,
      "pas": 73,
      "dri": 86,
      "def": 50,
      "phy": 76
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 2,
    "ratingFuente": 84.2,
    "popularidadFuente": 12,
    "precioReferencia": 4300,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "4.3K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "becho-83-rw-90-79-72-86-45-69",
    "nombre": "Becho",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM",
      "CAM",
      "ST"
    ],
    "stats": {
      "pac": 90,
      "sho": 79,
      "pas": 72,
      "dri": 86,
      "def": 45,
      "phy": 69
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 81.3,
    "popularidadFuente": 12,
    "precioReferencia": 900,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "900",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "mapi-leon-88-cb-77-68-80-77-89-86",
    "nombre": "Mapi León",
    "version": null,
    "tipoCarta": null,
    "ovr": 88,
    "posicionPrincipal": "CB",
    "posiciones": [
      "CB"
    ],
    "stats": {
      "pac": 77,
      "sho": 68,
      "pas": 80,
      "dri": 77,
      "def": 89,
      "phy": 86
    },
    "pie": "L",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 83.8,
    "popularidadFuente": 12,
    "precioReferencia": 6100,
    "valorSecundarioFuente": 8300,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "6.1K",
      "valorSecundarioRaw": "8.3K"
    },
    "activo": true
  },
  {
    "id": "kante-83-cdm-74-65-73-80-83-79",
    "nombre": "Kanté",
    "version": null,
    "tipoCarta": null,
    "ovr": 83,
    "posicionPrincipal": "CDM",
    "posiciones": [
      "CDM",
      "CM"
    ],
    "stats": {
      "pac": 74,
      "sho": 65,
      "pas": 73,
      "dri": 80,
      "def": 83,
      "phy": 79
    },
    "pie": "R",
    "skills": 2,
    "weakFoot": 3,
    "ratingFuente": 81.0,
    "popularidadFuente": 12,
    "precioReferencia": 2100,
    "valorSecundarioFuente": 410,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "2.1K",
      "valorSecundarioRaw": "410"
    },
    "activo": true
  },
  {
    "id": "pepe-81-rw-87-80-75-84-37-69",
    "nombre": "Pépé",
    "version": null,
    "tipoCarta": null,
    "ovr": 81,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM",
      "CAM",
      "ST"
    ],
    "stats": {
      "pac": 87,
      "sho": 80,
      "pas": 75,
      "dri": 84,
      "def": 37,
      "phy": 69
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 2,
    "ratingFuente": 80.3,
    "popularidadFuente": 12,
    "precioReferencia": 850,
    "valorSecundarioFuente": 280,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "850",
      "valorSecundarioRaw": "280"
    },
    "activo": true
  },
  {
    "id": "kolo-muani-77-st-88-77-68-77-38-63",
    "nombre": "Kolo Muani",
    "version": null,
    "tipoCarta": null,
    "ovr": 77,
    "posicionPrincipal": "ST",
    "posiciones": [
      "ST",
      "RM",
      "CAM",
      "RW"
    ],
    "stats": {
      "pac": 88,
      "sho": 77,
      "pas": 68,
      "dri": 77,
      "def": 38,
      "phy": 63
    },
    "pie": "R",
    "skills": 3,
    "weakFoot": 4,
    "ratingFuente": 78.2,
    "popularidadFuente": 12,
    "precioReferencia": 1700,
    "valorSecundarioFuente": 120,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "1.7K",
      "valorSecundarioRaw": "120"
    },
    "activo": true
  },
  {
    "id": "pirlo-85-cm-77-77-86-85-70-68",
    "nombre": "Pirlo",
    "version": null,
    "tipoCarta": null,
    "ovr": 85,
    "posicionPrincipal": "CM",
    "posiciones": [
      "CM",
      "CDM"
    ],
    "stats": {
      "pac": 77,
      "sho": 77,
      "pas": 86,
      "dri": 85,
      "def": 70,
      "phy": 68
    },
    "pie": "R",
    "skills": 5,
    "weakFoot": 4,
    "ratingFuente": 87.8,
    "popularidadFuente": 12,
    "precioReferencia": null,
    "valorSecundarioFuente": 2100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "0",
      "valorSecundarioRaw": "2.1K"
    },
    "activo": true
  },
  {
    "id": "bacha-86-lb-88-73-85-82-79-81",
    "nombre": "Bacha",
    "version": null,
    "tipoCarta": null,
    "ovr": 86,
    "posicionPrincipal": "LB",
    "posiciones": [
      "LB",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 88,
      "sho": 73,
      "pas": 85,
      "dri": 82,
      "def": 79,
      "phy": 81
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 3,
    "ratingFuente": 88.9,
    "popularidadFuente": 12,
    "precioReferencia": 14750,
    "valorSecundarioFuente": 4100,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "14.75K",
      "valorSecundarioRaw": "4.1K"
    },
    "activo": true
  },
  {
    "id": "ylmaz-80-lm-93-75-72-80-69-86",
    "nombre": "Yılmaz",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "RM",
      "CAM",
      "RW",
      "ST",
      "LW"
    ],
    "stats": {
      "pac": 93,
      "sho": 75,
      "pas": 72,
      "dri": 80,
      "def": 69,
      "phy": 86
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 83.2,
    "popularidadFuente": 12,
    "precioReferencia": 2700,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "2.7K",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  },
  {
    "id": "rolfo-84-lm-81-81-81-82-81-81",
    "nombre": "Rolfö",
    "version": null,
    "tipoCarta": null,
    "ovr": 84,
    "posicionPrincipal": "LM",
    "posiciones": [
      "LM",
      "LB",
      "LW"
    ],
    "stats": {
      "pac": 81,
      "sho": 81,
      "pas": 81,
      "dri": 82,
      "def": 81,
      "phy": 81
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 81.4,
    "popularidadFuente": 12,
    "precioReferencia": 800,
    "valorSecundarioFuente": 830,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "800",
      "valorSecundarioRaw": "830"
    },
    "activo": true
  },
  {
    "id": "david-raya-89-gk-88-87-89-89-60-88",
    "nombre": "David Raya",
    "version": null,
    "tipoCarta": null,
    "ovr": 89,
    "posicionPrincipal": "GK",
    "posiciones": [
      "GK"
    ],
    "stats": {
      "div": 88,
      "han": 87,
      "kic": 89,
      "ref": 89,
      "spd": 60,
      "pos": 88
    },
    "pie": "R",
    "skills": 1,
    "weakFoot": 3,
    "ratingFuente": null,
    "popularidadFuente": 12,
    "precioReferencia": 199000,
    "valorSecundarioFuente": 13750,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "199K",
      "valorSecundarioRaw": "13.75K"
    },
    "activo": true
  },
  {
    "id": "harder-87-cam-82-81-80-88-28-79",
    "nombre": "Harder",
    "version": null,
    "tipoCarta": null,
    "ovr": 87,
    "posicionPrincipal": "CAM",
    "posiciones": [
      "CAM",
      "RM",
      "RW",
      "ST"
    ],
    "stats": {
      "pac": 82,
      "sho": 81,
      "pas": 80,
      "dri": 88,
      "def": 28,
      "phy": 79
    },
    "pie": "R",
    "skills": 4,
    "weakFoot": 4,
    "ratingFuente": 85.2,
    "popularidadFuente": 12,
    "precioReferencia": 2900,
    "valorSecundarioFuente": 5500,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "2.9K",
      "valorSecundarioRaw": "5.5K"
    },
    "activo": true
  },
  {
    "id": "savinho-80-rw-87-72-76-84-34-52",
    "nombre": "Savinho",
    "version": null,
    "tipoCarta": null,
    "ovr": 80,
    "posicionPrincipal": "RW",
    "posiciones": [
      "RW",
      "RM",
      "LM",
      "LW"
    ],
    "stats": {
      "pac": 87,
      "sho": 72,
      "pas": 76,
      "dri": 84,
      "def": 34,
      "phy": 52
    },
    "pie": "L",
    "skills": 4,
    "weakFoot": 2,
    "ratingFuente": 79.4,
    "popularidadFuente": 12,
    "precioReferencia": 850,
    "valorSecundarioFuente": 180,
    "fuente": {
      "nombre": "FUTBIN",
      "paginaPdf": 16,
      "precioPrincipalRaw": "850",
      "valorSecundarioRaw": "180"
    },
    "activo": true
  }
];
