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
  type SkillTemplate,
} from '../templates/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';
import type { SupportedLocale } from '../../i18n/types.js';

export interface SkillTemplateEntry {
  template: SkillTemplate;
  dirName: string;
  workflowId: string;
}

export interface CommandTemplateEntry {
  template: ReturnType<typeof getLearnTopicCommandTemplate>;
  id: string;
}

export function getSkillTemplates(locale: SupportedLocale): SkillTemplateEntry[] {
  return [
    { template: getLearnTopicSkillTemplate(locale), dirName: 'learn-anything-topic', workflowId: 'topic' },
    { template: getLearnExplainSkillTemplate(locale), dirName: 'learn-anything-explain', workflowId: 'explain' },
    { template: getLearnPracticeSkillTemplate(locale), dirName: 'learn-anything-practice', workflowId: 'practice' },
    { template: getLearnReviewSkillTemplate(locale), dirName: 'learn-anything-review', workflowId: 'review' },
    { template: getLearnStatusSkillTemplate(locale), dirName: 'learn-anything-status', workflowId: 'status' },
  ];
}

export function getCommandTemplates(locale: SupportedLocale): CommandTemplateEntry[] {
  return [
    { template: getLearnTopicCommandTemplate(locale), id: 'topic' },
    { template: getLearnExplainCommandTemplate(locale), id: 'explain' },
    { template: getLearnPracticeCommandTemplate(locale), id: 'practice' },
    { template: getLearnReviewCommandTemplate(locale), id: 'review' },
    { template: getLearnStatusCommandTemplate(locale), id: 'status' },
  ];
}

export function getCommandContents(locale: SupportedLocale): CommandContent[] {
  const commandTemplates = getCommandTemplates(locale);
  return commandTemplates.map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}

export function generateSkillContent(
  template: SkillTemplate,
  generatedByVersion: string,
  transformInstructions?: (instructions: string) => string
): string {
  const instructions = transformInstructions
    ? transformInstructions(template.instructions)
    : template.instructions;

  return `---
name: ${template.name}
description: ${template.description}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires learn-anything CLI.'}
metadata:
  author: ${template.metadata?.author || 'learn-anything'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${generatedByVersion}"
---

${instructions}
`;
}
