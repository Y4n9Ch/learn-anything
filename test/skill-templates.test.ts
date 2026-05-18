import { describe, it, expect } from 'vitest';
import {
  getLearnTopicSkillTemplate,
  getLearnExplainSkillTemplate,
  getLearnPracticeSkillTemplate,
  getLearnReviewSkillTemplate,
  getLearnStatusSkillTemplate,
  getLearnTopicCommandTemplate,
  getLearnExplainCommandTemplate,
  getLearnPracticeCommandTemplate,
  getLearnReviewCommandTemplate,
  getLearnStatusCommandTemplate,
} from '../src/core/templates/skill-templates.js';
import {
  getSkillTemplates,
  getCommandTemplates,
  getCommandContents,
  generateSkillContent,
} from '../src/core/shared/skill-generation.js';
import { CommandAdapterRegistry } from '../src/core/command-generation/registry.js';
import { generateCommand, generateCommands } from '../src/core/command-generation/generator.js';
import type { SupportedLocale } from '../src/i18n/types.js';

const L: SupportedLocale = 'zh-CN';

describe('Skill Templates', () => {
  it('should return 5 skill templates with required fields', () => {
    const templates = getSkillTemplates(L);
    expect(templates).toHaveLength(5);

    for (const entry of templates) {
      expect(entry.template.name).toBeTruthy();
      expect(entry.template.description).toBeTruthy();
      expect(entry.template.instructions).toBeTruthy();
      expect(entry.template.instructions.length).toBeGreaterThan(100);
      expect(entry.dirName).toBeTruthy();
      expect(entry.workflowId).toBeTruthy();
    }
  });

  it('should have unique workflow IDs', () => {
    const templates = getSkillTemplates(L);
    const ids = templates.map((t) => t.workflowId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should generate valid SKILL.md content with YAML frontmatter', () => {
    const template = getLearnExplainSkillTemplate(L);
    const content = generateSkillContent(template, '0.1.0');

    expect(content).toContain('---');
    expect(content).toContain('name: deeplearn-explain');
    expect(content).toContain('generatedBy: "0.1.0"');
    expect(content).toContain('DeepLearn');
  });

  it('should generate English SKILL.md content when en locale is passed', () => {
    const template = getLearnExplainSkillTemplate('en');
    const content = generateSkillContent(template, '0.1.0');

    expect(content).toContain('---');
    expect(content).toContain('name: deeplearn-explain');
    expect(content).toContain('You are DeepLearn');
  });

  it('should generate Chinese SKILL.md content when zh-CN locale is passed', () => {
    const template = getLearnExplainSkillTemplate('zh-CN');
    const content = generateSkillContent(template, '0.1.0');

    expect(content).toContain('你是 DeepLearn 的讲解导师');
  });
});

describe('Command Templates', () => {
  it('should return 5 command templates', () => {
    const templates = getCommandTemplates(L);
    expect(templates).toHaveLength(5);
  });

  it('should generate CommandContent array', () => {
    const contents = getCommandContents(L);
    expect(contents).toHaveLength(5);
    for (const c of contents) {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.category).toBe('Learning');
      expect(c.body).toBeTruthy();
    }
  });
});

describe('Command Generation', () => {
  it('should generate Claude Code command files correctly', () => {
    const adapter = CommandAdapterRegistry.get('claude');
    expect(adapter).toBeDefined();

    const contents = getCommandContents(L);
    const cmds = generateCommands(contents, adapter!);
    expect(cmds).toHaveLength(5);

    for (const cmd of cmds) {
      expect(cmd.path).toContain('.claude/commands/learn/');
      expect(cmd.path).toMatch(/\.md$/);
      expect(cmd.fileContent).toContain('---');
      expect(cmd.fileContent).toContain('category: Learning');
    }
  });

  it('should generate Cursor command files correctly', () => {
    const adapter = CommandAdapterRegistry.get('cursor');
    expect(adapter).toBeDefined();

    const topicContent = getCommandContents(L)[0];
    const cmd = generateCommand(topicContent, adapter!);
    expect(cmd.path).toContain('.cursor/commands/deeplearn-topic.md');
    expect(cmd.fileContent).toContain('/deeplearn-topic');
  });

  it('should generate Codex command files with absolute paths', () => {
    const adapter = CommandAdapterRegistry.get('codex');
    expect(adapter).toBeDefined();

    const topicContent = getCommandContents(L)[0];
    const cmd = generateCommand(topicContent, adapter!);
    expect(cmd.path).toContain('.codex/prompts/deeplearn-topic.md');
  });

  it('should generate Gemini command files in TOML format', () => {
    const adapter = CommandAdapterRegistry.get('gemini');
    expect(adapter).toBeDefined();

    const topicContent = getCommandContents(L)[0];
    const cmd = generateCommand(topicContent, adapter!);
    expect(cmd.path).toContain('.gemini/commands/learn/');
    expect(cmd.path).toMatch(/\.toml$/);
    expect(cmd.fileContent).toContain('description =');
    expect(cmd.fileContent).toContain('prompt = """');
  });
});

describe('Skill Template Content Quality', () => {
  it('explain template should include Socratic guidance', () => {
    const t = getLearnExplainSkillTemplate('zh-CN');
    expect(t.instructions).toContain('苏格拉底');
    expect(t.instructions).toContain('递归');
    expect(t.instructions).toContain('70%讲解');
    expect(t.instructions).toContain('~/.learn/topics/');
  });

  it('practice template should include TDD guidance', () => {
    const t = getLearnPracticeSkillTemplate('zh-CN');
    expect(t.instructions).toContain('TDD');
    expect(t.instructions).toContain('难度动态调整');
    expect(t.instructions).toContain('苏格拉底式反馈');
    expect(t.instructions).toContain('代码模板');
  });

  it('topic template should include knowledge map generation', () => {
    const t = getLearnTopicSkillTemplate('zh-CN');
    expect(t.instructions).toContain('知识图谱');
    expect(t.instructions).toContain('knowledge-map.md');
    expect(t.instructions).toContain('state.yaml');
    expect(t.instructions).toContain('mkdir -p');
  });

  it('review template should include spaced repetition', () => {
    const t = getLearnReviewSkillTemplate('zh-CN');
    expect(t.instructions).toContain('间隔重复');
    expect(t.instructions).toContain('priority = (1 - confidence)');
  });

  it('status template should include visualization', () => {
    const t = getLearnStatusSkillTemplate('zh-CN');
    expect(t.instructions).toContain('热力图');
    expect(t.instructions).toContain('✅');
    expect(t.instructions).toContain('汇总面板');
  });
});
