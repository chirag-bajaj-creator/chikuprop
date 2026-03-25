const ALLOWED_AMENITIES = [
  "Parking",
  "Gym",
  "Swimming Pool",
  "Garden",
  "Security",
  "Elevator",
  "Power Backup",
  "Water Supply",
  "Club House",
  "Playground",
];

const PROTECTED_FIELDS = [
  "vendorId",
  "status",
  "planType",
  "viewCount",
  "contactUnlockCount",
  "createdAt",
  "updatedAt",
  "_id",
  "__v",
];

module.exports = { ALLOWED_AMENITIES, PROTECTED_FIELDS };
