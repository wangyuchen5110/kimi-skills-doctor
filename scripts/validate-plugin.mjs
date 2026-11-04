#!/usr/bin/env node
// Offline validation for the Kimi Code plugin package.
// Checks the manifest, bundled skills and commands without loading Kimi Code.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("..", import.meta.url))
const problems = []
const notes = []

const NAME_RE = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*(@[A-Za-z0-9_-]+)?$/
const SEMVER_RE = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"))
  } catch (err) {
    problems.push(`${file}: cannot read/parse — ${String(err?.message ?? err)}`)
    return null
  }
}

function insideRoot(rel) {
  const abs = path.resolve(root, rel)
  const base = path.resolve(root)
  return abs === base || abs.startsWith(base + path.sep)
}

function frontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!match) return null
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const m = /^([A-Za-z][\w-]*)\s*:\s*(.*)$/.exec(line.trim())
    if (m) data[m[1]] = m[2].trim()
  }
  return { data, body: text.slice(match[0].length) }
}

const manifest = readJson("kimi.plugin.json")

if (manifest) {
  if (typeof manifest.name !== "string" || !NAME_RE.test(manifest.name)) {
    problems.push(`kimi.plugin.json: name must match ${NAME_RE}`)
  }
  if (typeof manifest.version !== "string" || !SEMVER_RE.test(manifest.version)) {
    problems.push("kimi.plugin.json: version must be semver, e.g. 0.1.0")
  }
  if (typeof manifest.description !== "string" || !manifest.description.trim()) {
    problems.push("kimi.plugin.json: description is required")
  }
  if (manifest.interface && typeof manifest.interface !== "object") {
    problems.push("kimi.plugin.json: interface must be an object")
  }

  const skills = manifest.skills === undefined ? ["./SKILL.md"] : [manifest.skills].flat()
  for (const entry of skills) {
    if (typeof entry !== "string" || !entry.startsWith("./")) {
      problems.push(`kimi.plugin.json: skills entry must start with ./ (${entry})`)
      continue
    }
    if (!insideRoot(entry)) problems.push(`kimi.plugin.json: skills path escapes the plugin root (${entry})`)
    const abs = path.resolve(root, entry)
    if (!fs.existsSync(abs)) {
      problems.push(`kimi.plugin.json: skills path does not exist (${entry})`)
      continue
    }
    // Directory roots contribute <name>/SKILL.md; a file root must be SKILL.md.
    const stat = fs.statSync(abs)
    const skillFiles = stat.isDirectory()
      ? fs.readdirSync(abs, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => path.join(abs, d.name, "SKILL.md"))
      : [abs]
    if (!skillFiles.length) problems.push(`kimi.plugin.json: no skills found under ${entry}`)
    for (const file of skillFiles) {
      if (!fs.existsSync(file)) {
        problems.push(`skill ${path.relative(root, file)}: missing SKILL.md`)
        continue
      }
      const parsed = frontmatter(fs.readFileSync(file, "utf8"))
      if (!parsed) problems.push(`skill ${path.relative(root, file)}: missing YAML frontmatter`)
      else {
        if (!parsed.data.name) problems.push(`skill ${path.relative(root, file)}: frontmatter needs name`)
        if (!parsed.data.description) problems.push(`skill ${path.relative(root, file)}: frontmatter needs description`)
        if (!parsed.body.trim()) problems.push(`skill ${path.relative(root, file)}: empty body`)
      }
    }
  }

  const commands = manifest.commands === undefined ? [] : [manifest.commands].flat()
  for (const entry of commands) {
    if (typeof entry !== "string" || !entry.startsWith("./")) {
      problems.push(`kimi.plugin.json: commands entry must start with ./ (${entry})`)
      continue
    }
    const abs = path.resolve(root, entry)
    if (!insideRoot(entry)) problems.push(`kimi.plugin.json: commands path escapes the plugin root (${entry})`)
    else if (!fs.existsSync(abs)) problems.push(`kimi.plugin.json: commands path does not exist (${entry})`)
    else {
      const files = fs.statSync(abs).isDirectory() ? fs.readdirSync(abs).filter((f) => f.endsWith(".md")).map((f) => path.join(abs, f)) : [abs]
      for (const file of files) {
        const text = fs.readFileSync(file, "utf8")
        if (!text.trim()) problems.push(`command ${path.relative(root, file)}: empty file`)
        if (!frontmatter(text)?.data.description) {
          notes.push(`command ${path.relative(root, file)}: no description (falls back to first line)`)
        }
      }
    }
  }

  const servers = manifest.mcpServers
  if (servers !== undefined) {
    if (!servers || typeof servers !== "object") problems.push("kimi.plugin.json: mcpServers must be an object")
    else {
      for (const [name, server] of Object.entries(servers)) {
        if (!server || typeof server !== "object") {
          problems.push(`mcpServers.${name}: must be an object`)
          continue
        }
        if (server.url) continue
        if (typeof server.command !== "string" || !server.command.trim()) {
          problems.push(`mcpServers.${name}: needs command (stdio) or url (http)`)
          continue
        }
        if (server.args !== undefined && (!Array.isArray(server.args) || server.args.some((a) => typeof a !== "string"))) {
          problems.push(`mcpServers.${name}: args must be an array of strings`)
        }
        const packageArg = (server.args ?? []).find((a) => typeof a === "string" && a.includes("opencode-skills-doctor"))
        if (packageArg && !/@\d+\.\d+\.\d+/.test(packageArg)) {
          problems.push(`mcpServers.${name}: pin the core version (got ${packageArg})`)
        }
      }
    }
  }
}

for (const file of ["README.md", "CHANGELOG.md", "LICENSE"]) {
  if (!fs.existsSync(path.join(root, file))) problems.push(`${file} is missing`)
}

if (problems.length) {
  console.error(`plugin validation failed (${problems.length} problem${problems.length === 1 ? "" : "s"})`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

for (const note of notes) console.log(`note: ${note}`)
console.log(
  `plugin ok: ${manifest.name}@${manifest.version} (${(manifest.skills ? [manifest.skills].flat() : []).length} skills root, ` +
    `${(manifest.commands ? [manifest.commands].flat() : []).length} commands root, ` +
    `${Object.keys(manifest.mcpServers ?? {}).length} MCP server)`,
)
