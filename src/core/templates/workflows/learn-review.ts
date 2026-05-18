import type { SkillTemplate, CommandTemplate } from '../types.js';
import type { SupportedLocale } from '../../../i18n/types.js';
import { getMessages } from '../../../i18n/index.js';

export function getLearnReviewSkillTemplate(locale: SupportedLocale): SkillTemplate {
  const msgs = getMessages(locale).skills.review.skill;
  return {
    name: msgs.name,
    description: msgs.description,
    instructions: msgs.instructions,
    license: 'MIT',
    compatibility: 'Requires learn-anything CLI.',
    metadata: { author: 'learn-anything', version: '1.0' },
  };
}

export function getLearnReviewCommandTemplate(locale: SupportedLocale): CommandTemplate {
  const msgs = getMessages(locale).skills.review.command;
  return {
    name: msgs.name,
    description: msgs.description,
    category: 'Learning',
    tags: ['learning', 'review', 'spaced-repetition'],
    content: msgs.content,
  };
}
