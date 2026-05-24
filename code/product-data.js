const APPS_SCRIPT_ENDPOINT = "https://script.google.com/macros/s/AKfycby2swd521tBPFzH1wBejZzdDdlsHrxv_-cbH2z9fBb-7uPcTM3soreUkrUt0a1NlkgZaQ/exec";
const INITIALS_PRICE = 1.5;
const CART_STORAGE_KEY = "ssv-shop-cart";

const PRODUCTS = [
  {
    id: "lead-zip-jacket",
    slug: "lead-zip-jacket",
    name: "Hummel Lead 2.0 Track Zip Jacket",
    category: "Jacke",
    tagline: "Trainingsjacke mit cleanem Team-Look",
    description: "Die Track Zip Jacket ist die klassische Teamjacke für Anreise, Hallenrand und Trainingsalltag. Sie ist auf einen sportlichen, einheitlichen Vereinsauftritt ausgelegt.",
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
    tagline: "Passende Teamhose für Training und Spieltag",
    description: "Die Track Pants ergänzen die Vereinsjacke zu einem einheitlichen Trainingsanzug. Sie sind für Alltag und Aufwärmen gedacht.",
    details: [
      "Stimmiger Look zusammen mit der Track Zip Jacket.",
      "Praktisch für Training, Anreise und Teamausstattung.",
      "Mit Initialen oder kleiner Nummer bestellbar."
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
    tagline: "Sportlicher Zip Hoodie für Team und Freizeit",
    description: "Der Zip Hoodie verbindet Vereinslook und Alltagstauglichkeit. Er eignet sich für kühlere Hallentage, Fahrten und ein geschlossenes Auftreten der Teams.",
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
    materials: "Sweat-Mix mit sportlicher Oberfläche",
    fit: "Bequeme Regular Fit",
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
    description: "Der GO Hoodie ist für alle gedacht, die einen lässigen Teamartikel für Training, Freizeit und Vereinsauftritte suchen.",
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
    tagline: "Vielseitiges Teamshirt in Schwarz oder Rot",
    description: "Das GO T-Shirt ist eine unkomplizierte Basis für Training, Jugendteams und Vereinsaktionen. Durch zwei Farboptionen bleibt die Auswahl flexibel.",
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
    materials: "Leichtes Sportshirt",
    fit: "Athletische Standardpassform",
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
    tagline: "Leichtes Performance-Shirt für Trainingseinheiten",
    description: "Das Essential Polyester T-Shirt ist auf Bewegung und unkomplizierte Pflege ausgelegt. Es eignet sich besonders für regelmäßiges Hallentraining.",
    details: [
      "Funktionaler Trainingsartikel mit großem Größenspektrum.",
      "In Schwarz und Rot verfügbar.",
      "Optional mit Initialen oder kleiner Nummer."
    ],
    colors: ["Schwarz", "Rot"],
    sizes: {
      "Kinder": ["140", "152", "164"],
      "Erwachsene": ["S", "M", "L", "XL", "XXL", "3XL", "4XL"]
    },
    priceByGroup: { "Kinder": 15.0, "Erwachsene": 15.5 },
    materials: "Polyester-Funktionsmaterial",
    fit: "Leichte Trainingspassform",
    initialsPossible: true,
    images: [
      { src: "media/products/funktionsshirt_vorne_bk.jpg", alt: "Hummel Essential Polyester T-Shirt Vorderansicht Schwarz"},
      { src: "media/products/funktionsshirt_hinten_bk.jpg", alt: "Hummel Essential Polyester T-Shirt Detailansicht Schwarz"},
      { src: "media/products/funktionsshirt_vorne_rd.jpg", alt: "Hummel Essential Polyester T-Shirt Vorderansicht Rot"},
      { src: "media/products/funktionsshirt_hinten_rd.jpg", alt: "Hummel Essential Polyester T-Shirt Detailansicht Rot"}
    ]
  }
];
