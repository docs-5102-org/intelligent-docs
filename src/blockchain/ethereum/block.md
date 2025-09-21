---
title: 区块结构
category:
  - 区块链
  - 以太坊
---

# 以太坊区块结构详解

## 引言

以太坊作为一个支持智能合约的区块链平台，其区块结构相比比特币更加复杂。比特币使用UTXO模型，而以太坊采用账户模型，这要求以太坊的区块结构能够持续跟踪和记录所有账户的状态变化。

## 1. 账户模型 vs UTXO模型

### 比特币的UTXO模型
- 比特币的区块链由PoW保证每个区块都指向前一个区块
- 每个区块内部使用独立的Merkle Tree来保证所有交易的不可篡改
- 用户的比特币以UTXO（未花费交易输出）方式存储
- 交易过程就是不断消耗现有UTXO并产生新UTXO

### 以太坊的账户模型
- 采用账户模型，每个账户都有固定的地址
- 账户余额会随着交易而变化，但地址保持不变
- 需要在每个区块中持续跟踪并记录所有账户的余额变动
- 因此区块数据结构比比特币更加复杂

## 2. Merkle Patricia Tree (MPT)

### 什么是MPT
以太坊使用Merkle Patricia Tree（MPT）来存储账户数据，这是一种改进的Merkle Tree。当MPT的每个叶子结点的值确定后，计算出的Root Hash就是完全确定的。

### MPT的工作原理

#### 初始状态（第一个区块）
```
           Root1
          ┌───┐
          │   │
          └───┘
             │
      ┌─────┴─────┐
      │           │
    ┌───┐       ┌───┐
    │   │       │   │
    └───┘       └───┘
      │           │
   ┌──┴──┐     ┌──┴──┐
   │     │     │     │
 ┌───┐ ┌───┐ ┌───┐ ┌───┐
 │5.5│ │0.2│ │1.7│ │9.0│
 └───┘ └───┘ └───┘ └───┘
```

#### 状态更新（第二个区块）
```
           Root2
          ┌───┐
          │   │
          └───┘
             │
      ┌─────┴─────┐
      │           │
    ┌───┐       ┌───┐
    │   │       │   │
    └───┘       └───┘
      │           │
   ┌──┴──┐     ┌──┴──┐
   │     │     │     │
 ┌───┐ ┌───┐ ┌───┐ ┌───┐
 │5.5│ │0.1│ │1.8│ │9.0│
 └───┘ └───┘ └───┘ └───┘
```

### 世界状态（World State）
- 每个区块通过Root Hash完全确定所有账户的状态
- 以太坊是一个状态机，每个区块记录一个stateRoot表示新状态
- stateRoot被称为当前的"世界状态"
- 给定某个区块的stateRoot，就能完全确定所有账户的余额等信息

### 存储优化

虽然逻辑上每个区块包含完整的状态树，但实际存储中：
- 每个区块只记录修改的部分
- 未修改的账户数据可以复用之前区块的数据
- 节点数据存储在LevelDB中，内存中只保存活跃的账户信息
- 需要时从LevelDB加载账户数据到内存

:::tip
内存中只保存：
├─ 活跃账户的数据（最近交易的账户）
├─ 当前处理区块相关的账户
├─ 缓存的热点账户数据
└─ MPT的部分节点（最近访问的）

LevelDB中存储：
├─ 所有历史账户数据
├─ 所有MPT节点的完整数据  
└─ 不活跃账户的完整状态
:::


## 3. 账户数据结构

每个以太坊账户由4部分数据构成：

### 账户字段说明
- **nonce**：递增整数，记录交易次数，每发送一次交易递增1
- **balance**：账户余额，以wei为单位（1 Ether = 10¹⁸ wei）
- **storageRoot**：合约账户的状态数据存储根哈希
- **codeHash**：合约代码的哈希值

### 账户类型
- **外部账户（EOA）**：storageRoot和codeHash为空
- **合约账户**：包含完整的storageRoot和codeHash数据

## 4. 区块数据结构

### 区块组成

一个以太坊区块由**区块头**和**区块体**构成。

### 区块头关键字段

