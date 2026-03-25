# Database Architecture — MongoDB + Mongoose

## 6 Collections

### 1. User
- name (String, required)
- email (String, required, unique)
- phone (String, required)
- password (String, required, bcrypt hashed)
- role (String, enum: purchaser/tenant/vendor, required)
- profilePicture (String, Cloudinary URL)
- timestamps: true

### 2. Property
- vendorId (ObjectId, ref → User, required)
- listingType (String, enum: sale/rent, required)
- propertyType (String, enum: flat/house/plot/commercial, required)
- title (String, required)
- description (String, required)
- price (Number, required)
- location:
  - city (String, required)
  - area (String, required)
  - state (String, required)
  - pincode (String)
  - coordinates: { lat: Number, lng: Number }
- bedrooms (Number)
- bathrooms (Number)
- areaSqft (Number)
- furnishing (String, enum: furnished/semi-furnished/unfurnished)
- amenities ([String])
- images ([String], Cloudinary URLs)
- video (String, Cloudinary URL)
- contactPhone (String, required)
- contactEmail (String, required)
- planType (String, enum: free/paid, default: free)
- status (String, enum: active/paused/expired, default: active)
- viewCount (Number, default: 0)
- contactUnlockCount (Number, default: 0)
- timestamps: true

### 3. Lead (Heart of the app)
- propertyId (ObjectId, ref → Property, required)
- vendorId (ObjectId, ref → User, required)
- userId (ObjectId, ref → User, required)
- userRole (String, enum: purchaser/tenant, required)
- eventType (String, default: contact_unlock)
- timestamps: true

### 4. SavedProperty
- userId (ObjectId, ref → User, required)
- propertyId (ObjectId, ref → Property, required)
- timestamps: true

### 5. RecentlyViewed
- userId (ObjectId, ref → User, required)
- propertyId (ObjectId, ref → Property, required)
- viewedAt (Date, default: Date.now)

### 6. WantedProperty
- userId (ObjectId, ref → User, required)
- propertyType (String)
- location (String)
- budgetMin (Number)
- budgetMax (Number)
- description (String)
- status (String, enum: active/closed, default: active)
- timestamps: true

## Indexes
- User: email (unique)
- Property: city, listingType, status (compound)
- Lead: vendorId, propertyId
- SavedProperty: userId + propertyId (compound unique — prevent duplicate saves)

## Database: MongoDB Atlas (Free tier M0 to start)
