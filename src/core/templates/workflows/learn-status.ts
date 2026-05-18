import type { SkillTemplate, CommandTemplate } from '../types.js';
import type { SupportedLocale } from '../../../i18n/types.js';
import { getMessages } from '../../../i18n/index.js';

export function getLearnStatusSkillTemplate(locale: SupportedLocale): SkillTemplate {
  const msgs = getMessages(locale).skills.status.skill;
  return {
    name: msgs.name,
    description: msgs.description,
    instructions: msgs.instructions,
    license: 'MIT',
    compatibility: 'Requires deeplearn CLI.',
    metadata: { author: 'deeplearn', version: '1.0' },
  };
}

export function getLearnStatusCommandTemplate(locale: SupportedLocale): CommandTemplate {
  const msgs = getMessages(locale).skills.status.command;
  return {
    name: msgs.name,
    description: msgs.description,
    category: 'Learning',
    tags: ['learning', 'status', 'visualization'],
    content: msgs.content,
  };
}