```go
// Header represents a block header in the Ethereum blockchain.
type Header struct {
    // 父区块（即区块链上前一个区块）的块头哈希值
    ParentHash      common.Hash    `json:"parentHash"       gencodec:"required"` 
    // 叔父区块的块头哈希值
    UncleHash       common.Hash    `json:"sha3Uncles"       gencodec:"required"`
    // 挖出这个区块的矿工的地址
    Coinbase        common.Address `json:"miner"`
    // 以太坊中三棵树的哈希：状态树、交易树、收据树
    // 状态树的根哈希值
    Root            common.Hash    `json:"stateRoot"        gencodec:"required"`
    // 交易树的根哈希值
    TxHash          common.Hash    `json:"transactionsRoot" gencodec:"required"`
    // 收据树的根哈希值
    ReceiptHash     common.Hash    `json:"receiptsRoot"     gencodec:"required"`
    // bloomfilter，布隆过滤器，和收据树相关，提供了一种高效的查询符合某种条件的交易的执行结果
    Bloom           Bloom          `json:"logsBloom"        gencodec:"required"`
    // 挖矿难度，和比特币一样会根据需要调整
    Difficulty      *big.Int   	   `json:"difficulty"       gencodec:"required"`
    Number          *big.Int       `json:"number"           gencodec:"required"`
    // GasLimit、GasUsed和汽油费相关，智能合约要消耗汽油费，类似比特币中的交易费
    GasLimit        uint64         `json:"gasLimit"         gencodec:"required"`
    GasUsed         uint64         `json:"gasUsed"          gencodec:"required"`
    // 这个区块的产生时间
    Time            uint64         `json:"timestamp"        gencodec:"required"`
    Extra           []byte         `json:"extraData"        gencodec:"required"`
    // MixDigest、Nonce和挖矿相关。Nonce有些类似比特币的Nonce，也是要猜符合难度要求的随机数。
    MixDigest       common.Hash    `json:"mixHash"`
    Nonce           BlockNonce     `json:"nonce"`
    
    // BaseFee was added by EIP-1559 and is ignored in legacy headers
    BaseFee         *big.Int       `json:"baseFeePerGas" rlp:"optional"`
    // WithdrawalsHash was added by EIP-4895 and is ignored in legacy headers.
    WithdrawalsHash *common.Hash   `json:"withdrawalsRoot" rlp:"optional"`
    // ExcessDataGas was added by EIP-4844 and is ignored in legacy headers.
    ExcessDataGas   *uint64        `json:"excessDataGas" rlp:"optional"`
    // DataGasUsed was added by EIP-4844 and is ignored in legacy headers.
    DataGasUsed     *uint64        `json:"dataGasUsed" rlp:"optional"`
}
```

### 区块体

```go
// Body is a simple (mutable, non-safe) data container for storing and moving
// a block's data contents (transactions and uncles) together.
type Body struct {
    // 每个元素都是指向 Transaction 的指针。
	Transactions []*Transaction
    Header      *Header
	// Uncles 保存区块中引用的“叔块头”列表。
    // 叔块是指没有成为主链一部分、但在一定条件下仍能获得奖励的区块。
    Uncles       []*Header
	// Withdrawals 是提款列表（自以太坊合并/上海升级后引入）。
    // 在共识层合并后，验证者可以将质押的 ETH 提现出来，
    // 这些提款操作会被记录在区块体中。
    // 使用 `rlp:"optional"` 标签，表示在 RLP 编码时该字段是可选的。
    Withdrawals  []*Withdrawal `rlp:"optional"`
}
```

### 区块整体结构

```go
// Block represents an entire block in the Ethereum blockchain.
type Block struct {
    // block header
	header       *Header
    // 叔父区块的block header。一个区块可以有多个叔父区块，如果关联，叔父区块将得到 7/8 * 3 的奖励
	uncles       []*Header
    // 交易列表
	transactions Transactions
    // 取回列表
	withdrawals  Withdrawals

	// caches
	hash atomic.Value
	size atomic.Value

	// These fields are used by package eth to track
	// inter-peer block relay.
	ReceivedAt   time.Time
	ReceivedFrom interface{}
}
```

详见: [结果图](https://www.yuque.com/tmfl/block_chain/wmoen0h0ncrt3psq)


### 三种MPT树的区别
1. **stateRoot**：表示全局账户状态，与历史区块相关
2. **transactionRoot**：仅表示当前区块的交易，与历史无关
3. **receiptsRoot**：仅表示当前区块的交易回执，与历史无关

## 5. 叔块机制（Uncle Blocks）

### 背景
在2022年9月升级为PoS之前，以太坊采用PoW挖矿机制，类似比特币会产生分叉。

### 分叉处理
```
                                ┌───┐
                              ┌─│ 4 │
┌───┐   ┌───┐   ┌───┐   ┌───┐◀┘ └───┘
│ 0 │◀──│ 1 │◀──│ 2 │◀──│ 3 │
└───┘   └───┘   └───┘   └───┘◀┐ ┌───┐   ┌───┐
                              └─│ 4 │◀──│ 5 │
                                └───┘   └───┘
```

### 叔块引用
```
                                ┌───┐
                                │ 4 │◀┐
                                └───┘ │
┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐ └─┌───┐
│ 0 │◀──│ 1 │◀──│ 2 │◀──│ 3 │◀──│ 4 │◀──│ 5 │
└───┘   └───┘   └───┘   └───┘   └───┘   └───┘
```

### 叔块规则
- 一个区块可引用0～2个叔块
- 叔块高度必须在前7层之内
- 区块头的sha3Uncles字段记录叔块信息

### 叔块目的
- 给予竞争失败的矿工部分奖励
- 避免出现较长的分叉
- 提高网络整体安全性

## 参考资料

- https://liaoxuefeng.com/books/blockchain/ethereum/block/index.html
- https://www.yuque.com/tmfl/block_chain/wmoen0h0ncrt3psq

## 总结

以太坊的区块结构设计体现了其作为"世界计算机"的特性：
- 通过MPT高效管理账户状态
- 使用多个根哈希确保数据完整性
- 叔块机制平衡了网络安全与公平性
- 复杂的数据结构支撑了智能合约的执行环境

这种设计使得以太坊能够支持复杂的去中心化应用，同时保持区块链的安全性和一致性。