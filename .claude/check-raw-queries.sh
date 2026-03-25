#!/bin/bash
# Catches raw MongoDB queries — forces Mongoose to prevent NoSQL injection

FILE_PATH="$CLAUDE_FILE_PATH"

# Only check backend JS files
if [[ ! "$FILE_PATH" =~ \.(js|ts)$ ]]; then
  exit 0
fi

CONTENT="$CLAUDE_FILE_CONTENT"

# Check for raw MongoDB driver usage instead of Mongoose
if echo "$CONTENT" | grep -qE "MongoClient|\.collection\(|\.db\("; then
  echo "SECURITY: Raw MongoDB driver detected. Use Mongoose models instead to prevent NoSQL injection." >&2
  echo "BLOCK"
  exit 0
fi

# Check for $where operator (allows JS injection)
if echo "$CONTENT" | grep -qE '"\$where"|'\''\$where'\''|\$where\s*:'; then
  echo "SECURITY: \$where operator found — this allows JavaScript injection. Use standard Mongoose queries." >&2
  echo "BLOCK"
  exit 0
fi

# Check for unsanitized user input in queries
if echo "$CONTENT" | grep -qE "find\(\s*req\.(body|query|params)\s*\)"; then
  echo "SECURITY: Passing raw req.body/query/params directly to find(). Validate and pick specific fields first." >&2
  echo "BLOCK"
  exit 0
fi

exit 0
