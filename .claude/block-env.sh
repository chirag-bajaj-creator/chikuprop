#!/bin/bash
# Blocks any read or write to .env files

FILE_PATH="$CLAUDE_FILE_PATH"

if [[ "$FILE_PATH" =~ \.env ]]; then
  echo "BLOCKED: Cannot access .env files — secrets must stay protected." >&2
  echo "BLOCK"
  exit 0
fi

exit 0
