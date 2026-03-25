Scaffold a new React page for: $ARGUMENTS

## Step 1 — Scan first
- Look at the existing frontend folder structure
- Check how other pages are organized (folder placement, file naming, code style)
- Follow the same pattern exactly

## Step 2 — Show the plan
- List every file you will create or modify
- Ask for my approval before writing anything

## Step 3 — Build it
- Create the page component matching the existing project pattern
- Include state for loading, error, and data
- Add useEffect for data fetching with proper cleanup function
- Handle all three UI states: loading (spinner/skeleton), error (message), and success (render data)
- If the page needs a form, add input validation before submission
- Add the route for this page in the router file where other pages are registered
-icons and assets should not be broken 
## Rules
- Follow existing naming conventions and folder structure
- Every async call must use try-catch
- useEffect must return a cleanup function
- Keep the component focused — one responsibility
- No over-engineering, keep it simple
- Follow all guardrails from CLAUDE.md
