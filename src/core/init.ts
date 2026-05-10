import path from 'path';
import os from 'os';
import chalk from 'chalk';
import * as fs from 'fs';
import { createRequire } from 'module';
import { FileSystemUtils } from '../utils/file-system.js';
import { AI_TOOLS, AIToolOption, LEARN_GLOBAL_DIR } from './config.js';
import { isInteractive } from '../utils/interactive.js';
import {
  generateCommands,
  CommandAdapterRegistry,
} from './command-generation/index.js';
import {
  getSkillTemplates,
  getCommandContents,
  generateSkillContent,
} from './shared/index.js';

const require = createRequire(import.meta.url);
const { version: DEEPLEARN_VERSION } = require('../../package.json');

type InitCommandOptions = {
  tools?: string;
  force?: boolean;
};

export class InitCommand {
  private readonly toolsArg?: string;
  private readonly force: boolean;

  constructor(options: InitCommandOptions = {}) {
    this.toolsArg = options.tools;
    this.force = options.force ?? false;
  }

  async execute(targetPath: string = '.'): Promise<void> {
    const resolvedPath = path.resolve(targetPath);

    // Ensure target directory exists
    await FileSystemUtils.ensureDir(resolvedPath);

    // Create global ~/.learn/ directory
    const learnDir = path.join(os.homedir(), LEARN_GLOBAL_DIR);
    await FileSystemUtils.ensureDir(path.join(learnDir, 'topics'));

    console.log(chalk.bold('\n🧠 DeepLearn — AI 驱动的递归学习系统\n'));

    // Detect available tools
    const availableTools = await this.detectTools(resolvedPath);

    // Select tools
    let selectedTools: AIToolOption[];
    if (this.toolsArg === 'all') {
      selectedTools = availableTools.filter((t) => t.available);
    } else if (this.toolsArg === 'none') {
      selectedTools = [];
    } else if (this.toolsArg) {
      const toolIds = this.toolsArg.split(',').map((t) => t.trim());
      selectedTools = availableTools.filter((t) => toolIds.includes(t.value));
    } else if (isInteractive()) {
      selectedTools = await this.interactiveSelect(availableTools);
    } else {
      // Non-interactive, auto-detect
      selectedTools = availableTools.filter(
        (t) => t.available && this.hasToolDir(resolvedPath, t)
      );
    }

    if (selectedTools.length === 0) {
      console.log(
        chalk.yellow('未选择任何 AI 工具。使用 --tools 参数指定，或在交互模式中选择。')
      );
      console.log(
        chalk.dim(`可用的工具：${availableTools.filter((t) => t.available).map((t) => t.value).join(', ')}`)
      );
      return;
    }

    // Generate skill files for each tool
    for (const tool of selectedTools) {
      if (!tool.skillsDir) continue;
      await this.generateSkillsForTool(resolvedPath, tool);
      await this.generateCommandsForTool(resolvedPath, tool);
      console.log(
        chalk.green(`  ✓ ${tool.name}`) +
          chalk.dim(` — 5 个技能文件已生成`)
      );
    }

    console.log('');
    console.log(chalk.bold('🎉 DeepLearn 初始化完成！\n'));
    console.log(chalk.dim('  全局学习数据存储在 ') + chalk.cyan(`~/${LEARN_GLOBAL_DIR}/`));
    console.log(chalk.dim('  运行 ') + chalk.cyan('/learn javascript') + chalk.dim(' 开始你的第一个学习主题\n'));

    console.log(chalk.bold('可用的学习命令：'));
    console.log(chalk.cyan('  /learn <主题名>') + chalk.dim('          — 初始化或加载学习主题'));
    console.log(chalk.cyan('  /learn-explain <概念>') + chalk.dim('     — 递归式深度学习一个概念'));
    console.log(chalk.cyan('  /learn-practice <概念>') + chalk.dim('    — TDD 练习巩固'));
    console.log(chalk.cyan('  /learn-review') + chalk.dim('              — 回顾进度，获取推荐'));
    console.log(chalk.cyan('  /learn-status') + chalk.dim('              — 可视化知识图谱热力图'));
    console.log('');
  }

  private async detectTools(resolvedPath: string): Promise<AIToolOption[]> {
    return AI_TOOLS;
  }

  private hasToolDir(resolvedPath: string, tool: AIToolOption): boolean {
    if (!tool.skillsDir) return false;
    const dirPath = path.join(resolvedPath, tool.skillsDir);
    try {
      return fs.statSync(dirPath).isDirectory();
    } catch {
      return false;
    }
  }

  private async interactiveSelect(tools: AIToolOption[]): Promise<AIToolOption[]> {
    const availableTools = tools.filter((t) => t.available && t.skillsDir);
    const { search, checkbox } = await import('@inquirer/prompts');

    // Auto-detect existing tool dirs and pre-select them
    const detected = availableTools.filter((t) =>
      this.hasToolDir(process.cwd(), t)
    );
    const detectedValues = new Set(detected.map((t) => t.value));

    const choices = availableTools.map((t) => ({
      name: t.name,
      value: t.value,
      checked: detectedValues.has(t.value),
    }));

    const selected = await checkbox({
      message: '选择要生成技能的 AI 工具（空格选择，回车确认）：',
      choices,
      pageSize: 15,
    });

    return availableTools.filter((t) => selected.includes(t.value));
  }

  private async generateSkillsForTool(
    resolvedPath: string,
    tool: AIToolOption
  ): Promise<void> {
    const skillTemplates = getSkillTemplates();

    for (const entry of skillTemplates) {
      const skillDir = path.join(
        resolvedPath,
        tool.skillsDir!,
        'skills',
        entry.dirName
      );
      const skillFile = path.join(skillDir, 'SKILL.md');
      const content = generateSkillContent(entry.template, DEEPLEARN_VERSION);
      await FileSystemUtils.writeFile(skillFile, content);
    }
  }

  private async generateCommandsForTool(
    resolvedPath: string,
    tool: AIToolOption
  ): Promise<void> {
    const adapter = CommandAdapterRegistry.get(tool.value);
    if (!adapter) return;

    const commandContents = getCommandContents();
    const generatedCommands = generateCommands(commandContents, adapter);

    for (const cmd of generatedCommands) {
      const filePath = path.resolve(resolvedPath, cmd.path);
      await FileSystemUtils.writeFile(filePath, cmd.fileContent);
    }
  }
}
