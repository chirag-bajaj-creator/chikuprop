---
paths:
  - "server/models/**"
---
- Every Mongoose schema must have timestamps: true
- Add validation on required fields (required, minlength, maxlength, enum)
- Use ref and ObjectId for relationships — never store duplicate data
- Add index on fields used for searching or filtering (city, price, propertyType)
- Never use String for fields that should be ObjectId references
- Export as: module.exports = mongoose.model('Name', schema)