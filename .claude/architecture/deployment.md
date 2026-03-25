# Deployment Architecture

## Frontend — Vercel
- Connect GitHub repo → auto-deploy on push
- Environment variable: `VITE_API_URL` pointing to Render backend URL
- Build command: `npm run build`
- Output directory: `dist`

## Backend — Render
- Connect GitHub repo → auto-deploy on push
- Environment variables:
  - `MONGO_URI` — MongoDB Atlas connection string
  - `JWT_SECRET` — secret key for JWT signing
  - `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name
  - `CLOUDINARY_API_KEY` — Cloudinary API key
  - `CLOUDINARY_API_SECRET` — Cloudinary API secret
  - `CLIENT_URL` — frontend URL for CORS whitelist
  - `PORT` — server port (Render sets this automatically)
- Start command: `node server.js`

## Database — MongoDB Atlas
- Free tier (M0) to start
- Region: Mumbai (closest to Indian users)
- Indexes:
  - User: email (unique)
  - Property: city + listingType + status (compound)
  - Lead: vendorId, propertyId
  - SavedProperty: userId + propertyId (compound unique)

## Cloudinary
- Free tier to start
- Used for:
  - Property listing images (multiple per property)
  - Property videos
  - Vendor profile pictures
- Upload via backend (not directly from frontend) for security

## CORS Setup
- Allow only the Vercel frontend URL
- Allow credentials for JWT cookies if needed
