import { ref } from 'vue';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type Locale = 'en' | 'zh-CN';

export type I18nKey =
  | 'dashboard.title'
  | 'dashboard.noTopics'
  | 'dashboard.startLearning'
  | 'topic.progress'
  | 'topic.domains'
  | 'topic.concepts'
  | 'topic.mastered'
  | 'domain.notes'
  | 'domain.exercises'
  | 'domain.noNotes'
  | 'domain.noExercises'
  | 'domain.backToMap'
  | 'status.mastered'
  | 'status.inProgress'
  | 'status.needsPractice'
  | 'status.unexplored'
  | 'lang.switch';

type Messages = Record<I18nKey, string>;

/* ------------------------------------------------------------------ */
/*  Message tables                                                    */
/* ------------------------------------------------------------------ */

const messages: Record<Locale, Messages> = {
  en: {
    'dashboard.title': 'Learning Dashboard',
    'dashboard.noTopics': 'No topics yet',
    'dashboard.startLearning': 'Run `learn-anything init` to start your first topic',
    'topic.progress': 'Progress',
    'topic.domains': 'Domains',
    'topic.concepts': 'Concepts',
    'topic.mastered': 'Mastered',
    'domain.notes': 'Notes',
    'domain.exercises': 'Exercises',
    'domain.noNotes': 'No session notes yet',
    'domain.noExercises': 'No exercises yet',
    'domain.backToMap': '← Back to Knowledge Map',
    'status.mastered': 'Mastered',
    'status.inProgress': 'In Progress',
    'status.needsPractice': 'Needs Practice',
    'status.unexplored': 'Unexplored',
    'lang.switch': '中文',
  },
  'zh-CN': {
    'dashboard.title': '学习仪表盘',
    'dashboard.noTopics': '暂无学习主题',
    'dashboard.startLearning': '运行 `learn-anything init` 开始你的第一个学习主题',
    'topic.progress': '学习进度',
    'topic.domains': '知识域',
    'topic.concepts': '概念',
    'topic.mastered': '已掌握',
    'domain.notes': '笔记',
    'domain.exercises': '练习',
    'domain.noNotes': '暂无笔记',
    'domain.noExercises': '暂无练习',
    'domain.backToMap': '← 返回知识地图',
    'status.mastered': '已掌握',
    'status.inProgress': '学习中',
    'status.needsPractice': '需练习',
    'status.unexplored': '未探索',
    'lang.switch': 'English',
  },
};

/* ------------------------------------------------------------------ */
/*  Shared state (singleton across components)                        */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'learn-anything-locale';

function detectLocale(): Locale {
  if (typeof localStorage === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'zh-CN' || stored === 'en') return stored;
  return 'en';
}

const locale = ref<Locale>(detectLocale());

/* ------------------------------------------------------------------ */
/*  Composable                                                        */
/* ------------------------------------------------------------------ */

export function useI18n() {
  const t = (key: I18nKey): string => {
    return messages[locale.value][key];
  };

  const toggleLocale = (): void => {
    locale.value = locale.value === 'en' ? 'zh-CN' : 'en';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, locale.value);
    }
  };

  const setLocale = (next: Locale): void => {
    locale.value = next;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
    }
  };

  return { locale, t, toggleLocale, setLocale };
}
