import path from 'path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';

function escapeYamlValue(value: string): string {
  const needsQuoting = /[:\n\r#{}[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }
  return value;
}

export const cursorAdapter: ToolCommandAdapter = {
  toolId: 'cursor',

  getFilePath(commandId: string): string {
    return path.join('.cursor', 'commands', `deeplearn-${commandId}.md`);
  },

  formatFile(content: CommandContent): string {
    return `---
name: /deeplearn-${content.id}
id: deeplearn-${content.id}
category: ${escapeYamlValue(content.category)}
description: ${escapeYamlValue(content.description)}
---

${content.body}
`;
  },
};
