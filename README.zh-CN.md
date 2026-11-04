# kimi-skills-doctor

审计 **Kimi Code** 实际加载的 skills：每步 token 开销、被遮蔽的重复定义、断链引用、预算超标 —— 并给出可量化的修复方案。

Kimi Code 会把每个可用 skill 的 name / description / location 注入到每一步的提示词里。这个插件测量这笔开销、指出同一名字到底哪个定义生效，并能裁剪或隐藏昂贵的那些。

它是一个 **Kimi Code 插件**，一次安装打包：

- `skills-doctor` **skill**（审计与修复的工作流）
- 三个**斜杠命令**：`/kimi-skills-doctor:check`、`:plan`、`:fix`
- **`skills_doctor` MCP 工具**（在插件 manifest 里声明，不用手改 `~/.kimi-code/mcp.json`）

CLI 和桌面端都可用（两端共享 `~/.kimi-code/`）。底层是 [`opencode-skills-doctor`](https://github.com/wangyuchen5110/opencodeplugginprogram)。

## 安装

在 Kimi Code 会话里：

```text
/plugins install https://github.com/wangyuchen5110/kimi-skills-doctor
/reload
```

然后：

```text
/kimi-skills-doctor:check
/kimi-skills-doctor:plan
/kimi-skills-doctor:fix
```

或显式加载 skill：

```text
/skill:kimi-skills-doctor:skills-doctor
```

插件会被复制到 `$KIMI_CODE_HOME/plugins/managed/kimi-skills-doctor/`（默认 `~/.kimi-code/...`），CLI 与桌面端共用。

> Kimi Code 插件不支持命令型 JS tools，所以真正的审计能力通过 **MCP server + skill + 斜杠命令** 提供。

## 提供什么

| 入口 | 作用 |
|---|---|
| `/kimi-skills-doctor:check` | 审计来源、token 预算、遮蔽、断链 |
| `/kimi-skills-doctor:plan` | 精确的裁剪/隐藏节省（按 N 步折算） |
| `/kimi-skills-doctor:fix` | 归档被遮蔽定义或隐藏低频 skill（可逆） |
| `skills_doctor` MCP 工具 | 同样的审计，参数 `directory`、`budget`、`lang`、`html` |

审计覆盖 Kimi Code 的 skill 根目录：

1. `$KIMI_CODE_HOME/skills/`（默认 `~/.kimi-code/skills/`）
2. `~/.agents/skills/`
3. 项目 `.kimi-code/skills/` 与 `.agents/skills/`
4. `config.toml` 里的 `extra_skill_dirs`

## 隐私：纯本地

- 在本机运行；无遥测、无账号、不上传。
- 只读 skill 文件与 Kimi Code 配置；不读对话、会话、凭据或 API key。
- 只有你主动跑 `fix` 才写文件；报告含路径和描述，不含文件正文。
- 唯一可选联网是核心 CLI 每天一次的 npm 版本检查，可用 `SKILLS_DOCTOR_UPDATE_CHECK=0` / `--no-update-check` 关闭。

## 开发

```powershell
npm test        # 校验插件 manifest、skill 与命令文件
```

安装时不执行任何代码：插件只贡献文本（skill、命令）和一条 MCP server 声明。需要 Node ≥ 20 供 `npx` 使用。

MIT · [English](README.md) · [变更记录](CHANGELOG.md)
