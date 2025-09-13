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
  "/general-llms/":[
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
      text: "微软Edge大声朗读API指南",
      link: "microsoft-edge-starter",
    },
    {
      text: "Microsoft Azure语音服务",
      link: "azure-problem",
    }
  ],
  "/ethereum/":[
    {
      text: "比特币",
      prefix: "/ethereum/bitcoin",
      collapsible: true,
      children: [
        "intro"
      ]
    },
    {
      text: "参考资料",
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
