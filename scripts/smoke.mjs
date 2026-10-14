/**
 * 冒烟检查：静态断言扩展入口、pi 清单、LICENSE 与 package.json。
 *
 * 覆盖范围有限，只做四件事：
 * 1. package.json 能被 JSON.parse 解析
 * 2. package.json 声明了非空的 pi.extensions
 * 3. pi.extensions 中每个入口文件都存在于仓库中
 * 4. LICENSE 首行是 MIT License
 *
 * 局限：不加载 pi 运行时，因此不覆盖扩展的默认导出、命令注册、状态栏渲染与
 * 事件监听行为；这些需要 pi 宿主环境才能验证。
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// package.json 必须是合法 JSON
const pkgPath = join(root, 'package.json');
assert.ok(existsSync(pkgPath), 'package.json 不存在');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

// pi.extensions 必须是非空字符串数组，且指向真实存在的入口文件
const extensions = pkg.pi?.extensions;
assert.ok(Array.isArray(extensions) && extensions.length > 0, 'pi.extensions 必须是非空数组');

for (const entry of extensions) {
  assert.equal(typeof entry, 'string', `pi.extensions 条目必须是字符串：${String(entry)}`);
  const entryPath = resolve(root, entry);
  assert.ok(existsSync(entryPath), `pi.extensions 指向的入口文件不存在：${entry}`);
}

// LICENSE 首行必须是 MIT License
const licensePath = join(root, 'LICENSE');
assert.ok(existsSync(licensePath), 'LICENSE 不存在');
const licenseFirstLine = readFileSync(licensePath, 'utf8').split('\n')[0].trim();
assert.equal(
  licenseFirstLine,
  'MIT License',
  `LICENSE 首行不是 "MIT License"：${licenseFirstLine}`,
);

console.log(`smoke: ok — entry ${extensions.join(', ')}, license ${licenseFirstLine}`);
