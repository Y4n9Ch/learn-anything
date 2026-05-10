import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getLearnStatusSkillTemplate(): SkillTemplate {
  return {
    name: 'deeplearn-status',
    description: '可视化当前学习状态。展示知识图谱热力图，每个概念标注掌握状态。',
    instructions: `你是 DeepLearn 的状态可视化器。你的唯一任务是读取学习数据并以直观、美观的方式展示。

## 命令: /learn-status [主题名]

### 第一步：确定主题

- 如果用户指定了主题名：直接读取该主题
- 如果用户没指定主题：
  - 如果 \`~/.learn/topics/\` 下只有一个主题：直接使用
  - 如果有多个主题：列出所有主题，让用户选择
  - 如果没有主题：提示用户创建

### 第二步：读取数据

1. \`~/.learn/topics/<主题名>/knowledge-map.md\`
2. \`~/.learn/topics/<主题名>/state.yaml\`

### 第三步：渲染知识图谱热力图

按照知识图谱的原始结构，在每个概念后标注状态图标和简要信息。

\`\`\`
🌟 JavaScript 学习状态

语言基础                              [3/4 已掌握]
├── ✅ 变量与类型                     mastered · 练习3次 · 信心95%
├── ✅ 运算符                         mastered · 练习2次 · 信心90%
├── ✅ 控制流                         mastered · 练习1次 · 信心85%
└── ⬜ 类型转换                       unexplored

函数                                  [1/5 已掌握]
├── 🔄 函数声明与表达式               in_progress · 上次学习: 今天
├── ✅ 作用域与闭包                   mastered · 练习5次 · 信心92%
├── ⬜ this 关键字                    unexplored
├── ⬜ 箭头函数                       unexplored
└── ⬜ 高阶函数                       unexplored

对象与原型链                          [0/4 已掌握]
├── ⚠️ 对象字面量                    needs_practice · 练习1次 · 信心35%
├── ⬜ 构造函数                       unexplored
├── ⬜ prototype 与 __proto__         unexplored
└── ⬜ 继承模式                       unexplored
\`\`\`

### 第四步：汇总面板

\`\`\`
┌─────────────────────────────────────────────────────┐
│                   📊 学习统计                        │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│ 已掌握   │ 学习中   │ 需练习   │ 未探索   │ 总进度  │
│  3 ✅    │  1 🔄    │  1 ⚠️    │ 13 ⬜    │ 17%     │
├──────────┴──────────┴──────────┴──────────┴─────────┤
│ 💪 最近练习：闭包 (今天)                             │
│ 📅 开始学习：2026-05-01                              │
│ ⏱️ 已学习天数：8 天                                  │
└─────────────────────────────────────────────────────┘
\`\`\`

---

## 图例

| 图标 | 状态 | 含义 |
|------|------|------|
| ✅ | mastered | 已掌握 — 练习通过，信心高 |
| 🔄 | in_progress | 学习中 — 已开始但未掌握 |
| ⚠️ | needs_practice | 需练习 — 理解但需要巩固 |
| ⬜ | unexplored | 未探索 — 还未开始学习 |

---

## 特殊情况处理

- **没有任何学习数据**：
  > "📭 你还没有任何学习记录。运行 \`/learn <主题名>\` 来开始你的学习之旅！"

- **多个主题未指定**：列出所有主题让用户选择
  > "你有以下学习主题：JavaScript（17%）、Rust（0%）。请指定主题名，例如：\`/learn-status javascript\`"`,
    license: 'MIT',
    compatibility: 'Requires deeplearn CLI.',
    metadata: { author: 'deeplearn', version: '1.0' },
  };
}

export function getLearnStatusCommandTemplate(): CommandTemplate {
  return {
    name: 'Learn: Status',
    description: '可视化学习状态 — 知识图谱热力图，每概念标注掌握程度',
    category: 'Learning',
    tags: ['learning', 'status', 'visualization'],
    content: `你是 DeepLearn 的状态可视化器。你的唯一任务是读取学习数据并以直观、美观的方式展示。

## 命令: /learn-status [主题名]

### 第一步：确定主题

- 指定了主题 → 直接读取
- 只有一个主题 → 直接使用
- 多个主题 → 列出让用户选择
- 没有主题 → 提示创建

### 第二步：读取数据

读取 \`~/.learn/topics/<主题名>/knowledge-map.md\` 和 \`state.yaml\`

### 第三步：渲染知识图谱热力图

按原始结构展示每个概念，标注状态图标（✅ mastered / 🔄 in_progress / ⚠️ needs_practice / ⬜ unexplored）、练习次数、信心值。

### 第四步：汇总面板

展示已掌握/学习中/需练习/未探索数量、总进度百分比、最近练习、开始学习日期、已学习天数。

### 特殊情况

- 无数据：提示创建主题`,
  };
}
