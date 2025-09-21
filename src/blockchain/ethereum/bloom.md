---
title: 布隆过滤器（Bloom Filter）
category:
  - 区块链
  - 以太坊
---

# 布隆过滤器（Bloom Filter）

布隆过滤器（Bloom Filter）是一种 **空间效率极高** 的数据结构，常用于集合元素的快速查找。  
它可以用来判断一个元素是否在集合中，具有 **极低的存储开销** 和 **极快的查询速度**。  

不过，布隆过滤器有一个特点：  
- **可能会误判（false positive）**：即报告元素存在，但实际上并不存在。  
- **绝不会漏判（false negative）**：即若布隆过滤器认为元素不存在，那一定不存在。  

因此，布隆过滤器非常适合于需要快速过滤、不要求 100% 精准的场景。

---

## 基本原理

布隆过滤器的核心是一个 **位数组（bit array）** 和 **多个哈希函数**。

1. 初始化时，创建一个长度为 `m` 的位数组，所有位均为 `0`。  
2. 插入一个元素时，使用 **k 个哈希函数** 计算该元素的哈希值，得到 `k` 个数组下标，将这些位置的位设为 `1`。  
3. 查询一个元素是否存在时，依然通过 `k` 个哈希函数得到下标，检查对应的 `k` 个位置：  
   - 若有任意一位为 `0` → 一定不存在；  
   - 若全部为 `1` → 可能存在（存在一定概率误判）。  

---

## 示例

假设位数组长度 `m = 10`，有 `k = 3` 个哈希函数。  

### 插入元素 "apple"
- 哈希函数结果：2, 5, 8  
- 将数组中下标 2、5、8 置为 1  

位数组状态：

```
[0, 0, 1, 0, 0, 1, 0, 0, 1, 0]
```

### 插入元素 "pear"
- 哈希结果：1, 5, 9  
- 将下标 1、5、9 置为 1  

位数组状态：

```
[0, 1, 1, 0, 0, 1, 0, 0, 1, 1]
```

### 查询 "apple"
- 哈希结果：2, 5, 8 → 对应位均为 1  
- **判断：可能存在**（实际存在）

### 查询 "banana"
- 哈希结果：3, 6, 8  
- 下标 3 = 0  
- **判断：一定不存在**

![bloom_filter](https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Bloom_filter.svg/1920px-Bloom_filter.svg.png)

---

## 比特币中的布隆过滤器

在比特币系统中，布隆过滤器主要用于 **轻节点（SPV 节点, Simplified Payment Verification）**。  
轻节点不存储完整区块，只关心与自己相关的交易。  

### 问题
如果轻节点直接请求全节点发送所有交易，那么：  
- 数据量过大，带宽消耗严重；  
- 泄露了轻节点关心的地址，损害隐私。  

### 解决：布隆过滤器

BIP37（Bitcoin Improvement Proposal 37）提出了一种方案：  
- 轻节点设置一个布隆过滤器，包含自己关心的地址、公钥哈希或交易 ID；  
- 将该布隆过滤器发送给全节点；  
- 全节点只返回布隆过滤器判断为“可能匹配”的交易或区块数据。  

这样：  
- 轻节点能高效获取相关交易；  
- 全节点无需知道轻节点的具体地址，保护了隐私；  
- 代价是：由于布隆过滤器存在 **误判**，全节点可能会多返回一些与轻节点无关的交易。

### 示例
- 轻节点关心地址 `A`，将其加入布隆过滤器；  
- 当全节点收到新区块时，遍历区块交易，用布隆过滤器检查是否“可能匹配”；  
- 如果匹配，则返回该交易（可能是真匹配，也可能是误判）。  

### 数据结构

Receipt收据树数据结构

