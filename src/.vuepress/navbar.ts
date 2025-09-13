import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: '人工智能',
    link: '/artificial-intelligence/',
    children: [
      { text: '机器学习', link: 'machine-Learning/intro' },
      { text: '深度学习', link:  'deep-learning/intro' },
      { text: '通用大模型', link: 'general-llms/intro' },
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
  {
    text: '📘 专项文档',
    children: [
      { text: '💻 服务端技术栈', link: 'https://coding.dzspace.top/' },
      { text: '🐧 Linux', link: 'https://devops.dzspace.top/linux/' },
      { text: 'Docker', icon: 'skill-icons:docker', link: 'https://github.com/tuonioooo/docker' },
    ]
  }
]);
