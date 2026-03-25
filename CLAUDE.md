# ChikuProp — Real Estate Listing Platform

## Description
A real estate listing platform for buyers, sellers, and renters in the Indian market.
Features include property listings, grievance management, and customized ads on the platform.

## Tech Stack
- Node.js + Express (backend)
- React + HTML/CSS (frontend)
- MongoDB with Mongoose (database)
- Cloudinary (image/video storage)
- Vercel (frontend deployment)
- Render (backend deployment)

## Boundaries — NEVER do these
- Never run any git command (push, pull, commit, checkout, revert) without permission
- Never access or modify .env or .env.local files
- Never modify the database without permission
- Never access, test, or delete auth routes or user sessions
- Never delete any file from the project

## Sensitive Areas — ASK before modifying
- User model (passwords, emails, personal data) — always confirm changes
- Auth middleware and login/signup logic — small mistakes break security
- Payment or billing logic — verify before any change
- CORS, rate limiting, or security middleware — affects entire app
- Database indexes or schema changes — can break existing data

## Code Quality Rules
- **Consistency & Style** — Use ESLint and Prettier to enforce naming conventions, indentation, and structure
- **Modularity & Simplicity** — One responsibility per component. Keep code simple, avoid "clever" solutions
- **DRY (Don't Repeat Yourself)** — Extract reusable logic into helper functions, components, or services
- **Meaningful Naming** — Use descriptive names that explain intent, not implementation
- **Error Handling** — Implement try-catch on both frontend and backend to prevent crashes
- **Documentation** — Comment on *why* something is done, not *what* (code should be self-explanatory)

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Guardrails — ALWAYS do these
- Always use try-catch in async route handlers
- Always validate user input before saving to MongoDB
- Always hash passwords with bcrypt before storing — never plain text
- Always handle loading and error states in React components
- Always clean up useEffect subscriptions (return cleanup function)
- Always send proper HTTP status codes (400, 401, 404, 500)
- Always use Mongoose schemas — never insert raw unvalidated data
- Always check authentication on protected API routes
