export interface Product {
  id: string;
  name: string;
  category: 'handbags' | 'tailoring' | 'ready-to-wear' | 'footwear' | 'accessories';
  categoryLabel: string;
  price: number;
  formattedPrice: string;
  material: string;
  color: string;
  badge?: string;
  primaryImage: string;
  secondaryImage: string;
  gallery: string[];
  description: string;
  details: string[];
  sizes?: string[];
  sku: string;
  origin: string;
  stockState: {
    status: 'in_stock' | 'low_stock' | 'preorder' | 'made_to_order' | 'out_of_stock';
    label: string;
    description: string;
    remaining?: number;
  };
  savoirFaireStory?: string;
  careInstructions?: string[];
}

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  season: string;
  description: string;
  image: string;
  itemCount: number;
  linkText: string;
}

export interface EditorialStory {
  id: string;
  title: string;
  eyebrow: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
}

export const HERO_CAMPAIGN = {
  seasonTag: "SPRING / SUMMER 2026",
  headline: "THE ARCHITECTURE OF SILHOUETTE",
  subheadline: "A synthesis of sculptural tailoring, noble fabrics, and Italian craftsmanship filmed at Villa d'Este.",
  primaryCta: "DISCOVER THE CAMPAIGN",
  secondaryCta: "EXPLORE LOOKBOOK",
  image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2400&auto=format&fit=crop",
};

