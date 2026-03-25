  ---
  path: client/**
  ---

- No direct API calls in components — put them in services/ folder     
  - Every form must validate inputs before submitting
  - Always show loading state during API calls
  - Always show error message when API call fails
  - No inline styles — keep all styling in CSS files
  - One component per file, file name matches component name
  - Always clean up useEffect (return cleanup function)
  - Keep components small — if over 150 lines, split it