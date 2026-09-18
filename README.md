# Pi Useful Info Extension

A status bar extension that displays useful information at the bottom of your terminal.

## Features

- 📁 Working directory name
- 🌿 Git branch
- ⬆️⬇️ Upload/download token statistics
- 💰 Cost tracking
- 📊 Context usage percentage
- 🤖 Current model
- 💭 Thinking level

## Installation

```bash
cd ~/.pi/agent/extensions/useful-info
npm install
```

## Usage

### Enable Status Bar

```
/useful-info
```

### View Status Info

```
/useful-info:status
```

## Status Bar Example

```
bili-scribe (main) ↑434 ↓91 R525 $0.000 2.1%/1.0M mimo-v2.5 • low
```

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
```

## Configuration

### ESLint

Config file: `eslint.config.js`

### Prettier

Config file: `.prettierrc`
