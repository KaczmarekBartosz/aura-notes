# Operations — Critical Access Map (No Secrets)

Purpose: eliminate "memory gaps" for recurring tool access.

## X/Twitter bookmarks (bird)

- Primary command: `tools/birdx bookmarks -n 50 --json`
- Wrapper path: `/home/ubuntu/clawd/tools/birdx`
- Credential source fallback: `~/.config/bird/config.json5`
- Required fields: `authToken`, `ct0`

## Non-negotiable rule

- Never persist raw tokens in repo memory files.
- Always persist retrieval path/procedure.

## Deploy branch guardrail (Netlify)

- Before coding for deploy: confirm target branch (`main` or `master`).
- After push: verify remote head SHA on deploy branch.
- Treat task as done only after remote SHA matches expected commit.

## Triage sequence (must follow)

1. Run with wrapper (`tools/birdx ...`).
2. If fail: classify root cause (missing/invalid/rate-limit/network).
3. Report exact fix, not generic "brak dostępu".
