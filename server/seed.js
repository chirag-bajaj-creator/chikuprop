const mongoose = require("mongoose");
require("dotenv").config();
const Property = require("./models/Property");
const User = require("./models/User");

// ── Indian cities with areas, states, and pincodes ──
const LOCATIONS = [
  { city: "Mumbai", state: "Maharashtra", areas: [
    { area: "Andheri West", pincode: "400053" }, { area: "Bandra East", pincode: "400051" },
    { area: "Powai", pincode: "400076" }, { area: "Worli", pincode: "400018" },
    { area: "Malad West", pincode: "400064" }, { area: "Goregaon East", pincode: "400063" },
    { area: "Juhu", pincode: "400049" }, { area: "Borivali West", pincode: "400092" },
  ]},
  { city: "Delhi", state: "Delhi", areas: [
    { area: "Connaught Place", pincode: "110001" }, { area: "Dwarka", pincode: "110075" },
    { area: "Rohini", pincode: "110085" }, { area: "Saket", pincode: "110017" },
    { area: "Vasant Kunj", pincode: "110070" }, { area: "Lajpat Nagar", pincode: "110024" },
    { area: "Greater Kailash", pincode: "110048" }, { area: "Pitampura", pincode: "110034" },
  ]},
  { city: "Bangalore", state: "Karnataka", areas: [
    { area: "Koramangala", pincode: "560034" }, { area: "Whitefield", pincode: "560066" },
    { area: "Indiranagar", pincode: "560038" }, { area: "HSR Layout", pincode: "560102" },
    { area: "Electronic City", pincode: "560100" }, { area: "Jayanagar", pincode: "560011" },
    { area: "Marathahalli", pincode: "560037" }, { area: "JP Nagar", pincode: "560078" },
  ]},
  { city: "Hyderabad", state: "Telangana", areas: [
    { area: "Gachibowli", pincode: "500032" }, { area: "HITEC City", pincode: "500081" },
    { area: "Banjara Hills", pincode: "500034" }, { area: "Kondapur", pincode: "500084" },
    { area: "Madhapur", pincode: "500081" }, { area: "Jubilee Hills", pincode: "500033" },
    { area: "Kukatpally", pincode: "500072" }, { area: "Shamshabad", pincode: "501218" },
  ]},
  { city: "Pune", state: "Maharashtra", areas: [
    { area: "Hinjewadi", pincode: "411057" }, { area: "Kharadi", pincode: "411014" },
    { area: "Baner", pincode: "411045" }, { area: "Wakad", pincode: "411057" },
    { area: "Viman Nagar", pincode: "411014" }, { area: "Koregaon Park", pincode: "411001" },
    { area: "Aundh", pincode: "411007" }, { area: "Hadapsar", pincode: "411028" },
  ]},
  { city: "Chennai", state: "Tamil Nadu", areas: [
    { area: "Anna Nagar", pincode: "600040" }, { area: "T Nagar", pincode: "600017" },
    { area: "Adyar", pincode: "600020" }, { area: "Velachery", pincode: "600042" },
    { area: "OMR", pincode: "600119" }, { area: "Porur", pincode: "600116" },
    { area: "Sholinganallur", pincode: "600119" }, { area: "Nungambakkam", pincode: "600034" },
  ]},
  { city: "Kolkata", state: "West Bengal", areas: [
    { area: "Salt Lake", pincode: "700091" }, { area: "New Town", pincode: "700156" },
    { area: "Rajarhat", pincode: "700135" }, { area: "Alipore", pincode: "700027" },
    { area: "Ballygunge", pincode: "700019" }, { area: "Behala", pincode: "700034" },
    { area: "Dum Dum", pincode: "700028" }, { area: "EM Bypass", pincode: "700107" },
  ]},
  { city: "Gurgaon", state: "Haryana", areas: [
    { area: "DLF Phase 3", pincode: "122002" }, { area: "Sector 56", pincode: "122011" },
    { area: "Sohna Road", pincode: "122018" }, { area: "Golf Course Road", pincode: "122002" },
    { area: "MG Road", pincode: "122001" }, { area: "Sector 49", pincode: "122018" },
    { area: "Nirvana Country", pincode: "122018" }, { area: "Sector 82", pincode: "122004" },
  ]},
  { city: "Noida", state: "Uttar Pradesh", areas: [
    { area: "Sector 62", pincode: "201301" }, { area: "Sector 137", pincode: "201305" },
    { area: "Sector 150", pincode: "201310" }, { area: "Sector 75", pincode: "201301" },
    { area: "Sector 44", pincode: "201303" }, { area: "Sector 128", pincode: "201304" },
    { area: "Greater Noida West", pincode: "201306" }, { area: "Sector 100", pincode: "201304" },
  ]},
  { city: "Ahmedabad", state: "Gujarat", areas: [
    { area: "SG Highway", pincode: "380054" }, { area: "Prahlad Nagar", pincode: "380015" },
    { area: "Bodakdev", pincode: "380054" }, { area: "Satellite", pincode: "380015" },
    { area: "Vastrapur", pincode: "380015" }, { area: "Navrangpura", pincode: "380009" },
    { area: "Thaltej", pincode: "380054" }, { area: "Bopal", pincode: "380058" },
  ]},
  { city: "Jaipur", state: "Rajasthan", areas: [
    { area: "Malviya Nagar", pincode: "302017" }, { area: "Vaishali Nagar", pincode: "302021" },
    { area: "Mansarovar", pincode: "302020" }, { area: "Tonk Road", pincode: "302015" },
    { area: "C-Scheme", pincode: "302001" }, { area: "Jagatpura", pincode: "302017" },
    { area: "Ajmer Road", pincode: "302006" }, { area: "Sirsi Road", pincode: "302012" },
  ]},
  { city: "Lucknow", state: "Uttar Pradesh", areas: [
    { area: "Gomti Nagar", pincode: "226010" }, { area: "Hazratganj", pincode: "226001" },
    { area: "Aliganj", pincode: "226024" }, { area: "Indira Nagar", pincode: "226016" },
    { area: "Vikas Nagar", pincode: "226022" }, { area: "Sushant Golf City", pincode: "226030" },
  ]},
  { city: "Chandigarh", state: "Chandigarh", areas: [
    { area: "Sector 17", pincode: "160017" }, { area: "Sector 35", pincode: "160035" },
    { area: "Sector 44", pincode: "160044" }, { area: "Sector 22", pincode: "160022" },
    { area: "Manimajra", pincode: "160101" }, { area: "Zirakpur", pincode: "140603" },
  ]},
  { city: "Indore", state: "Madhya Pradesh", areas: [
    { area: "Vijay Nagar", pincode: "452010" }, { area: "Palasia", pincode: "452001" },
    { area: "AB Road", pincode: "452001" }, { area: "Super Corridor", pincode: "452010" },
    { area: "Bhawarkua", pincode: "452001" }, { area: "Nipania", pincode: "452010" },
  ]},
  { city: "Kochi", state: "Kerala", areas: [
    { area: "Edappally", pincode: "682024" }, { area: "Kakkanad", pincode: "682030" },
    { area: "Marine Drive", pincode: "682031" }, { area: "Vyttila", pincode: "682019" },
    { area: "Aluva", pincode: "683101" }, { area: "Palarivattom", pincode: "682025" },
  ]},
];

