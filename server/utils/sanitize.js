// Strip HTML tags to prevent XSS — extracted for reuse across controllers
// Uses multi-pass approach to handle nested/malformed tags like <<script>script>
const stripHtml = (str) => {
  let cleaned = str;
  let prev;
  do {
    prev = cleaned;
    cleaned = cleaned.replace(/<[^>]*>/g, "");
  } while (cleaned !== prev);
  return cleaned.trim();
};

// Escape special regex characters to prevent ReDoS when using user input in $regex
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Validate that a URL is a safe Cloudinary URL — prevents storing arbitrary/malicious URLs
const isValidCloudinaryUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith("cloudinary.com");
  } catch {
    return false;
  }
};

module.exports = { stripHtml, escapeRegex, isValidCloudinaryUrl };
