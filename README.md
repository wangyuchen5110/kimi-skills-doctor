# kimi-skills-doctor

Audit the skills **Kimi Code** loads: the per-step token tax, shadowed
duplicates, broken references and budget overruns — then get a measured plan to
fix them.

Kimi Code advertises every available skill (name, description, location) to the
model on **every step**. This plugin measures that cost, tells you which
definition actually wins, and can trim or hide the expensive ones.

A **Kimi Code plugin** that packages everything in one install:

- the `skills-doctor` **skill** (a workflow for auditing and fixing skills),
- three **slash commands** — `/kimi-skills-doctor:check`, `:plan`, `:fix`,
- the **`skills_doctor` MCP tool**, declared in the plugin manifest so you never
  hand-edit `~/.kimi-code/mcp.json`.

It runs on the Kimi Code **CLI** and the **desktop app** (both share
`~/.kimi-code/`). Powered by [`opencode-skills-doctor`](https://github.com/wangyuchen5110/opencodeplugginprogram).

## Install

From GitHub, inside a Kimi Code session:

```text
/plugins install https://github.com/wangyuchen5110/kimi-skills-doctor
/reload
```

Then use:

```text
/kimi-skills-doctor:check
/kimi-skills-doctor:plan
/kimi-skills-doctor:fix
```

or load the skill explicitly:

```text
/skill:kimi-skills-doctor:skills-doctor
```

The plugin is installed under `$KIMI_CODE_HOME/plugins/managed/kimi-skills-doctor/`
(default `~/.kimi-code/…`) and works in both the CLI and the desktop app.

> Kimi Code plugins cannot run command-style JS tools, so the actual audit is
> provided through the MCP server + the skill + slash commands.

## What you get

| Entry | What it does |
|---|---|
| `/kimi-skills-doctor:check` | audit roots, token budget, shadowing, broken references |
| `/kimi-skills-doctor:plan` | exact trim/hide savings over N steps |
| `/kimi-skills-doctor:fix` | archive shadowed duplicates or hide low-frequency skills (reversible) |
| `skills_doctor` MCP tool | same audit as a tool call, accepts `directory`, `budget`, `lang`, `html` |

The audit covers the Kimi Code skill roots:

1. `$KIMI_CODE_HOME/skills/` (default `~/.kimi-code/skills/`)
2. `~/.agents/skills/`
3. project `.kimi-code/skills/` and `.agents/skills/`
4. `extra_skill_dirs` from `config.toml`

## Privacy: local-only

- Runs on your machine; no telemetry, no account, nothing is uploaded.
- Reads only skill files and Kimi Code config; never chats, sessions, credentials
  or API keys.
- Writes only when you run `fix`; reports contain paths and descriptions, not
  file bodies.
- The only optional network call is the core CLI's daily npm version check,
  disableable with `SKILLS_DOCTOR_UPDATE_CHECK=0` / `--no-update-check`.

## Development

```powershell
npm test        # validates the plugin manifest, skill and commands
```

Nothing is executed at install time: the plugin only contributes text (skill,
commands) and an MCP server declaration. Requires Node ≥ 20 for `npx`.

MIT · [中文说明](README.zh-CN.md) · [Changelog](CHANGELOG.md)
