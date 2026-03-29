import API from "./api";

/**
 * Fetch grouped search suggestions (projects, localities, cities) from DB.
 * @param {string} query - Search text (min 2 chars)
 */
export const getSearchSuggestions = async (query) => {
  const res = await API.get("/properties/search-suggestions", {
    params: { q: query },
  });
  return res.data.data;
};
