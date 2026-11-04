import { spawnSync } from "node:child_process"

const OWNER = "wangyuchen5110"
const NAME = "kimi-skills-doctor"

function git(args) {
  const res = spawnSync("git", args, { encoding: "utf8", stdio: "pipe" })
  if (res.status !== 0) {
    console.error(`git ${args.join(" ")} failed: ${(res.stderr || res.stdout || "").trim().slice(0, 400)}`)
    process.exit(1)
  }
  return String(res.stdout || "").trim()
}

const inside = spawnSync("git", ["rev-parse", "--git-dir"], { encoding: "utf8" }).status === 0
if (!inside) {
  git(["init", "-b", "main"])
  console.log("git init")
}
git(["config", "user.name", OWNER])
git(["config", "user.email", `${OWNER}@users.noreply.github.com`])
git(["add", "-A"])
if (git(["status", "--porcelain"])) {
  git(["commit", "-m", "feat: Kimi Code plugin (skill + slash commands + MCP) v0.1.0"])
  console.log("committed")
}
const remotes = git(["remote"]).split(/\r?\n/).filter(Boolean)
if (!remotes.includes("origin")) {
  git(["remote", "add", "origin", `https://github.com/${OWNER}/${NAME}.git`])
  console.log("remote added")
}
const push = spawnSync("git", ["push", "-u", "origin", "main"], { encoding: "utf8", stdio: "inherit" })
process.exit(push.status ?? 1)
