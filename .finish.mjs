import { spawnSync } from "node:child_process"

const OWNER = "wangyuchen5110"
const NAME = "kimi-skills-doctor"
const DESC =
  "Kimi Code plugin: audit the skills Kimi Code loads — per-step token budget, shadowed duplicates and broken references."
const TOPICS = ["kimi", "kimi-code", "skills", "agent-skills", "mcp", "token-budget", "developer-tools", "audit", "plugin"]

function git(args) {
  const res = spawnSync("git", args, { encoding: "utf8", stdio: "pipe" })
  if (res.status !== 0) {
    console.error(`git ${args.join(" ")} failed: ${(res.stderr || res.stdout || "").trim().slice(0, 300)}`)
    process.exit(1)
  }
  return String(res.stdout || "").trim()
}

function token() {
  const res = spawnSync("git", ["credential", "fill"], {
    input: "protocol=https\nhost=github.com\n\n",
    encoding: "utf8",
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "never" },
  })
  const line = String(res.stdout || "").split(/\r?\n/).find((l) => l.startsWith("password="))
  if (!line) throw new Error("no stored git credential")
  return line.slice("password=".length).trim()
}
const tok = token()

async function api(method, path, body) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${tok}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "kimi-skills-doctor-setup",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {}
  return { status: res.status, json, text }
}

// 1) Drop the bootstrap script and push.
git(["add", "-A"])
if (git(["status", "--porcelain"])) {
  git(["commit", "-m", "chore: remove bootstrap script"])
  console.log("cleanup committed")
}
git(["push", "origin", "main"])
console.log("pushed main")

// 2) Repo metadata.
const patch = await api("PATCH", `/repos/${OWNER}/${NAME}`, { description: DESC, homepage: `https://github.com/${OWNER}/${NAME}` })
console.log(`metadata: ${patch.status}`)
const topics = await api("PUT", `/repos/${OWNER}/${NAME}/topics`, { names: TOPICS })
console.log(`topics: ${topics.status}`)

// 3) Tag + GitHub release so `/plugins install <github>` can pin v0.1.0.
if (!git(["tag", "--list", "v0.1.0"])) {
  git(["tag", "-a", "v0.1.0", "-m", "kimi-skills-doctor 0.1.0"])
  git(["push", "origin", "v0.1.0"])
  console.log("tag v0.1.0 pushed")
}
let release = await api("POST", `/repos/${OWNER}/${NAME}/releases`, {
  tag_name: "v0.1.0",
  name: "v0.1.0",
  body: [
    "Initial Kimi Code plugin.",
    "",
    "- `skills-doctor` skill (audit + fix workflow)",
    "- `/kimi-skills-doctor:check`, `:plan`, `:fix` slash commands",
    "- `skills-doctor` MCP server declaration pinned to `opencode-skills-doctor@0.9.4`",
    "",
    "Install: `/plugins install https://github.com/wangyuchen5110/kimi-skills-doctor`",
  ].join("\n"),
})
console.log(`release: ${release.status}${release.json?.tag_name ? ` ${release.json.tag_name}` : ""}`)
if (release.status === 422) {
  const existing = await api("GET", `/repos/${OWNER}/${NAME}/releases/tags/v0.1.0`)
  console.log(`release exists: ${existing.status}`)
}
