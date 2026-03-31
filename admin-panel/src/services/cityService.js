import axios from "axios";

const STATES_API = "https://countriesnow.space/api/v0.1/countries/states";
const STATE_CITIES_API = "https://countriesnow.space/api/v0.1/countries/state/cities";

let cachedLocations = null;

// Major districts that users commonly search for
const MAJOR_DISTRICTS = [
  { name: "Pune", state: "Maharashtra" },
  { name: "Thane", state: "Maharashtra" },
  { name: "Gurugram", state: "Haryana" },
  { name: "Noida", state: "Uttar Pradesh" },
  { name: "Ghaziabad", state: "Uttar Pradesh" },
  { name: "Faridabad", state: "Haryana" },
  { name: "Navi Mumbai", state: "Maharashtra" },
  { name: "Greater Noida", state: "Uttar Pradesh" },
  { name: "Dwarka", state: "Delhi" },
  { name: "Rohini", state: "Delhi" },
  { name: "Andheri", state: "Maharashtra" },
  { name: "Bandra", state: "Maharashtra" },
  { name: "Whitefield", state: "Karnataka" },
  { name: "Electronic City", state: "Karnataka" },
  { name: "Gachibowli", state: "Telangana" },
  { name: "Hinjewadi", state: "Maharashtra" },
  { name: "Wakad", state: "Maharashtra" },
  { name: "Baner", state: "Maharashtra" },
  { name: "Salt Lake", state: "West Bengal" },
  { name: "New Town", state: "West Bengal" },
];

async function fetchStates() {
  try {
    const res = await axios.post(STATES_API, { country: "India" });
    if (res.data && !res.data.error && res.data.data?.states) {
      return res.data.data.states.map((s) => s.name).sort();
    }
    return [];
  } catch {
    return [];
  }
}

async function fetchCitiesForState(state) {
  try {
    const res = await axios.post(STATE_CITIES_API, {
      country: "India",
      state,
    });
    if (res.data && !res.data.error && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchIndianLocations() {
  if (cachedLocations) return cachedLocations;

  try {
    const states = await fetchStates();
    const locations = [];

    // Add all states
    for (const state of states) {
      locations.push({ name: state, type: "State", state: "" });
    }

    // Fetch cities for major states in parallel (top states by real estate demand)
    const majorStates = [
      "Maharashtra",
      "Karnataka",
      "Delhi",
      "Telangana",
      "Tamil Nadu",
      "Uttar Pradesh",
      "Gujarat",
      "Haryana",
      "West Bengal",
      "Rajasthan",
      "Kerala",
      "Madhya Pradesh",
      "Punjab",
      "Andhra Pradesh",
      "Bihar",
    ];

    const cityPromises = majorStates.map(async (state) => {
      const cities = await fetchCitiesForState(state);
      return cities.map((cityName) => ({
        name: cityName,
        type: "City",
        state,
      }));
    });

    const cityResults = await Promise.all(cityPromises);
    const citySet = new Set();

    for (const cities of cityResults) {
      for (const city of cities) {
        const key = `${city.name}-${city.state}`;
        if (!citySet.has(key)) {
          citySet.add(key);
          locations.push(city);
        }
      }
    }

    // Add major districts (deduplicated)
    for (const district of MAJOR_DISTRICTS) {
      const key = `${district.name}-${district.state}`;
      if (!citySet.has(key)) {
        citySet.add(key);
        locations.push({
          name: district.name,
          type: "District",
          state: district.state,
        });
      }
    }

    cachedLocations = locations;
    return locations;
  } catch {
    return [];
  }
}

export function filterLocations(locations, query) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  const matches = locations.filter(
    (loc) =>
      loc.name.toLowerCase().startsWith(q) ||
      loc.name.toLowerCase().includes(q)
  );

  // Prioritize: exact prefix matches first, then states, cities, districts
  const priorityOrder = { State: 0, City: 1, District: 2 };

  matches.sort((a, b) => {
    const aStartsWith = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bStartsWith = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith;
    return priorityOrder[a.type] - priorityOrder[b.type];
  });

  return matches.slice(0, 12);
}
