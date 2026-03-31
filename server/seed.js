const mongoose = require("mongoose");
require("dotenv").config();
const Property = require("./models/Property");
const User = require("./models/User");

// ── Indian cities across all 29 states with areas and pincodes ──
const LOCATIONS = [
  // Maharashtra
  { city: "Mumbai", state: "Maharashtra", areas: [
    { area: "Andheri West", pincode: "400053" }, // Mumbai
    { area: "Bandra East", pincode: "400051" }, // Mumbai
    { area: "Powai", pincode: "400076" }, // Mumbai
    { area: "Worli", pincode: "400018" }, // Mumbai
    { area: "Malad West", pincode: "400064" }, // Mumbai
    { area: "Goregaon East", pincode: "400063" }, // Mumbai
    { area: "Juhu", pincode: "400049" }, // Mumbai
    { area: "Borivali West", pincode: "400092" }, // Mumbai
  ]},
  { city: "Pune", state: "Maharashtra", areas: [
    { area: "Hinjewadi", pincode: "411057" }, // Pune
    { area: "Kharadi", pincode: "411014" }, // Pune
    { area: "Baner", pincode: "411045" }, // Pune
    { area: "Wakad", pincode: "411057" }, // Pune
    { area: "Viman Nagar", pincode: "411014" }, // Pune
    { area: "Koregaon Park", pincode: "411001" }, // Pune
  ]},
  { city: "Nagpur", state: "Maharashtra", areas: [
    { area: "Dharampeth", pincode: "440008" }, // Nagpur
    { area: "Sitabuldi", pincode: "440012" }, // Nagpur
    { area: "Civil Lines", pincode: "440001" }, // Nagpur
    { area: "Dakshin Gaon", pincode: "440009" }, // Nagpur
  ]},
  // Delhi
  { city: "Delhi", state: "Delhi", areas: [
    { area: "Connaught Place", pincode: "110001" }, // Delhi
    { area: "Dwarka", pincode: "110075" }, // Delhi
    { area: "Rohini", pincode: "110085" }, // Delhi
    { area: "Saket", pincode: "110017" }, // Delhi
    { area: "Vasant Kunj", pincode: "110070" }, // Delhi
    { area: "Lajpat Nagar", pincode: "110024" }, // Delhi
  ]},
  // Karnataka
  { city: "Bangalore", state: "Karnataka", areas: [
    { area: "Koramangala", pincode: "560034" }, // Bangalore
    { area: "Whitefield", pincode: "560066" }, // Bangalore
    { area: "Indiranagar", pincode: "560038" }, // Bangalore
    { area: "HSR Layout", pincode: "560102" }, // Bangalore
    { area: "Electronic City", pincode: "560100" }, // Bangalore
    { area: "Jayanagar", pincode: "560011" }, // Bangalore
  ]},
  { city: "Mysore", state: "Karnataka", areas: [
    { area: "Sayyaji Rao Road", pincode: "570001" }, // Mysore
    { area: "Vijayanagar", pincode: "570009" }, // Mysore
    { area: "Kuvempu Road", pincode: "570001" }, // Mysore
    { area: "Nazarbad", pincode: "570004" }, // Mysore
  ]},
  // Telangana
  { city: "Hyderabad", state: "Telangana", areas: [
    { area: "Gachibowli", pincode: "500032" }, { area: "HITEC City", pincode: "500081" },
    { area: "Banjara Hills", pincode: "500034" }, { area: "Kondapur", pincode: "500084" },
    { area: "Jubilee Hills", pincode: "500033" }, { area: "Kukatpally", pincode: "500072" },
  ]},
  // Tamil Nadu
  { city: "Chennai", state: "Tamil Nadu", areas: [
    { area: "Anna Nagar", pincode: "600040" }, { area: "T Nagar", pincode: "600017" },
    { area: "Adyar", pincode: "600020" }, { area: "Velachery", pincode: "600042" },
    { area: "OMR", pincode: "600119" }, { area: "Porur", pincode: "600116" },
  ]},
  { city: "Coimbatore", state: "Tamil Nadu", areas: [
    { area: "RS Puram", pincode: "641002" }, { area: "Kovaipudur", pincode: "641042" },
    { area: "Gandhipuram", pincode: "641012" }, { area: "Race Course", pincode: "641018" },
  ]},
  // West Bengal
  { city: "Kolkata", state: "West Bengal", areas: [
    { area: "Salt Lake", pincode: "700091" }, { area: "New Town", pincode: "700156" },
    { area: "Rajarhat", pincode: "700135" }, { area: "Alipore", pincode: "700027" },
    { area: "Ballygunge", pincode: "700019" }, { area: "Behala", pincode: "700034" },
  ]},
  // Haryana
  { city: "Gurgaon", state: "Haryana", areas: [
    { area: "DLF Phase 3", pincode: "122002" }, { area: "Sector 56", pincode: "122011" },
    { area: "Sector 17", pincode: "122001" }, { area: "Sector 22", pincode: "122015" },
    { area: "Sohna Road", pincode: "122018" }, { area: "Golf Course Road", pincode: "122002" },
  ]},
  { city: "Faridabad", state: "Haryana", areas: [
    { area: "Sector 37", pincode: "121003" }, { area: "Sector 31", pincode: "121003" },
    { area: "Charmwood", pincode: "121001" }, { area: "NIT", pincode: "121001" },
  ]},
  // Uttar Pradesh
  { city: "Noida", state: "Uttar Pradesh", areas: [
    { area: "Sector 62", pincode: "201301" }, { area: "Sector 137", pincode: "201305" },
    { area: "Sector 150", pincode: "201310" }, { area: "Sector 75", pincode: "201301" },
  ]},
  { city: "Lucknow", state: "Uttar Pradesh", areas: [
    { area: "Gomti Nagar", pincode: "226010" }, { area: "Hazratganj", pincode: "226001" },
    { area: "Aliganj", pincode: "226024" }, { area: "Indira Nagar", pincode: "226016" },
  ]},
  { city: "Agra", state: "Uttar Pradesh", areas: [
    { area: "Sadar Bazaar", pincode: "282001" }, { area: "Fatehabad Road", pincode: "282001" },
    { area: "Kamla Nagar", pincode: "282005" }, { area: "Civil Lines", pincode: "282002" },
  ]},
  // Gujarat
  { city: "Ahmedabad", state: "Gujarat", areas: [
    { area: "SG Highway", pincode: "380054" }, { area: "Prahlad Nagar", pincode: "380015" },
    { area: "Bodakdev", pincode: "380054" }, { area: "Satellite", pincode: "380015" },
  ]},
  { city: "Surat", state: "Gujarat", areas: [
    { area: "Vesu", pincode: "395007" }, { area: "Adajan", pincode: "395009" },
    { area: "Pal", pincode: "395009" }, { area: "Urvashi Complex", pincode: "395002" },
  ]},
  // Rajasthan
  { city: "Jaipur", state: "Rajasthan", areas: [
    { area: "Malviya Nagar", pincode: "302017" }, { area: "Vaishali Nagar", pincode: "302021" },
    { area: "Mansarovar", pincode: "302020" }, { area: "C-Scheme", pincode: "302001" },
  ]},
  // Madhya Pradesh
  { city: "Indore", state: "Madhya Pradesh", areas: [
    { area: "Vijay Nagar", pincode: "452010" }, { area: "Palasia", pincode: "452001" },
    { area: "AB Road", pincode: "452001" }, { area: "Super Corridor", pincode: "452010" },
  ]},
  { city: "Bhopal", state: "Madhya Pradesh", areas: [
    { area: "Arera Colony", pincode: "462016" }, { area: "New Market", pincode: "462001" },
    { area: "Habibganj", pincode: "462001" }, { area: "South TT Nagar", pincode: "462003" },
  ]},
  // Kerala
  { city: "Kochi", state: "Kerala", areas: [
    { area: "Edappally", pincode: "682024" }, { area: "Kakkanad", pincode: "682030" },
    { area: "Marine Drive", pincode: "682031" }, { area: "Vyttila", pincode: "682019" },
  ]},
  { city: "Thiruvananthapuram", state: "Kerala", areas: [
    { area: "Pattom", pincode: "695004" }, { area: "Vazhuthacaud", pincode: "695014" },
    { area: "Karamana", pincode: "695002" }, { area: "Vanchiyoor", pincode: "695035" },
  ]},
  // Chandigarh
  { city: "Chandigarh", state: "Chandigarh", areas: [
    { area: "Sector 17", pincode: "160017" }, { area: "Sector 35", pincode: "160035" },
    { area: "Sector 44", pincode: "160044" }, { area: "Sector 22", pincode: "160022" },
  ]},
  // Punjab
  { city: "Amritsar", state: "Punjab", areas: [
    { area: "Ranjit Avenue", pincode: "143001" }, { area: "Cantonment", pincode: "143001" },
    { area: "Mall Road", pincode: "143001" }, { area: "Krishna Nagar", pincode: "143002" },
  ]},
  { city: "Ludhiana", state: "Punjab", areas: [
    { area: "Ferozepur Road", pincode: "141001" }, { area: "Sarabha Nagar", pincode: "141010" },
    { area: "East Ludhiana", pincode: "141008" }, { area: "Gill Road", pincode: "141003" },
  ]},
  // Himachal Pradesh
  { city: "Shimla", state: "Himachal Pradesh", areas: [
    { area: "Lakkar Bazaar", pincode: "171001" }, { area: "The Mall", pincode: "171001" },
    { area: "Chaura Maidan", pincode: "171002" }, { area: "Kasumpti", pincode: "171009" },
  ]},
  // Uttarakhand
  { city: "Dehradun", state: "Uttarakhand", areas: [
    { area: "Saharanpur Road", pincode: "248001" }, { area: "Paltan Bazaar", pincode: "248001" },
    { area: "Rajpur Road", pincode: "248009" }, { area: "Clement Town", pincode: "248005" },
  ]},
  // Bihar
  { city: "Patna", state: "Bihar", areas: [
    { area: "Patna City", pincode: "800001" }, { area: "Boring Road", pincode: "800013" },
    { area: "Kankarbagh", pincode: "800020" }, { area: "Rajendra Nagar", pincode: "800016" },
  ]},
  // Jharkhand
  { city: "Ranchi", state: "Jharkhand", areas: [
    { area: "Lalpur", pincode: "834001" }, { area: "Purulia Road", pincode: "834002" },
    { area: "Doranda", pincode: "834002" }, { area: "Ashok Nagar", pincode: "834002" },
  ]},
  // Odisha
  { city: "Bhubaneswar", state: "Odisha", areas: [
    { area: "Patrapada", pincode: "751019" }, { area: "IRC Village", pincode: "751015" },
    { area: "Kharavela Nagar", pincode: "751001" }, { area: "Dumduma", pincode: "751002" },
  ]},
  // Assam
  { city: "Guwahati", state: "Assam", areas: [
    { area: "Paltan Bazaar", pincode: "781001" }, { area: "Guwahati City", pincode: "781001" },
    { area: "Uzanbazar", pincode: "781005" }, { area: "Bhangagarh", pincode: "781006" },
  ]},
  // Chhattisgarh
  { city: "Raipur", state: "Chhattisgarh", areas: [
    { area: "Shankar Nagar", pincode: "492007" }, { area: "Devendra Nagar", pincode: "492009" },
    { area: "GE Road", pincode: "492001" }, { area: "Pandri", pincode: "492004" },
  ]},
  // Goa
  { city: "Panaji", state: "Goa", areas: [
    { area: "Panjim", pincode: "403001" }, { area: "Altinho", pincode: "403006" },
    { area: "Ribandar", pincode: "403002" }, { area: "Miramar", pincode: "403001" },
  ]},
  // Tripura
  { city: "Agartala", state: "Tripura", areas: [
    { area: "Amar Nagar", pincode: "799001" }, { area: "Laxmi Nagar", pincode: "799001" },
    { area: "Sukanta Path", pincode: "799005" }, { area: "BK Road", pincode: "799001" },
  ]},
  // Arunachal Pradesh
  { city: "Itanagar", state: "Arunachal Pradesh", areas: [
    { area: "Naharlagun", pincode: "791110" }, { area: "Itanagar City", pincode: "791111" },
    { area: "Vivek Vihar", pincode: "791110" }, { area: "Lekhi", pincode: "791113" },
  ]},
  // Manipur
  { city: "Imphal", state: "Manipur", areas: [
    { area: "Keishamthong", pincode: "795001" }, { area: "Imphal City", pincode: "795001" },
    { area: "Chingmeirong", pincode: "795008" }, { area: "Lamphelpat", pincode: "795010" },
  ]},
  // Meghalaya
  { city: "Shillong", state: "Meghalaya", areas: [
    { area: "Police Bazaar", pincode: "793001" }, { area: "Laitumkhrah", pincode: "793007" },
    { area: "Nongkhadem", pincode: "793011" }, { area: "Mawkhar", pincode: "793003" },
  ]},
  // Mizoram
  { city: "Aizawl", state: "Mizoram", areas: [
    { area: "Aizawl City Center", pincode: "796001" }, { area: "Chanmari", pincode: "796005" },
    { area: "Dawrpui", pincode: "796911" }, { area: "Sylhet", pincode: "796004" },
  ]},
  // Nagaland
  { city: "Kohima", state: "Nagaland", areas: [
    { area: "Kohima City", pincode: "797001" }, { area: "Near Zoo", pincode: "797001" },
    { area: "Second Gate", pincode: "797001" }, { area: "Opposite Secretariat", pincode: "797001" },
  ]},
  // Sikkim
  { city: "Gangtok", state: "Sikkim", areas: [
    { area: "MG Marg", pincode: "737001" }, { area: "Gangtok City Center", pincode: "737001" },
    { area: "Deorali", pincode: "737101" }, { area: "Ranipool", pincode: "737001" },
  ]},
  // Andhra Pradesh
  { city: "Visakhapatnam", state: "Andhra Pradesh", areas: [
    { area: "Visakhapatnam City", pincode: "530001" }, { area: "Gajuwaka", pincode: "530026" },
    { area: "Dwarakanagar", pincode: "530020" }, { area: "Seethammapeta", pincode: "530013" },
  ]},
  // Haryana - additional city
  { city: "Hisar", state: "Haryana", areas: [
    { area: "City Center", pincode: "125001" }, { area: "New Garden", pincode: "125001" },
    { area: "Rajendra Colony", pincode: "125001" }, { area: "HUDA City", pincode: "125001" },
  ]},
];

