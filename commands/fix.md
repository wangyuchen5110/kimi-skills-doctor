---
description: Archive shadowed Kimi Code skills or hide low-frequency ones (reversible)
---

Walk the user through a safe repair:

1. Run `npx -y opencode-skills-doctor@0.9.4 fix --dry-run` and show exactly which
   paths would move into `.skills-doctor-archive/`, or which skills would get
   `metadata.opencode/autoinvoke: false`.
2. Ask the user to confirm before touching any file.
3. Only after confirmation, run `fix` (archive shadowed duplicates) and/or
   `fix --hide <id>` (hide a low-frequency skill; it stays loadable by explicit
   reference).
4. Re-run `check` and report the new tokens/step.

Never edit a skill file directly and never delete archived files.

Extra arguments from the user: $ARGUMENTS
