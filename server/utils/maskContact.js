/**
 * Mask a phone number: 9876543210 → 98XXXXXX10
 * Shows first 2 and last 2 digits
 */
function maskPhone(phone) {
  if (!phone || phone.length < 4) return "XXXXXXXXXX";
  return phone.slice(0, 2) + "XXXXXX" + phone.slice(-2);
}

/**
 * Mask an email: chirag.bajaj@gmail.com → ch****@gmail.com
 * Shows first 2 characters of local part + domain
 */
function maskEmail(email) {
  if (!email || !email.includes("@")) return "****@****.com";
  const [local, domain] = email.split("@");
  const visible = local.slice(0, 2);
  return visible + "****@" + domain;
}

module.exports = { maskPhone, maskEmail };