```go
// Receipt represents the results of a transaction.
type Receipt struct {
	// Consensus fields: These fields are defined by the Yellow Paper
	Type              uint8  `json:"type,omitempty"`
	PostState         []byte `json:"root"`
	Status            uint64 `json:"status"`
	CumulativeGasUsed uint64 `json:"cumulativeGasUsed" gencodec:"required"`
    
    // 这个收据的 bloom filter
	Bloom             Bloom  `json:"logsBloom"         gencodec:"required"`
    // 每个收据可以包含多个Log。这个收据的bloom filter就是根据这些Log产生出来的
	Logs              []*Log `json:"logs"              gencodec:"required"`

	// Implementation fields: These fields are added by geth when processing a transaction.
	TxHash            common.Hash    `json:"transactionHash" gencodec:"required"`
	ContractAddress   common.Address `json:"contractAddress"`
	GasUsed           uint64         `json:"gasUsed" gencodec:"required"`
	EffectiveGasPrice *big.Int       `json:"effectiveGasPrice"` // required, but tag omitted for backwards compatibility

	// Inclusion information: These fields provide information about the inclusion of the
	// transaction corresponding to this receipt.
	BlockHash        common.Hash `json:"blockHash,omitempty"`
	BlockNumber      *big.Int    `json:"blockNumber,omitempty"`
	TransactionIndex uint        `json:"transactionIndex"`
}
```

> https://github.com/ethereum/go-ethereum/blob/master/core/types/block.go#L64


区块块头的bloom filter

```go
type Header struct {
	ParentHash  common.Hash    `json:"parentHash"       gencodec:"required"`
	UncleHash   common.Hash    `json:"sha3Uncles"       gencodec:"required"`
	Coinbase    common.Address `json:"miner"`
	Root        common.Hash    `json:"stateRoot"        gencodec:"required"`
	TxHash      common.Hash    `json:"transactionsRoot" gencodec:"required"`
	ReceiptHash common.Hash    `json:"receiptsRoot"     gencodec:"required"`
    
    // 区块块头中的Bloom filter，就是整个区块的收据的bloom filter合并一起取到的
	Bloom       Bloom          `json:"logsBloom"        gencodec:"required"`
	Difficulty  *big.Int       `json:"difficulty"       gencodec:"required"`
	Number      *big.Int       `json:"number"           gencodec:"required"`
	GasLimit    uint64         `json:"gasLimit"         gencodec:"required"`
	GasUsed     uint64         `json:"gasUsed"          gencodec:"required"`
	Time        uint64         `json:"timestamp"        gencodec:"required"`
	Extra       []byte         `json:"extraData"        gencodec:"required"`
	MixDigest   common.Hash    `json:"mixHash"`
	Nonce       BlockNonce     `json:"nonce"`

	// BaseFee was added by EIP-1559 and is ignored in legacy headers.
	BaseFee *big.Int `json:"baseFeePerGas" rlp:"optional"`

	// WithdrawalsHash was added by EIP-4895 and is ignored in legacy headers.
	WithdrawalsHash *common.Hash `json:"withdrawalsRoot" rlp:"optional"`

	// ExcessDataGas was added by EIP-4844 and is ignored in legacy headers.
	ExcessDataGas *uint64 `json:"excessDataGas" rlp:"optional"`

	// DataGasUsed was added by EIP-4844 and is ignored in legacy headers.
	DataGasUsed *uint64 `json:"dataGasUsed" rlp:"optional"`
}
```
> https://github.com/ethereum/go-ethereum/blob/master/core/types/block.go#L64

---



## 应用与特点

### 优点
- 高效节省存储和带宽。  
- 查询速度快，适合大规模数据场景。  
- 在比特币中提升了轻节点的隐私保护。  

### 缺点
- 存在误判，不适合要求严格准确性的场景。  
- 不支持删除元素（除非使用 Counting Bloom Filter）。  
- 在比特币中，BIP37 布隆过滤器因仍有隐私泄露风险，逐渐被更安全的协议替代（如 BIP157/BIP158 的 **Neutrino 协议**）。  

---

## 参考资料

- https://zh.wikipedia.org/wiki/%E5%B8%83%E9%9A%86%E8%BF%87%E6%BB%A4%E5%99%A8
- https://www.yuque.com/tmfl/block_chain/kue9x22qgk53gqw5#99fcca7d

## 📌 总结
布隆过滤器是一种 **概率型数据结构**，在比特币中主要用于 **轻节点筛选相关交易**。  
它极大地提升了存储和带宽效率，但存在误判和隐私风险。  

在区块链领域，布隆过滤器是一种经典的轻量级数据结构，帮助节点在去中心化网络中实现高效交互。  

