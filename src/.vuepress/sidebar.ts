import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "intro",
  ],
  "/machine-Learning/":[
    {
      text: "简介",
      link: "intro",
    },
  ],
  "/deep-learning/":[
    {
      text: "简介",
      link: "intro",
    },
  ],
  "/natural-language-processing/":[
    {
      text: "简介",
      link: "intro",
    },
  ],
  "/computer-vision/":[
    {
      text: "简介",
      link: "intro",
    },
  ],
  "/speech/":[
    {
      text: "简介",
      link: "intro",
    },
    {
      text: "百度语音合成",
      link: "baidutts",
    },
    {
      text: "Jacob语音合成",
      link: "jacob",
    },
    {
      text: "语音工具",
      link: "tools",
    },
    {
      text: "微软Edge大声朗读功能API调用指南",
      link: "microsoft-edge-starter",
    },
    {
      text: "Microsoft Azure语音服务常见问题",
      link: "azure-problem",
    }
  ],
  "/ethereum/":[
    {
      text: "简介",
      link: "intro",
    },
    {
      text: "区块链参考资料",
      link: "reference-manual",
    }
  ],
  "/big-data/":[
    {
      text: "简介",
      link: "intro",
    },
  ],
  "/mosaic/":[
    {
      text: "简介",
      link: "intro",
    },
  ]
});
