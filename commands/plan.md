---
description: Show the exact trim/hide savings for Kimi Code skills
---

Run the skills-doctor plan: call the `skills_doctor` MCP tool for the audit, then
run `npx -y opencode-skills-doctor@0.9.4 plan` (or `plan --json`) in the terminal
for the exact numbers.

Report:

- current tokens/step and the gap to the budget;
- which descriptions to trim (and to roughly what length);
- which skills to hide (lowest-frequency first) if trimming is not enough;
- projected savings over 100 steps.

Do not modify any skill file in this step. Extra arguments from the user: $ARGUMENTS
