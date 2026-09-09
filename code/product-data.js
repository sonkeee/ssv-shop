const APPS_SCRIPT_ENDPOINT = "https://script.google.com/macros/s/AKfycby995WkuaVPmH70Fy5H8U_rY4L98md-qDfq2RAD6fZQ5EOCbf4tS1m5lH7PXAoo_JQaTQ/exec";
const INITIALS_PRICE = 1.5;
const CART_STORAGE_KEY = "ssv-shop-cart";

const PRODUCTS = [
  {
    id: "lead-zip-jacket",
    slug: "lead-zip-jacket",
    name: "Hummel Lead 2.0 Track Zip Jacket",
    category: "Jacke",
    tagline: "Atmungsaktive Trainingsjacke",
    description: "Die Track Zip Jacket ist eine klassische Teamjacke für Spieltage und Trainingsaltag. Sie ist auf einen sportlichen, einheitlichen Vereinsauftritt ausgelegt. Sie besitzt einen durchgehenden Frontreißverschluss und Jackentaschen mit Reißverschluss.",
    details: [
      "Ideal als Teamjacke für Spieltage und Warm-up.",
      "Kinder- und Erwachsenengrößen verfügbar.",
      "Initialen oder kleine Nummer optional möglich."
    ],
    colors: ["Schwarz"],
    sizes: {
      "Kinder": ["140", "152", "164"],
      "Erwachsene": ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
    },
    priceByGroup: { "Kinder": 32.0, "Erwachsene": 35.0 },
    materials: "Polyester-Funktionsmaterial",
    fit: "Reguläre Passform",
    initialsPossible: true,
    images: [
      { src: "media/products/jacke_vorne_bk.jpg", alt: "Hummel Lead 2.0 Track Zip Jacket Vorderansicht" },
      { src: "media/products/jacke_hinten_bk.jpg", alt: "Hummel Lead 2.0 Track Zip Jacket Rückansicht" }
    ]
  },
  {
    id: "lead-track-pants",
    slug: "lead-track-pants",
    name: "Hummel Lead 2.0 Track Pants",
    category: "Hose",
    tagline: "Passende Teamhose für Trainingsalltag und Spieltag",
    description: "Die Track Pants ergänzen die Vereinsjacke zu einem einheitlichen Trainingsanzug. Sie ist für Trainingsalltag und Spieltage gedacht. Sie hat Reißverschlusstaschen und einen Reißverschluss am Beinabschluss.",
    details: [
      "Stimmiger Look mit den Jacken",
      "Atmungsaktiv",
      "Mit Initialen bestellbar."
    ],
    colors: ["Schwarz"],
    sizes: {
      "Kinder": ["140", "152", "164"],
      "Erwachsene": ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
    },
    priceByGroup: { "Kinder": 24.0, "Erwachsene": 27.0 },
    materials: "Polyester-Funktionsmaterial",
    fit: "Schmale Sportpassform",
    initialsPossible: true,
    images: [
      { src: "media/products/hose_vorne_bk.jpg", alt: "Hummel Lead 2.0 Track Pants Vorderansicht" },
      { src: "media/products/hose_hinten_bk.jpg", alt: "Hummel Lead 2.0 Track Pants Rückansicht" }
    ]
  },
  {
    id: "lead-zip-hoodie",
    slug: "lead-zip-hoodie",
    name: "Hummel Lead 2.0 Zip Hoodie",
    category: "Hoodie",
    tagline: "Atmungsaktive Trainingsjacke mit Kapuze",
    description: "Der Zip Hoodie ist eine klassische Teamjacke für Spieltage und Trainingsalltag. Sie ist auf einen sportlichen, einheitlichen Vereinsauftritt ausgelegt. Sie besitzt einen durchgehenden Frontreißverschluss und Jackentaschen mit Reißverschluss. An den Ärmelbündchen hat der Zip Hoodie „Daumenlöcher“",
    details: [
      "Mit Reißverschluss für flexibles Layering.",
      "Geeignet für Jugend- und Erwachsenenbereiche.",
      "Optional mit Initialen oder kleiner Nummer."
    ],
    colors: ["Schwarz"],
    sizes: {
      "Kinder": ["140", "152", "164"],
      "Erwachsene": ["S", "M", "L", "XL", "XXL", "3XL"]
    },
    priceByGroup: { "Kinder": 41.0, "Erwachsene": 44.0 },
    materials: "Polyester-Funktionsmaterial",
    fit: "Fällt größer aus",
    initialsPossible: true,
    images: [
      { src: "media/products/kapuzenjacke_vorne_bk.jpg", alt: "Hummel Lead 2.0 Zip Hoodie Vorderansicht" },
      { src: "media/products/kapuzenjacke_hinten_bk.jpg", alt: "Hummel Lead 2.0 Zip Hoodie Detailansicht" }
    ]
  },
  {
    id: "go-hoodie",
    slug: "go-hoodie",
    name: "Hummel GO 2.0 Hoodie",
    category: "Hoodie",
    tagline: "Klassischer Vereins-Hoodie in Schwarz",
    description: "Der GO Hoodie ist eine Alternative zu den klassischen Trainingsjacken. Er hat eine „Beuteltasche“ und eine Kapuze mit Zugschnur.",
    details: [
      "Beliebter Basic-Hoodie für den Vereinsalltag.",
      "Schlicht, teamfähig und leicht kombinierbar.",
      "Initialen-Option für personalisierte Bestellungen."
    ],
    colors: ["Schwarz"],
    sizes: {
      "Kinder": ["140", "152", "164"],
      "Erwachsene": ["S", "M", "L", "XL", "XXL", "3XL"]
    },
    priceByGroup: { "Kinder": 38.0, "Erwachsene": 41.0 },
    materials: "Weicher Sweatstoff",
    fit: "Normale Passform",
    initialsPossible: true,
    images: [
      { src: "media/products/hoodie_vorne_bk.jpg", alt: "Hummel GO 2.0 Hoodie Vorderansicht" },
      { src: "media/products/hoodie_hinten_bk.jpg", alt: "Hummel GO 2.0 Hoodie Detailansicht" }
    ]
  },
  {
    id: "go-tshirt",
    slug: "go-tshirt",
    name: "Hummel GO 2.0 T-Shirt",
    category: "T-Shirt",
    tagline: "Basic Team-Shirt in schwarz oder rot",
    description: "Das Go T-Shirt ist ein Basic-Vereinsshirt für Training, Spieltage und Vereinsaktionen. Durch zwei Farboptionen bleibt die Auswahl flexibel.",
    details: [
      "In Schwarz und Rot bestellbar.",
      "Geeignet für Training.",
      "Personalisierung mit Initialen möglich."
    ],
    colors: ["Schwarz", "Rot"],
    sizes: {
      "Kinder": ["140", "152", "164"],
      "Erwachsene": ["S", "M", "L", "XL", "XXL", "3XL"]
    },
    priceByGroup: { "Kinder": 15.5, "Erwachsene": 17.0 },
    materials: "Baumwolle",
    fit: "regular – fällt etwas größer aus",
    initialsPossible: true,
    images: [
      { src: "media/products/bw_tshirt_vorne_bk.jpg", alt: "Hummel GO 2.0 T-Shirt Vorderansicht Schwarz" },
      { src: "media/products/bw_tshirt_hinten_bk.jpg", alt: "Hummel GO 2.0 T-Shirt Detailansicht Schwarz" },
      { src: "media/products/bw_tshirt_vorne_rd.jpg", alt: "Hummel GO 2.0 T-Shirt Detailansicht Rot" },
      { src: "media/products/bw_tshirt_hinten_rd.jpg", alt: "Hummel GO 2.0 T-Shirt Detailansicht Rot" }
    ]
  },
  {
    id: "essential-poly-tshirt",
    slug: "essential-poly-tshirt",
    name: "Hummel Essential Polyester T-Shirt",
    category: "T-Shirt",
    tagline: "Funktions-Shirt zum Aufwärmen und für Trainingseinheiten",
    description: "Das Essential-Shirt ist ein Basic-Vereinsshirt für Training, Spieltage und Vereinsaktionen. Durch zwei Farboptionen bleibt die Auswahl flexibel.",
    details: [
      "In Schwarz und Rot bestellbar.",
      "Geeignet für Training.",
      "Personalisierung mit Initialen möglich."
    ],
    colors: ["Schwarz", "Rot"],
    sizes: {
      "Kinder": ["140", "152", "164"],
      "Erwachsene": ["S", "M", "L", "XL", "XXL", "3XL", "4XL"]
    },
    priceByGroup: { "Kinder": 15.0, "Erwachsene": 15.5 },
    materials: "Polyester-Funktionsmaterial",
    fit: "fällt groß aus",
    initialsPossible: true,
    images: [
      { src: "media/products/funktionsshirt_vorne_bk.jpg", alt: "Hummel Essential Polyester T-Shirt Vorderansicht Schwarz"},
      { src: "media/products/funktionsshirt_hinten_bk.jpg", alt: "Hummel Essential Polyester T-Shirt Detailansicht Schwarz"},
      { src: "media/products/funktionsshirt_vorne_rd.jpg", alt: "Hummel Essential Polyester T-Shirt Vorderansicht Rot"},
      { src: "media/products/funktionsshirt_hinten_rd.jpg", alt: "Hummel Essential Polyester T-Shirt Detailansicht Rot"}
    ]
  }
];
