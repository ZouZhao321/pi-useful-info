# Pi Useful Info Extension

[中文](./README.zh.md)

A status bar extension that replaces the footer with useful information about the current session.

## Install

Install this extension straight from the repository:

```bash
pi install git:github.com/ZouZhao321/pi-useful-info
```

For local development, install the checkout by path:

```bash
pi install ./useful-info
```

`index.ts` is loaded by pi directly, so the extension needs no build step.

## What it does

The extension registers a custom footer that renders live session information at the bottom of the terminal.

- 📁 Working directory name
- 🌿 Git branch
- ⬆️⬇️ Input/output token statistics
- 💰 Cost tracking
- 📊 Context usage percentage
- 🤖 Current model
- 💭 Thinking level

### Commands

- `/useful-info` — toggle the custom footer. Enabling it replaces the current footer; disabling it restores the default footer.
- `/useful-info:status` — report model, directory, session id, input tokens, output tokens, cost, context usage and thinking level in a notification.

### Status bar fields

The full layout renders the following segments from left to right. The short layout, used when the full content does not fit the terminal width, is identical except that it drops the `R` total.

| Segment   | Value                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| Directory | `basename(ctx.cwd)`                                                                                                   |
| Branch    | `footerData.getGitBranch()`, omitted when there is no branch                                                          |
| `↑` / `↓` | Input and output tokens summed over the assistant messages of the current session branch                              |
| `R`       | Total tokens, input + output                                                                                          |
| Cost      | `usage.cost.total` summed the same way, formatted with a `$` prefix and three decimals                                |
| Context   | Used percentage and window size, from `ctx.getContextUsage()` and `ctx.model.contextWindow` (falls back to 1,000,000) |
| Model     | `ctx.model.id`, or `no-model` when no model is selected                                                               |
| Thinking  | `ctx.thinkingLevel`, or `off` when unset                                                                              |

Token counts below 1,000 are printed as-is, below 1,000,000 as `k` with one decimal, and above that as `M`. The context segment switches to the error color above 80% usage and shows `N/A` when context usage is unavailable.

The extension also keeps a small status indicator in sync while the footer is enabled: it shows `● <tool name>...` on `tool_execution_start`, `● thinking...` on `agent_start`, and `● ready` on `tool_execution_end` and `agent_settled`.

### Status Bar Example

```
bili-scribe (main) ↑434 ↓91 R525 $0.000 2.1%/1.0M mimo-v2.5 • low
```

## Configuration

The extension reads no configuration file and no environment variables. Everything is controlled at runtime:

- Run `/useful-info` to enable or disable the footer. The state is per session and starts out disabled.
- The footer picks the full or the short layout automatically from the terminal width.

## Development

### Code Quality Tools

```bash
# ESLint check
npm run lint

# ESLint auto-fix
npm run lint:fix

# Prettier format
npm run format

# Check formatting
npm run format:check

# TypeScript type check
npm run typecheck

# Smoke test: entry file, pi manifest and LICENSE assertions
npm test
```

### Tool configuration

- ESLint: `eslint.config.js`
- Prettier: `.prettierrc`

## License

MIT — see [LICENSE](./LICENSE).
