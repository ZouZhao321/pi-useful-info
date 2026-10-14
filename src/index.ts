/**
 * Useful Info Footer Extension - 显示实用信息在状态栏
 *
 * 显示内容：
 * - 工作目录
 * - Git 分支
 * - 上传/下载流量统计
 * - Token 用量 (R)
 * - 费用
 * - 上下文使用率
 * - 当前模型
 * - 思考级别
 */

import type { AssistantMessage } from '@earendil-works/pi-ai';
import type { ExtensionAPI, ExtensionContext } from '@earendil-works/pi-coding-agent';
import { truncateToWidth, visibleWidth } from '@earendil-works/pi-tui';
import { basename } from 'node:path';

export default function (pi: ExtensionAPI) {
  let enabled = false;

  // 会话级统计
  let sessionStats = {
    inputTokens: 0,
    outputTokens: 0,
    cost: 0,
  };

  // 更新统计
  function updateStats(ctx: ExtensionContext): void {
    let input = 0;
    let output = 0;
    let cost = 0;

    for (const e of ctx.sessionManager.getBranch()) {
      if (e.type === 'message' && e.message.role === 'assistant') {
        const m = e.message as AssistantMessage;
        input += m.usage.input;
        output += m.usage.output;
        cost += m.usage.cost.total;
      }
    }

    sessionStats = { inputTokens: input, outputTokens: output, cost };
  }

  // 格式化数字
  function fmt(n: number): string {
    if (n < 1000) return `${n}`;
    if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
    return `${(n / 1_000_000).toFixed(1)}M`;
  }

  // 格式化费用
  function fmtCost(n: number): string {
    return `$${n.toFixed(3)}`;
  }

  // 获取上下文使用信息
  function getContextInfo(
    ctx: ExtensionContext,
  ): { used: string; max: string; percent: number } | null {
    const usage = ctx.getContextUsage();
    if (!usage || usage.tokens == null) return null;

    const maxTokens = ctx.model?.contextWindow ?? 1_000_000;
    const percent = (usage.tokens / maxTokens) * 100;

    return {
      used: fmt(usage.tokens),
      max: fmt(maxTokens),
      percent: Math.round(percent * 10) / 10,
    };
  }

  // 构建状态栏各部分
  function buildStatusParts(ctx: ExtensionContext, footerData: { getGitBranch(): string | null }) {
    const theme = ctx.ui.theme;
    const dirName = basename(ctx.cwd);
    const branch = footerData.getGitBranch();
    const branchStr = branch ? ` (${branch})` : '';
    const upStr = `↑${fmt(sessionStats.inputTokens)}`;
    const downStr = `↓${fmt(sessionStats.outputTokens)}`;
    const totalTokens = sessionStats.inputTokens + sessionStats.outputTokens;
    const rStr = `R${fmt(totalTokens)}`;
    const costStr = fmtCost(sessionStats.cost);
    const ctxInfo = getContextInfo(ctx);
    const ctxStr = ctxInfo ? `${ctxInfo.percent}%/${ctxInfo.max}` : 'N/A';
    const modelStr = ctx.model?.id ?? 'no-model';
    const thinkingLevel = ctx.thinkingLevel ?? 'off';
    const thinkingStr = `• ${thinkingLevel}`;
    const ctxColor = ctxInfo && ctxInfo.percent > 80 ? 'error' : 'dim';
    const thinkColor = thinkingLevel === 'off' ? 'dim' : 'accent';

    return {
      full: [
        theme.fg('accent', dirName),
        theme.fg('dim', branchStr),
        theme.fg('dim', ` ${upStr} ${downStr}`),
        theme.fg('dim', ` ${rStr}`),
        theme.fg('warning', ` ${costStr}`),
        theme.fg(ctxColor, ` ${ctxStr}`),
        theme.fg('dim', ` ${modelStr}`),
        theme.fg(thinkColor, ` ${thinkingStr}`),
      ],
      short: [
        theme.fg('accent', dirName),
        theme.fg('dim', branchStr),
        theme.fg('dim', ` ↑${fmt(sessionStats.inputTokens)} ↓${fmt(sessionStats.outputTokens)}`),
        theme.fg('warning', ` ${costStr}`),
        theme.fg('dim', ` ${ctxStr}`),
        theme.fg('dim', ` ${modelStr}`),
        theme.fg(thinkColor, ` ${thinkingStr}`),
      ],
    };
  }

  pi.registerCommand('useful-info', {
    description: 'Toggle useful info footer',
    handler: async (_args, ctx) => {
      enabled = !enabled;

      if (enabled) {
        ctx.ui.setFooter((tui, _theme, footerData) => {
          const unsub = footerData.onBranchChange(() => tui.requestRender());

          return {
            dispose: unsub,
            invalidate() {},
            render(width: number): string[] {
              updateStats(ctx);
              const parts = buildStatusParts(ctx, footerData);
              const content = parts.full.join('');
              const contentWidth = visibleWidth(content);

              if (contentWidth <= width) {
                return [truncateToWidth(content, width)];
              }
              return [truncateToWidth(parts.short.join(''), width)];
            },
          };
        });
        ctx.ui.notify('Useful info footer enabled', 'info');
      } else {
        ctx.ui.setFooter(undefined);
        ctx.ui.notify('Default footer restored', 'info');
      }
    },
  });

  // 状态查询命令
  pi.registerCommand('useful-info:status', {
    description: '显示当前状态栏信息',
    handler: async (_args, ctx) => {
      updateStats(ctx);
      const cwd = process.cwd();
      const sessionName = ctx.sessionManager.getSessionId().slice(0, 8);
      const modelName = ctx.model?.id ?? 'no-model';
      const ctxInfo = getContextInfo(ctx);
      const thinkingLevel = ctx.thinkingLevel ?? 'off';

      const statusInfo = [
        `模型: ${modelName}`,
        `目录: ${basename(cwd)}`,
        `会话: ${sessionName}`,
        `输入: ${fmt(sessionStats.inputTokens)}`,
        `输出: ${fmt(sessionStats.outputTokens)}`,
        `成本: ${fmtCost(sessionStats.cost)}`,
        ctxInfo ? `上下文: ${ctxInfo.percent}%/${ctxInfo.max}` : null,
        `思考: ${thinkingLevel}`,
      ]
        .filter(Boolean)
        .join(' | ');

      ctx.ui.notify(statusInfo, 'info');
    },
  });

  // 工具执行时更新状态
  pi.on('tool_execution_start', (event, ctx) => {
    if (!enabled) return;
    const theme = ctx.ui.theme;
    ctx.ui.setStatus(
      'useful-info',
      theme.fg('accent', '●') + theme.fg('dim', ` ${event.toolName}...`),
    );
  });

  pi.on('tool_execution_end', (_event, ctx) => {
    if (!enabled) return;
    ctx.ui.setStatus(
      'useful-info',
      ctx.ui.theme.fg('success', '●') + ctx.ui.theme.fg('dim', ' ready'),
    );
  });

  // Agent 开始/结束时更新
  pi.on('agent_start', (_event, ctx) => {
    if (!enabled) return;
    const theme = ctx.ui.theme;
    ctx.ui.setStatus('useful-info', theme.fg('accent', '●') + theme.fg('dim', ' thinking...'));
  });

  pi.on('agent_settled', (_event, ctx) => {
    if (!enabled) return;
    ctx.ui.setStatus(
      'useful-info',
      ctx.ui.theme.fg('success', '●') + ctx.ui.theme.fg('dim', ' ready'),
    );
  });
}
