---
name: skills-doctor
description: Audit the skills Kimi Code loads — per-step token cost, shadowed duplicates and broken references.
type: prompt
whenToUse: When the user asks why a skill is missing, duplicated or expensive, when the context window is under pressure, or before/after installing skills.
---

# Skills Doctor

Kimi Code injects every available skill's name, description and location into the
prompt on every step. Audit that cost before adding more skills.

## When to use

- The user asks why a skill is missing, duplicated, or not the one they expect.
- The skill catalog feels large, or the context window is under pressure.
- A `SKILL.md` references files that may have moved.
- Before/after installing skills from a plugin or a Git repo.

## Run it

Prefer the `skills_doctor` MCP tool (installed by this plugin). It accepts
`directory`, `budget`, `lang` and `html`. If the tool is unavailable, fall back to
the CLI:

```bash
npx -y opencode-skills-doctor@0.9.4 check    # findings + per-step token cost
npx -y opencode-skills-doctor@0.9.4 plan     # exact trim/hide savings
npx -y opencode-skills-doctor@0.9.4 scan     # every skill: source, precedence, cost
```

`check` is read-only. Add `--json` for structured output, `--html report.html`
for a shareable report, `--budget <n>` to change the 1200-token/step target.

## Reading the result

- **token-budget** — descriptions cost more than the budget every step. Run
  `plan`; prefer trimming descriptions (keeps discoverability) over hiding.
- **shadowed / near-duplicate** — the same name loads from several roots and only
  the highest-precedence one wins. `fix --dry-run` then `fix` archives the losers
  into `.skills-doctor-archive/` (reversible).
- **broken-reference** — a `references/`, `scripts/` or `assets/` path does not
  resolve next to the `SKILL.md`. Fix the path; the file may live one level up.
- **large-body** — paid only when the skill is invoked; move detail into
  `references/`.

## Fixing

```bash
npx -y opencode-skills-doctor@0.9.4 fix --dry-run       # what would be archived/hidden
npx -y opencode-skills-doctor@0.9.4 fix                 # archive shadowed duplicates (reversible)
npx -y opencode-skills-doctor@0.9.4 fix --hide old-skill # autoinvoke: false, still loadable via @id
```

Do not edit `~/.kimi-code/mcp.json` by hand from here; the plugin owns the
`skills-doctor` MCP entry.
