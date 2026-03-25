Create a complete API route for: $ARGUMENTS

## Step 1 — Scan first
- Look at the existing backend folder structure
- Check how other resources are organized (which folders, file naming pattern, code style)
- Follow the same pattern exactly — if there are separate folders for validators, services, middleware, etc., create files in all relevant folders

## Step 2 — Show the plan
- List every file you will create or modify
- Ask for my approval before writing anything

## Step 3 — Build it
- Generate all files matching the existing project pattern
- If the resource needs image/video uploads, integrate Cloudinary
- Check existing models and add Mongoose `ref` fields if this resource relates to other models
- Register the new route in the main server file (app.js / index.js) where other routes are imported

## Rules
- Every async function MUST use try-catch
- Validate required fields before saving to MongoDB
- Use proper HTTP status codes (201, 200, 400, 404, 500)
- Add auth middleware placeholder on protected routes
- Follow naming conventions from the project (camelCase variables, PascalCase models)
- Keep it simple — no over-engineering
