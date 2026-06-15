import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import Layout from './components/Layout.vue';
import Dashboard from './components/Dashboard.vue';
import TopicCard from './components/TopicCard.vue';
import TopicPage from './components/TopicPage.vue';
import DomainPage from './components/DomainPage.vue';
import SessionNotes from './components/SessionNotes.vue';
import ExerciseView from './components/ExerciseView.vue';
import ProgressBar from './components/ProgressBar.vue';
import StatusIcon from './components/StatusIcon.vue';
import LanguageSwitch from './components/LanguageSwitch.vue';
import './styles/custom.css';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('Dashboard', Dashboard);
    app.component('TopicCard', TopicCard);
    app.component('TopicPage', TopicPage);
    app.component('DomainPage', DomainPage);
    app.component('SessionNotes', SessionNotes);
    app.component('ExerciseView', ExerciseView);
    app.component('ProgressBar', ProgressBar);
    app.component('StatusIcon', StatusIcon);
    app.component('LanguageSwitch', LanguageSwitch);
  },
} satisfies Theme;
