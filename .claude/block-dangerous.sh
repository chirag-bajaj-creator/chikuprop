#!/bin/bash
# Blocks dangerous commands before Claude runs them
INPUT="$CLAUDE_TOOL_INPUT"

if echo "$INPUT" | grep -qiE "rm\s+-rf|drop\s+database|drop\s+collection|git\s+push|git\s+reset"; then
  echo "BLOCKED: Dangerous command detected" >&2
  exit 2
fi

exit 0