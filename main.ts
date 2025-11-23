import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './index.css';

// 全局错误处理
const app = createApp(App);

app.use(router);

app.config.errorHandler = (err, _instance, info) => {
  console.error('Global error:', err, info);
  // 可以在这里添加错误上报逻辑
};

app.mount('#root');