const PROPERTY_TYPES = ["flat", "house", "plot", "commercial"];
const LISTING_TYPES = ["sale", "rent"];
const FURNISHING = ["furnished", "semi-furnished", "unfurnished"];
const AMENITIES = ["Parking", "Gym", "Swimming Pool", "Garden", "Security", "Elevator", "Power Backup", "Water Supply", "Club House", "Playground"];

// Categorized images by property type and bedrooms
const IMAGE_CATEGORIES = {
  "1-BHK-flat": [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  ],
  "2-BHK-flat": [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800",
  ],
  "3-BHK-flat": [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    "https://images.unsplash.com/photo-1600573472591-ee6981cf81d6?w=800",
  ],
  "4-BHK-flat": [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
  ],
  "1-BHK-house": [
    "https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=800",
    "https://images.unsplash.com/photo-1540932239986-310128078ceb?w=800",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
  ],
  "2-BHK-house": [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  ],
  "3-BHK-house": [
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
    "https://images.unsplash.com/photo-1600573472591-ee6981cf81d6?w=800",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
  ],
  "4-BHK-house": [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
  ],
  "plot": [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
    "https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=800",
    "https://images.unsplash.com/photo-1486182143442-1ff80fc737a2?w=800",
  ],
  "commercial": [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
  ],
};

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