const PROPERTY_TYPES = ["flat", "house", "plot", "commercial"];
const LISTING_TYPES = ["sale", "rent"];
const FURNISHING = ["furnished", "semi-furnished", "unfurnished"];
const AMENITIES = ["Parking", "Gym", "Swimming Pool", "Garden", "Security", "Elevator", "Power Backup", "Water Supply", "Club House", "Playground"];

// Unsplash images for properties
const IMAGES = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
  "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
  "https://images.unsplash.com/photo-1600573472591-ee6981cf81d6?w=800",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
];

// ── Title templates by type ──
const TITLES = {
  flat: {
    sale: [
      "{bed}BHK Spacious Flat in {area}",
      "Premium {bed}BHK Apartment in {area}",
      "{bed}BHK Ready to Move Flat in {area}",
      "Affordable {bed}BHK Flat near {area}",
      "Luxury {bed}BHK Flat with City View in {area}",
      "Brand New {bed}BHK Flat in {area}",
      "{bed}BHK Modern Apartment in {area}, {city}",
      "Well Maintained {bed}BHK Flat in {area}",
    ],
    rent: [
      "{bed}BHK Furnished Flat for Rent in {area}",
      "{bed}BHK Apartment for Rent near {area}",
      "Spacious {bed}BHK Rental in {area}",
      "{bed}BHK Semi-Furnished Flat in {area}",
      "Affordable {bed}BHK Flat for Rent in {area}",
      "{bed}BHK AC Flat for Rent in {area}, {city}",
    ],
  },
  house: {
    sale: [
      "{bed}BHK Independent House in {area}",
      "Premium Villa for Sale in {area}",
      "{bed}BHK Duplex House in {area}, {city}",
      "Independent {bed}BHK House with Garden in {area}",
      "Newly Built {bed}BHK House in {area}",
      "Corner Plot House in {area}",
    ],
    rent: [
      "{bed}BHK House for Rent in {area}",
      "Independent House for Rent in {area}",
      "Spacious {bed}BHK House with Parking in {area}",
      "Furnished {bed}BHK Villa for Rent in {area}",
    ],
  },
  plot: {
    sale: [
      "Residential Plot {sqft} Sqft in {area}",
      "DTCP Approved Plot in {area}, {city}",
      "Corner Plot for Sale in {area}",
      "Premium Plot near {area}",
      "Investment Plot in {area}, {city}",
      "Gated Community Plot in {area}",
    ],
    rent: [
      "Open Land for Lease in {area}",
      "Commercial Plot for Rent in {area}",
      "Fenced Plot for Rent in {area}, {city}",
    ],
  },
  commercial: {
    sale: [
      "Office Space {sqft} Sqft in {area}",
      "Commercial Shop for Sale in {area}",
      "Showroom Space in {area}, {city}",
      "IT Office Space in {area}",
      "Prime Commercial Space in {area}",
      "Retail Shop in {area} Main Road",
    ],
    rent: [
      "Office Space for Rent in {area}",
      "Shop for Rent in {area}, {city}",
      "Furnished Office for Rent in {area}",
      "Co-working Space in {area}",
      "Commercial Space for Lease in {area}",
    ],
  },
};

