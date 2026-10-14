# Pi Useful Info Extension

[English](./README.md)

显示实用信息的状态栏扩展，在终端底部显示当前工作状态。

## 功能

- 📁 工作目录名称
- 🌿 Git 分支
- ⬆️⬇️ 上传/下载 Token 统计
- 💰 费用统计
- 📊 上下文使用率
- 🤖 当前模型
- 💭 思考级别

## 安装

```bash
cd ~/.pi/agent/extensions/useful-info
npm install
```

## 使用

### 启用状态栏

```
/useful-info
```

### 查看状态信息

```
/useful-info:status
```

## 状态栏示例

```
bili-scribe (main) ↑434 ↓91 R525 $0.000 2.1%/1.0M mimo-v2.5 • low
```

## 开发

### 代码质量工具

```bash
# ESLint 检查
npm run lint

# ESLint 自动修复
npm run lint:fix

# Prettier 格式化
npm run format

# 检查格式
npm run format:check

# TypeScript 类型检查
npm run typecheck
```

## 配置

### ESLint

配置文件：`eslint.config.js`

### Prettier

配置文件：`.prettierrc`
