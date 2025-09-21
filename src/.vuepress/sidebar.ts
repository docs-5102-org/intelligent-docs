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
  "/blockchain/":[
    {
      text: "比特币",
      prefix: "bitcoin/",
      collapsible: true,
      children: [
        "blockchain",
        {
          text: "交易原理",
          prefix: "p2p/",
          link: "p2p/tx",
          collapsible: true,
          children: [
            "private_key",
            "public_key",
            "signature",
          ],
        },
        "agreement",
        "network",
        "mining",
        "mining_nonce",
        "script",
        "fork",
        "utxo",
        "anonymity",
        "segwit",
        "hdwallet",
      ],
    },
    {
      text: "以太坊",
      prefix: "ethereum/",
      collapsible: true,
      children: [
        "intro",
        "account",
        "block",
        "trade",
        "bloom",
        "ghost",
        "ming",
        "consensus",
        "smart-contracts",
        "thedao",
        "beauty-chain",
        "wallet",
        "layer2"
      ],
    },
    {
      text: "以太坊智能合约开发",
      prefix: "ethereum_develop/",
      collapsible: true,
      children: [
        "solidity",
        "vscode_config_solidity",
        "dapp",
      ],
    },
    {
      text: "参考资料",
      link: "reference-manual",
    },
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
