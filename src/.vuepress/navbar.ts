import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: 'Docker',
    icon: 'skill-icons:docker',
    children: [
      { text: 'Gitbook Docker', link: 'https://tuonioooo-notebook.gitbook.io/docker' },
      { text: 'Github Docker', link: 'https://github.com/tuonioooo/docker' },
    ],
  },
  {
    text: '人工智能',
    link: '/artificial-intelligence/',
    children: [
      { text: '机器学习', link: 'machine-Learning/intro' },
      { text: '深度学习', link:  'deep-learning/intro' },
      { text: '自然语言处理', link: 'natural-language-processing/intro' },
      { text: '计算机视觉', link: 'computer-vision/intro' },
      { text: '语音技术', link: 'speech/intro' },
      { text: '马赛克', link: 'mosaic/intro' },
    ],
  },
  {
    text: '区块链',
    link: '/ethereum/'
  },
  {
    text: '大数据',
    link: '/big-data/'
  },
]);