const DESCRIPTIONS = {
  flat: [
    "Well-maintained apartment with modern interiors, modular kitchen, and ample natural light. Located in a prime residential area with excellent connectivity to public transport, schools, and hospitals. Society has 24/7 security and power backup.",
    "Beautifully designed flat with spacious rooms, balcony with panoramic views, and premium fittings. Walking distance to metro station, malls, and IT offices. Gated community with all modern amenities.",
    "Comfortable and airy apartment in a reputed society. Features vitrified tiles, branded fittings, and covered parking. Close to major schools, supermarkets, and entertainment zones.",
    "Elegant apartment with cross ventilation, wooden flooring in master bedroom, and designer bathrooms. Well-connected location with easy access to highways and airports.",
    "Thoughtfully planned apartment with dedicated study room, servant quarter, and dry balcony. Society amenities include gym, pool, clubhouse, and landscaped gardens.",
  ],
  house: [
    "Independent house with private garden, terrace, and dedicated car parking. Quiet residential neighbourhood with good connectivity. Ideal for families looking for space and privacy.",
    "Spacious villa with modern architecture, modular kitchen, and premium interiors. Located in a gated community with round-the-clock security and clubhouse facilities.",
    "Beautifully maintained independent house with separate entrance, servant quarter, and rainwater harvesting. Close to schools, hospitals, and shopping centers.",
    "Double-storey house with rooftop terrace, large living area, and walk-in closets. Corner plot with excellent ventilation and natural light from all sides.",
  ],
  plot: [
    "RERA registered residential plot with clear title and all approvals in place. Well-developed area with roads, drainage, and street lighting. Excellent investment opportunity.",
    "Premium plot in a gated community with landscaped common areas. Close to upcoming metro station and expressway. Water and electricity connections available.",
    "East-facing corner plot with wide road access. Ideal for building a dream home. Surrounded by established residential colonies and commercial zones.",
  ],
  commercial: [
    "Prime commercial space with road-facing visibility and high footfall area. Suitable for retail showroom, restaurant, or office. Power backup and parking available.",
    "Modern office space with workstations, conference room, and pantry area. IT park location with excellent connectivity. Fully air-conditioned with 24/7 access.",
    "Well-maintained commercial property in a busy market area. Ground floor with separate restroom and storage space. Ideal for any business setup.",
  ],
};

