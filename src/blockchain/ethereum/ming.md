---
title: 挖矿算法
category:
  - 区块链
  - 以太坊
  - 挖矿
---

# 以太坊挖矿算法（Ethash）

##  概述

- 以太坊主网在早期采用的是 **PoW（Proof of Work，工作量证明）** 共识机制，挖矿算法称为 **Ethash**。:contentReference[oaicite:0]{index=0}  
- Ethash 是由前身 **Dagger-Hashimoto** 演进而来，对其进行了重构与优化，以抗 ASIC（专用矿机），提高普通矿工与 GPU 的参与性。:contentReference[oaicite:1]{index=1}

---

## 设计目标

- **抗 ASIC**：设计一种内存密集型算法，使得 ASIC 矿机难以大幅领先，从而保持网络去中心化。
- **Memory-hard（内存硬）**：算法在挖矿过程中需要大量内存读取与存储，不能单纯靠算力。 
- **轻节点可验证**：轻客户端不必保存完整数据集，只需保存“缓存”（cache）就能验证挖矿结果。
---

##  核心原理与流程

Ethash 的挖矿过程大体分为以下部分：

| 步骤 | 内容 |
|---|------|
| **种子 (Seed) 生成** | 与区块高度关联，每个 epoch（以太坊中一个“纪元周期”）有一个固定种子值。这个种子用于后续生成缓存和数据集。:contentReference[oaicite:5]{index=5} |
| **Cache (缓存) 生成** | 由种子生成一个伪随机的缓存（cache），大小初始为约 16MB，用于后续数据集的构建与轻验证。:contentReference[oaicite:6]{index=6} |
| **DAG 数据集** | 全称 “Directed Acyclic Graph” 数据集，用 cache 生成，用于挖矿时实际引用查询。数据集非常大（初始 ~1GB，每个 epoch 更新一次，并随着区块数量推移略有增长）。矿工在挖矿时需要保存这个数据集。:contentReference[oaicite:7]{index=7} |
| **挖矿 (Mining / Nonce 寻找)** | 矿工结合区块头中的某些信息 + 一个 Nonce，从 DAG 数据集中读取多个子部分（pseudo-random lookup），然后做哈希运算，以求满足难度阈值条件（Hash(BlockHeader with Nonce + DAG-derived mix) ≤ target）。不断尝试 Nonce，直到找到为止。:contentReference[oaicite:8]{index=8} |
| **验证 (Verification)** | 轻节点或者任何节点只需用 cache（或必要的 DAG 部分）验证提交过来的 Nonce 与 mix 是否真的满足难度要求，并且验证中所用的 DAG 查询是正确的。验证过程比挖矿简单很多。:contentReference[oaicite:9]{index=9} |

---

## 参数与 Epoch 更新

- **Epoch**：以太坊中内置的周期，每隔一段区块（例如 30,000 块）更新一次 cache 和 DAG 数据集。
- 数据集随时间增长：每个 epoch 更新后 DAG 会变大，以增加挖矿的资源需求。
- Cache 大小与 DAG 大小：初始值分别大约 16MB（Cache）和 1GB（DAG）。这些数值可能因网络状态变化而调整。

---

## 难度与目标阈值

- 如同比特币，Ethereum 的挖矿难度也是动态调整的，以维持平均出块时间约 **12-15 秒**。
- 难度与目标（target）是反比关系：目标越小，难度越高。矿工只有使计算输出哈希值小于该 target 才能成功出块。

---

## 示例

假设矿工准备挖矿，有以下情形：

- 种子和缓存 + DAG 数据集已生成并保持最新。  
- 矿工拿到一个候选区块头（包括父区块哈希、交易根、时间戳等内容）。  
- 矿工尝试多个 Nonce，例如：

```

Nonce = 0x0000000000000001
mixHash = EthashMix(blockHeader, Nonce, DAG)
resultHash = Keccak256(blockHeader + mixHash)

```

- 若 `resultHash <= target` → 找到合法块 → 广播。  
- 否则尝试下一 Nonce。  

---

##  优点与局限

| 优点 | 局限 / 弱点 |
|---|-------------|
| 能较好抵抗早期 ASIC 的集中化趋势，普通 GPU 矿工有机会参与。:contentReference[oaicite:15]{index=15} | 随着时间推移，ASIC 硬件仍然被研发出来，Ethash 的抗 ASIC 性降低。 |
| 引入 DAG & Cache 使得验证方便，轻客户端资源需求降低。:contentReference[oaicite:16]{index=16} | DAG 数据集体积巨大，占用显存 / GPU 内存较大；对硬件资源要求高。:contentReference[oaicite:17]{index=17} |
| 动态难度调整，保持网络稳定的出块速率。 | 能源消耗高，PoW 本质上很消耗电力。 |
| 算法开放、透明，矿工社区对于规则（如 Epoch 大小、DAG 更新频率等）相对清晰。 | 在 Eth1 → Eth2 向 PoS 转型中，Ethash 已被弃用，未来以太坊不再依赖此算法。:contentReference[oaicite:18]{index=18} |

---

## 更多内容

- [挖矿算法](https://www.yuque.com/tmfl/block_chain/pb88eocndtxmz023#ed4f19c0)
- [调整难度](https://www.yuque.com/tmfl/block_chain/gv0qvb6r9acuy6hp)


## 总结

Ethash 是以太坊早期主网使用的 PoW 算法，它结合了内存硬性要求（memory-hard）、资源读取密集性以及随机 DAG 查表等结构，旨在提高抗 ASIC 能力、提升参与门槛的公平性。虽然现在以太坊转向 PoS，但 Ethash 在加密货币历史上具有重要地位，并深入影响了社区与技术生态。