export const FEATURED_COLLECTIONS: Collection[] = [
  {
    id: "maroquinerie",
    title: "LA MAROQUINERIE",
    subtitle: "Artisanal Leather Creations",
    season: "Permanent Édition",
    description: "Full-grain Tuscan calfskin sculpted into timeless architectural volumes with hand-buffed gilded brass lockets.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop",
    itemCount: 24,
    linkText: "EXPLORE LEATHER GOODS",
  },
  {
    id: "sartoriale",
    title: "L'ART DU TAILLEUR",
    subtitle: "The Sartorial Evening Edit",
    season: "Automne-Hiver 2026",
    description: "Sharp double-breasted silhouettes cut from 140s virgin wool and silk faille, balanced with fluid draping.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
    itemCount: 38,
    linkText: "DISCOVER TAILORING",
  },
  {
    id: "pret-a-porter",
    title: "ÉLÉGANCE INTEMPORELLE",
    subtitle: "High Ready-to-Wear",
    season: "Spring Éditions",
    description: "Fluid silk georgette blouses, structured trench-coats, and plissé column skirts designed for modern presence.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    itemCount: 42,
    linkText: "VIEW PRÊT-À-PORTER",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "atelier-valmont-tote",
    name: "The Valmont Structured Tote",
    category: "handbags",
    categoryLabel: "Leather Goods",
    price: 3450,
    formattedPrice: "$3,450",
    material: "Grained Tuscan Calfskin & 24k Gold-Dipped Clasp",
    color: "Noir Ebène",
    badge: "ICONIC EMBLEM",
    primaryImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1400&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "The crown jewel of our permanent leather collection. Hand-stitched over 18 hours in our Florence workshop with signature saddle-edge finishing.",
    details: [
      "Dimensions: 32 cm length × 24 cm height × 14 cm depth",
      "Signature brushed 24k gold-plated brass turn-lock closure",
      "Dual interior accordion compartments with contrast lambskin suede lining",
      "Detachable adjustable leather shoulder strap with engraved buckle",
      "Hand-painted raw edges lacquered in five progressive coats",
      "Four protective brass metal feet at bottom base",
    ],
    sizes: ["Medium (32 × 24 cm)"],
    sku: "ATL-VAL-8821-BLK",
    origin: "Handcrafted in Florence, Italy",
    stockState: {
      status: "in_stock",
      label: "In Stock · Dispatches in 24h",
      description: "Complimentary temperature-controlled white-glove courier delivery.",
      remaining: 6,
    },
    savoirFaireStory: "Vegetable-tanned according to century-old Florentine traditions, the Valmont leather undergoes a gentle barrel tumbling process that reveals its organic, full-bodied grain while retaining unmatched structural resilience.",
    careInstructions: [
      "Protect from direct prolonged exposure to extreme sunlight, heat, and humidity.",
      "Should the leather become damp, dab gently with a soft dry microfiber cloth.",
      "Store within the provided Atelier velvet sleeper bag with internal stuffing to maintain structure.",
      "Complimentary annual reconditioning available at all global flagships."
    ],
  },
  {
    id: "chevalier-blazer",
    name: "Double-Breasted Chevalier Blazer",
    category: "tailoring",
    categoryLabel: "Sartorial",
    price: 2890,
    formattedPrice: "$2,890",
    material: "Super 140s Virgin Wool & Mulberry Silk",
    color: "Camel Sable",
    badge: "RUNWAY SELECTION",
    primaryImage: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1400&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "A tailored statement in architectural precision. Features sharp peaked lapels, full horsehair floating canvas interior, and hand-cast horn buttons.",
    details: [
      "Full floating horsehair canvas chest piece that molds naturally to the silhouette",
      "Milanese lapel buttonhole sewn by hand with silk gimp thread",
      "Cupro jacquard lining woven with subtle tonal Atelier crest",
      "Double back vents and roped shoulder construction",
      "Horn buttons custom-engraved in the Veneto region",
    ],
    sizes: ["FR 36", "FR 38", "FR 40", "FR 42"],
    sku: "ATL-BLZ-4012-CAM",
    origin: "Hand-Tailored in Biella, Italy",
    stockState: {
      status: "low_stock",
      label: "Low Stock · 2 Pieces Available",
      description: "Only 2 pieces remain from the runway production run in our Milan warehouse.",
      remaining: 2,
    },
    savoirFaireStory: "Woven exclusively for Maison Atelier in the Piedmont foothills, this Super 140s wool combines fine Australian merino with 15% raw mulberry silk, creating a fabric of luminous luster, crisp drape, and year-round breathability.",
    careInstructions: [
      "Specialist dry clean only using hydrocarbon solvent.",
      "Do not wash or tumble dry.",
      "Steam gently from a distance; press with a cloth beneath the iron.",
      "Hang exclusively on broad contoured wooden suit hangers."
    ],
  },
  {
    id: "soleil-column-gown",
    name: "Soleil Fluid Silk Column Gown",
    category: "ready-to-wear",
    categoryLabel: "Eveningwear",
    price: 4100,
    formattedPrice: "$4,100",
    material: "100% Heavy Mulberry Silk Crepe",
    color: "Rouge Rubis",
    badge: "LIMITED ÉDITION",
    primaryImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1400&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "A masterclass in bias cutting. Moves with liquid grace, featuring a deep sculptural backline and invisible hand-rolled baby hem.",
    details: [
      "Floor-sweeping column silhouette with gentle 20 cm godet train",
      "Draped front neckline designed without internal seams for flawless drape",
      "Double-lined in matching pure silk charmeuse for absolute comfort",
      "Hand-finished hems by Parisian haute couture seamstresses",
      "Concealed side zip with hook-and-eye closure in palladium finish",
    ],
    sizes: ["FR 34", "FR 36", "FR 38", "FR 40"],
    sku: "ATL-GWN-9104-ROU",
    origin: "Couture Atelier in Paris, France",
    stockState: {
      status: "made_to_order",
      label: "Made-to-Order · 10 Days Delivery",
      description: "Crafted to individual proportion by our Paris salon tailors.",
    },
    savoirFaireStory: "Bias cutting requires nearly double the fabric yardage of conventional tailoring, cutting at a strict 45-degree angle across the silk warp to allow natural elastic drape that conforms effortlessly to movement.",
    careInstructions: [
      "Strictly dry clean by luxury specialist.",
      "Store flat or suspended in protective breathable cotton garment sack.",
      "Steam on low temperature silk setting."
    ],
  },
  {
    id: "palazzo-leather-loafer",
    name: "The Palazzo Bit Leather Loafer",
    category: "footwear",
    categoryLabel: "Footwear",
    price: 1150,
    formattedPrice: "$1,150",
    material: "Hand-Burnished Box Calfskin",
    color: "Burgundy Grand Cru",
    badge: "HERITAGE",
    primaryImage: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1400&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "Constructed with the Blake-stitched technique for effortless flexibility from day one. Crowned with our sculptural gold horsebit ornament.",
    details: [
      "Traditional Blake welt construction ensuring lightweight agility and comfort",
      "Hand-polished patina buffed with organic beeswax and carnauba balm",
      "Solid forged brass horsebit hardware in antique brushed finish",
      "Channel-stitched leather outsole with protective rubber heel strike",
      "Full glove-leather internal lining with memory foam insole",
    ],
    sizes: ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
    sku: "ATL-LOA-1209-BUR",
    origin: "Civitanova Marche, Italy",
    stockState: {
      status: "in_stock",
      label: "In Stock · Dispatches in 24h",
      description: "Includes complimentary cedar shoe trees and dust bags.",
      remaining: 8,
    },
    savoirFaireStory: "Each pair of Palazzo loafers undergoes four distinct hand-finishing phases. Color pigments are applied layer upon layer using linen cloths, giving the burgundy leather its multidimensional Grand Cru depth.",
    careInstructions: [
      "Insert wooden shoe trees immediately following wear to absorb moisture.",
      "Buff weekly with neutral luxury cream and a horsehair polishing brush.",
      "Avoid exposure to rain or direct heat sources."
    ],
  },
  {
    id: "aeris-tortoise-sunglasses",
    name: "Aéris Oversized Acetate Frame",
    category: "accessories",
    categoryLabel: "Eyewear",
    price: 620,
    formattedPrice: "$620",
    material: "Japanese Cellulose Acetate & Zeiss Lenses",
    color: "Amber Havane",
    primaryImage: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1400&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "Bold 70s geometric profile milled from 8mm thick Japanese cured acetate with custom wire core temples visible through transparency.",
    details: [
      "100% UVA/UVB Category 3 optical-grade Carl Zeiss sun lenses",
      "Five-barrel barrel hinges hand-riveted with star fasteners",
      "Chiseled filigree wire core visible along the temples",
      "Includes handcrafted calfskin case and microfiber cleaning cloth",
      "Hand-polished over three days in organic tumbling drums",
    ],
    sizes: ["One Size (52-20-145)"],
    sku: "ATL-EYE-5510-AMB",
    origin: "Cadore Valley, Italy",
    stockState: {
      status: "in_stock",
      label: "In Stock · Dispatches in 24h",
      description: "Complimentary luxury express courier.",
      remaining: 12,
    },
    savoirFaireStory: "Produced in the Dolomite foothills where Italian eyewear craftsmanship originated, the acetate is cured for over ninety days before milling to ensure exceptional dimensional stability and deep optical clarity.",
    careInstructions: [
      "Rinse with tepid water before cleaning with the microfiber cloth.",
      "Never leave exposed to excessive heat on automobile dashboards.",
      "Store exclusively inside the structured leather case."
    ],
  },
  {
    id: "aurelia-sculpted-collar",
    name: "Aurélia Hammered Choker & Chain",
    category: "accessories",
    categoryLabel: "Fine Jewelry",
    price: 1980,
    formattedPrice: "$1,980",
    material: "Vermeil 18k Yellow Gold over Sterling Silver",
    color: "Or Jaune",
    badge: "ATELIER EXCLUSIVE",
    primaryImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1400&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "An organic sculptural piece echoing ancient Mediterranean goldsmithing. Each link is individually forged and hand-hammered.",
    details: [
      "Substantial 5-micron 18k yellow gold vermeil over 925 sterling silver",
      "Articulated undulating links designed to contour naturally to the collarbone",
      "Concealed security snap clasp set with natural cabochon onyx",
      "Hallmarked and authenticated at the London Assay Office",
      "Presented in an embossed velvet jewelry box",
    ],
    sizes: ["One Size (42 cm)"],
    sku: "ATL-JWL-7718-GLD",
    origin: "Arezzo, Italy",
    stockState: {
      status: "low_stock",
      label: "Low Stock · 3 Pieces Available",
      description: "Limited atelier batch created with artisanal vermeil dipping.",
      remaining: 3,
    },
    savoirFaireStory: "Forged in the historic goldsmithing center of Arezzo, the Aurélia choker reflects centuries of Etruscan metalwork. The hammered surface diffuses light in warm, golden ripples rather than harsh reflections.",
    careInstructions: [
      "Avoid direct contact with perfumes, hairsprays, and cosmetics.",
      "Clean gently using a lint-free jewelry polishing cloth.",
      "Store separately from other jewelry pieces to avoid scratching."
    ],
  },
  {
    id: "atelier-cavalier-crossbody",
    name: "The Cavalier Mini Bamboo Saddle",
    category: "handbags",
    categoryLabel: "Signature Masterpiece",
    price: 3850,
    formattedPrice: "$3,850",
    material: "Full-Grain Saddle Leather, Fire-Curved Bamboo Handle",
    color: "Caramel Brûlé",
    badge: "ICONIC ARCHIVE",
    primaryImage: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1400&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "Reissued from our 1968 archive, the Cavalier combines equestrian saddle curves with an artisanal flame-curved bamboo handle. Each handle requires forty minutes over an open flame to achieve its distinctive golden-amber patina.",
    details: [
      "Fire-bent Japanese bamboo handle (unique individual grain per piece)",
      "Polished brass horsebit swivel closure with spring tension lock",
      "Dual interchangeable straps: signature two-tone grosgrain ribbon & calfskin strap",
      "Microfibre lining with supple suede hand-touch",
      "Bespoke hot-stamped gold monogramming available complimentary",
      "Dimensions: 21 cm width × 15 cm height × 7 cm depth",
    ],
    sizes: ["Mini (21 × 15 cm)", "Medium (27 × 20 cm)"],
    sku: "ATL-BAM-1968-CAR",
    origin: "Florence, Italy",
    stockState: {
      status: "in_stock",
      label: "In Stock · Dispatches in 24h",
      description: "Complimentary white-glove delivery and complimentary hot-stamp personalization.",
      remaining: 4,
    },
    savoirFaireStory: "Originating during post-war material scarcities, our artisans developed a patented technique to heat and curve natural bamboo segments over open flame, cooling them under metal tension clamps to preserve the iconic half-moon arc for generations.",
    careInstructions: [
      "Condition leather bi-annually with natural beeswax cream.",
      "Bamboo requires zero oiling; clean with a barely damp microfiber cloth.",
      "Store upright in presentation box with the bamboo handle supported."
    ],
  },
];

