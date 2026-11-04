---
description: Audit Kimi Code skills and report the per-step token cost
---

Use the `skills_doctor` MCP tool (server `skills-doctor`) to audit the Kimi Code
skill roots. If the tool is unavailable, run `npx -y opencode-skills-doctor@0.9.4 check`
in the terminal instead.

Then summarize for the user:

- total skills and advertised skills, description tokens per step vs the 1200 budget;
- the top findings, each with one concrete fix (trim description / hide / archive / fix path);
- whether running `/kimi-skills-doctor:plan` would help.

Extra arguments from the user: $ARGUMENTS
