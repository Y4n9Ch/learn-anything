import { Command } from 'commander';
import { createRequire } from 'module';
import path from 'path';
import { promises as fs } from 'fs';
import chalk from 'chalk';
import { AI_TOOLS } from '../core/config.js';

const program = new Command();
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

program
  .name('deeplearn')
  .description('AI-powered recursive learning system with Socratic method and TDD practice')
  .version(version);

const availableToolIds = AI_TOOLS.filter((tool) => tool.skillsDir).map(
  (tool) => tool.value
);
const toolsOptionDescription = `指定 AI 工具（非交互模式）。使用 "all"、"none"，或逗号分隔的工具列表：${availableToolIds.join(', ')}`;

program
  .command('init [path]')
  .description('在当前项目初始化 DeepLearn 学习技能')
  .option('--tools <tools>', toolsOptionDescription)
  .option('--force', '跳过确认提示')
  .action(async (targetPath = '.', options?: { tools?: string; force?: boolean }) => {
    try {
      const resolvedPath = path.resolve(targetPath);

      try {
        const stats = await fs.stat(resolvedPath);
        if (!stats.isDirectory()) {
          throw new Error(`路径 "${targetPath}" 不是一个目录`);
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log(chalk.yellow(`目录 "${targetPath}" 不存在，将自动创建。`));
        } else if (error.message && error.message.includes('not a directory')) {
          throw error;
        } else {
          throw new Error(`无法访问路径 "${targetPath}": ${error.message}`);
        }
      }

      const { InitCommand } = await import('../core/init.js');
      const initCommand = new InitCommand({
        tools: options?.tools,
        force: options?.force,
      });
      await initCommand.execute(targetPath);
    } catch (error) {
      console.log();
      console.error(chalk.red(`错误: ${(error as Error).message}`));
      process.exit(1);
    }
  });

program
  .command('update [path]')
  .description('更新 DeepLearn 技能文件到最新版本')
  .option('--force', '强制更新即使已是最新版本')
  .action(async (targetPath = '.', options?: { force?: boolean }) => {
    try {
      const { InitCommand } = await import('../core/init.js');
      const initCommand = new InitCommand({
        tools: 'all',
        force: options?.force ?? true,
      });
      await initCommand.execute(targetPath);
      console.log(chalk.green('DeepLearn 技能文件已更新。'));
    } catch (error) {
      console.log();
      console.error(chalk.red(`错误: ${(error as Error).message}`));
      process.exit(1);
    }
  });

program.parse();
