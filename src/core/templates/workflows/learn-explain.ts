import type { SkillTemplate, CommandTemplate } from '../types.js';
import type { SupportedLocale } from '../../../i18n/types.js';
import { getMessages } from '../../../i18n/index.js';

export function getLearnExplainSkillTemplate(locale: SupportedLocale): SkillTemplate {
  const msgs = getMessages(locale).skills.explain.skill;
  return {
    name: msgs.name,
    description: msgs.description,
    instructions: msgs.instructions,
    license: 'MIT',
    compatibility: 'Requires learn-anything CLI.',
    metadata: { author: 'learn-anything', version: '1.0' },
  };
}

export function getLearnExplainCommandTemplate(locale: SupportedLocale): CommandTemplate {
  const msgs = getMessages(locale).skills.explain.command;
  return {
    name: msgs.name,
    description: msgs.description,
    category: 'Learning',
    tags: ['learning', 'explain', 'socratic', 'recursive'],
    content: msgs.content,
  };
}