// ── Helpers ──
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const generatePhone = () => {
  const prefix = pick(["6", "7", "8", "9"]);
  let num = prefix;
  for (let i = 0; i < 9; i++) num += rand(0, 9);
  return num;
};

const generateEmail = (index) => {
  const names = ["rahul", "priya", "amit", "sneha", "vikram", "neha", "arjun", "kavya", "rohan", "anita", "suresh", "pooja", "deepak", "meera", "rajesh", "sonia"];
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "rediffmail.com"];
  return `${pick(names)}${rand(10, 999)}@${pick(domains)}`;
};

function generateProperty(index, vendorId) {
  const loc = pick(LOCATIONS);
  const areaObj = pick(loc.areas);
  const propertyType = pick(PROPERTY_TYPES);
  const listingType = pick(LISTING_TYPES);

  const isResidential = propertyType === "flat" || propertyType === "house";

  // Bedrooms based on type
  let bedrooms, bathrooms;
  if (isResidential) {
    bedrooms = pick([1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5]);
    bathrooms = Math.min(bedrooms, rand(1, bedrooms + 1));
  }

  // Area sqft
  let areaSqft;
  if (propertyType === "flat") areaSqft = rand(400, 2500);
  else if (propertyType === "house") areaSqft = rand(800, 5000);
  else if (propertyType === "plot") areaSqft = rand(500, 10000);
  else areaSqft = rand(200, 5000);

  // Price
  let price;
  if (listingType === "sale") {
    if (propertyType === "flat") price = rand(15, 300) * 100000;
    else if (propertyType === "house") price = rand(30, 800) * 100000;
    else if (propertyType === "plot") price = rand(10, 500) * 100000;
    else price = rand(20, 600) * 100000;
  } else {
    if (propertyType === "flat") price = rand(5, 80) * 1000;
    else if (propertyType === "house") price = rand(10, 150) * 1000;
    else if (propertyType === "plot") price = rand(5, 50) * 1000;
    else price = rand(10, 200) * 1000;
  }

  // Furnishing for residential
  const furnishing = isResidential ? pick(FURNISHING) : "unfurnished";

  // Amenities
  const numAmenities = rand(2, 6);
  const amenities = pickN(AMENITIES, numAmenities);

  // Images
  const numImages = rand(1, 4);
  const images = pickN(IMAGES, numImages);

  // Title
  const templates = TITLES[propertyType][listingType];
  let title = pick(templates)
    .replace("{bed}", bedrooms || "")
    .replace("{sqft}", areaSqft)
    .replace("{area}", areaObj.area)
    .replace("{city}", loc.city);

  // Description
  const description = pick(DESCRIPTIONS[propertyType]);

  return {
    vendorId,
    listingType,
    propertyType,
    title,
    description,
    price,
    location: {
      city: loc.city,
      area: areaObj.area,
      state: loc.state,
      pincode: areaObj.pincode,
    },
    bedrooms: isResidential ? bedrooms : undefined,
    bathrooms: isResidential ? bathrooms : undefined,
    areaSqft,
    furnishing,
    amenities,
    images,
    contactPhone: generatePhone(),
    contactEmail: generateEmail(index),
    planType: Math.random() < 0.2 ? "paid" : "free",
    status: "active",
    viewCount: rand(0, 200),
    contactUnlockCount: rand(0, 30),
  };
}

// ── Main seed function ──
const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get a real user to assign as vendor
    const user = await User.findOne({ role: "user" });
    if (!user) {
      console.error("No user found in database. Create a user account first, then run seed.");
      process.exit(1);
    }

    console.log(`Using vendor: ${user.name} (${user.email})`);

    // Generate 1000 properties
    const TOTAL = 1000;
    const properties = [];
    for (let i = 0; i < TOTAL; i++) {
      properties.push(generateProperty(i, user._id));
    }

    // Clear old seeded data and insert new
    await Property.deleteMany({});
    console.log("Cleared existing properties");

    // Insert in batches of 100 for performance
    const BATCH = 100;
    for (let i = 0; i < properties.length; i += BATCH) {
      const batch = properties.slice(i, i + BATCH);
      await Property.insertMany(batch);
      console.log(`Inserted ${Math.min(i + BATCH, TOTAL)} / ${TOTAL}`);
    }

    console.log(`Done! Seeded ${TOTAL} properties across ${LOCATIONS.length} cities.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedDB();