const PROJECT_NAMES = [
  "Maya Garden", "Sona Road", "DLF Privé", "Lodha Meridian", "Prestige Towers", "Godrej Platinum", "Oberoi Realty", "Hiranandani",
  "ATS One", "Emaar MGF", "Shriram Properties", "Mahindra Lifespace", "Brigade Group", "Puravankara", "Salarpuria Sattva",
  "Provident Housing", "Kolte-Patil", "Rohan Lifescapes", "Gini & Jony", "L&T Realty",
];

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

const generateEmail = () => {
  const names = ["rahul", "priya", "amit", "sneha", "vikram", "neha", "arjun", "kavya", "rohan", "anita", "suresh", "pooja", "deepak", "meera", "rajesh", "sonia"];
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "rediffmail.com"];
  return `${pick(names)}${rand(10, 999)}@${pick(domains)}`;
};

function generateProperty(loc, areaObj, vendorId) {
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

  // Images — select from category based on property type and bedrooms
  let imageCategory = "plot"; // Default fallback

  if (propertyType === "flat" && bedrooms) {
    const bhkCount = bedrooms > 4 ? 4 : bedrooms; // Cap at 4 BHK
    imageCategory = `${bhkCount}-BHK-flat`;
  } else if (propertyType === "house" && bedrooms) {
    const bhkCount = bedrooms > 4 ? 4 : bedrooms; // Cap at 4 BHK
    imageCategory = `${bhkCount}-BHK-house`;
  } else if (propertyType === "plot") {
    imageCategory = "plot";
  } else if (propertyType === "commercial") {
    imageCategory = "commercial";
  } else {
    // Fallback for any unexpected property type
    imageCategory = "plot";
  }

  // Get category images or use plot as fallback
  let categoryImages = IMAGE_CATEGORIES[imageCategory];
  if (!categoryImages) {
    categoryImages = IMAGE_CATEGORIES["plot"];
  }

  // Always ensure we have images array
  const numImages = Math.max(1, rand(1, 4)); // Ensure at least 1 image
  let images = pickN(categoryImages, Math.min(numImages, categoryImages.length));

  // Triple safety: ensure images array is NEVER empty
  if (!images || images.length === 0 || !Array.isArray(images)) {
    images = [IMAGE_CATEGORIES["plot"][0]];
  }

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
    projectName: pick(PROJECT_NAMES),
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
    contactEmail: generateEmail(),
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

    // Generate properties: 10 per city + 5 per area
    const properties = [];

    // Loop 1: 10 properties per city (area randomly chosen from that city's areas)
    for (const loc of LOCATIONS) {
      for (let i = 0; i < 10; i++) {
        const areaObj = pick(loc.areas);
        properties.push(generateProperty(loc, areaObj, user._id));
      }
    }

    // Loop 2: 5 properties per area (area fixed)
    for (const loc of LOCATIONS) {
      for (const areaObj of loc.areas) {
        for (let i = 0; i < 5; i++) {
          properties.push(generateProperty(loc, areaObj, user._id));
        }
      }
    }

    // Validation: Ensure all properties have at least 1 image
    let emptyImageCount = 0;
    properties.forEach((prop, idx) => {
      if (!prop.images || prop.images.length === 0) {
        console.warn(`Property ${idx} (${prop.title}) has NO images! Assigning fallback.`);
        prop.images = [IMAGE_CATEGORIES["plot"][0]];
        emptyImageCount++;
      }
    });

    if (emptyImageCount > 0) {
      console.log(`⚠️  Fixed ${emptyImageCount} properties with missing images`);
    } else {
      console.log(`✅ All ${properties.length} properties have images`);
    }

    // Clear old seeded data and insert new
    await Property.deleteMany({});
    console.log("Cleared existing properties");

    // Insert in batches of 100 for performance
    const BATCH = 100;
    for (let i = 0; i < properties.length; i += BATCH) {
      const batch = properties.slice(i, i + BATCH);
      await Property.insertMany(batch);
      console.log(`Inserted ${Math.min(i + BATCH, properties.length)} / ${properties.length}`);
    }

    // Final verification: check all properties in DB have images
    const allProps = await Property.find({});
    let dbEmptyCount = 0;
    allProps.forEach((prop) => {
      if (!prop.images || prop.images.length === 0) {
        dbEmptyCount++;
      }
    });

    if (dbEmptyCount === 0) {
      console.log(`✅ SUCCESS! All ${allProps.length} properties in database have images!`);
    } else {
      console.warn(`⚠️  ${dbEmptyCount} properties in database have NO images`);
    }

    console.log(`Done! Seeded ${properties.length} properties across ${LOCATIONS.length} cities.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedDB();
