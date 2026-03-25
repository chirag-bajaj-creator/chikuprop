#!/bin/bash
# Catches XSS vulnerabilities in React code

FILE_PATH="$CLAUDE_FILE_PATH"

# Only check frontend files
if [[ ! "$FILE_PATH" =~ \.(jsx|tsx)$ ]]; then
  exit 0
fi

CONTENT="$CLAUDE_FILE_CONTENT"

# Check for dangerouslySetInnerHTML
if echo "$CONTENT" | grep -q "dangerouslySetInnerHTML"; then
  echo "SECURITY: dangerouslySetInnerHTML found — this allows XSS attacks. Use safe rendering instead." >&2
  echo "BLOCK"
  exit 0
fi

# Check for document.write
if echo "$CONTENT" | grep -q "document\.write"; then
  echo "SECURITY: document.write found — this can allow XSS. Use React state and JSX instead." >&2
  echo "BLOCK"
  exit 0
fi

# Check for innerHTML
if echo "$CONTENT" | grep -q "\.innerHTML\s*="; then
  echo "SECURITY: Direct innerHTML assignment found — use React's JSX rendering instead." >&2
  echo "BLOCK"
  exit 0
fi

exit 0