export const SPOTLIGHT_HERO_PRODUCT: Product = PRODUCTS[PRODUCTS.length - 1];

export const EDITORIAL_JOURNALS: EditorialStory[] = [
  {
    id: "florence-workshop",
    title: "Inside the Florence Tannery: Where Leather Becomes Architecture",
    eyebrow: "SAVOIR-FAIRE",
    excerpt: "A behind-the-scenes pilgrimage into the family-run Santa Croce workshops preserving vegetable tanning traditions since 1928.",
    date: "OCTOBRE 2026",
    readTime: "5 MIN READ",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "evening-drapery",
    title: "The Dialogue of Drape: Fluidity and Power in Modern Evening Silhouettes",
    eyebrow: "FASHION ESSAY",
    excerpt: "Exploring the tension between strict architectural tailoring and ethereal bias-cut silks for the contemporary salon.",
    date: "SEPTEMBRE 2026",
    readTime: "7 MIN READ",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "heritage-archive",
    title: "Rediscovering the 1968 Horsebit Archive at Villa Medici",
    eyebrow: "ARCHIVAL CHRONICLES",
    excerpt: "How sixty years of equestrian metalwork informed our newest collection of sculpted hardware and fine leather accessories.",
    date: "AOÛT 2026",
    readTime: "4 MIN READ",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop",
  },
];

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getRelatedProducts(currentId: string, limit = 3): Product[] {
  return PRODUCTS.filter((p) => p.id !== currentId).slice(0, limit);
}
