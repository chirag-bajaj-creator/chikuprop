#!/bin/bash
# Catches hardcoded secrets, API keys, and passwords in code

FILE_PATH="$CLAUDE_FILE_PATH"

# Skip non-code files
if [[ ! "$FILE_PATH" =~ \.(js|jsx|ts|tsx|json)$ ]]; then
  exit 0
fi

# Skip .env files (handled by another hook)
if [[ "$FILE_PATH" =~ \.env ]]; then
  exit 0
fi

CONTENT="$CLAUDE_FILE_CONTENT"

# Check for hardcoded secrets patterns
if echo "$CONTENT" | grep -qiE "(api[_-]?key|api[_-]?secret|password|secret[_-]?key|access[_-]?token|private[_-]?key)\s*[:=]\s*['\"][a-zA-Z0-9]"; then
  echo "SECURITY: Possible hardcoded secret detected. Use environment variables instead." >&2
  echo "BLOCK"
  exit 0
fi

# Check for MongoDB connection strings with credentials
if echo "$CONTENT" | grep -qiE "mongodb(\+srv)?://[a-zA-Z0-9]+:[a-zA-Z0-9]+@"; then
  echo "SECURITY: Hardcoded MongoDB connection string with credentials. Use process.env instead." >&2
  echo "BLOCK"
  exit 0
fi

# Check for JWT secrets hardcoded
if echo "$CONTENT" | grep -qiE "jwt\.sign\(.*['\"][a-zA-Z0-9]{8,}['\"]"; then
  echo "SECURITY: Hardcoded JWT secret. Use process.env.JWT_SECRET instead." >&2
  echo "BLOCK"
  exit 0
fi

exit 0
