---
title: TheDAO
category:
  - 区块链
  - 以太坊
  - 智能合约
  - TheDAO
---

# TheDAO

## 基本概念理解

**DAO vs DAC vs TheDAO的关系：**
- **DAO**：去中心化自治组织的通用概念，用代码而非传统法律文件来管理
- **DAC**：去中心化自治公司，是DAO的一种形式，但没有传统公司的法人地位
- **TheDAO**：一个具体的DAO项目名称，专门用于众筹投资

## TheDAO的运作机制

**投资流程：**
1. 投资者用以太币购买TheDAO代币
2. 持有代币的人可以投票决定投资哪些项目
3. 代币越多，投票权重越大
4. 投资收益按智能合约规则分配

## 拆分机制的深层含义

**为什么需要拆分机制？**
传统投资基金如果你不同意投资方向，通常只能选择退出。但TheDAO设计了更灵活的机制：

1. **保护少数派权益**：当少数人看好某个项目但得不到多数支持时，他们可以"拆分"出去
2. **实现民主平衡**：既有多数决策，也给少数人选择权
3. **变相的赎回功能**：由于没有直接的withdraw函数，拆分成为唯一的退出方式

**具体操作：**
- 7天辩论期：让其他人考虑是否加入这个子基金
- 28天锁定期：防止资金被立即转移，给系统缓冲时间

## 设计哲学

这个设计体现了区块链项目对"去中心化民主"的理想化追求：
- 不是简单的多数暴政
- 给予少数派"用脚投票"的权利
- 通过技术手段实现组织治理的创新

不过历史上TheDAO最终因为智能合约漏洞被黑客攻击，导致大量以太币被盗，这也成为区块链发展史上的重要教训。

### 漏洞代码

```js
function splitDAO(
	uint _proposalID,
	address _newCurator
) noEther onlyTokenholders returns (bool _success) {
	
	// .......
	
	// Burn DAO Tokens
	Transfer(msg.sender, 0, balances[msg.sender]);
	
	// 下面的代码中：
	// 将币转给投资者，然后将TheDAO的总金额减少相应数目，然后将该投资者的金额清零
	withdrawRewardFor(msg.sender); // be nice, and get his rewards
	totalSupply -= balances[msg.sender];
	balances[msg.sender] = 0;
	paidOut[msg.sender] = 0;
	return true;
}
```

:::tip
此代码中先转账后清零的做法，就会出现很经典的重入攻击。
黑客就是利用该漏洞进行了重入攻击，从TheDAO中转走了近$\frac{1}{3}$的以太币。

withdrawRewardFor(msg.sender);  // 🚨 漏洞点：先转账
totalSupply -= balances[msg.sender];  // 然后才更新状态
balances[msg.sender] = 0;
paidOut[msg.sender] = 0;

这段代码展示的是TheDAO被攻击的核心漏洞！让我详细解析这个著名的**重入攻击（Reentrancy Attack）**：

**漏洞分析**

**问题代码位置**
关键问题在于 `withdrawRewardFor(msg.sender)` 这一行的执行顺序：

```js
withdrawRewardFor(msg.sender);  // 🚨 漏洞点：先转账
totalSupply -= balances[msg.sender];  // 然后才更新状态
balances[msg.sender] = 0;
paidOut[msg.sender] = 0;
```

**攻击步骤详解**

**第1步：攻击者准备**
- 攻击者创建恶意合约
- 购买一定数量的DAO代币
- 在恶意合约中实现 `fallback()` 函数

**第2步：发起splitDAO调用**
- 攻击者调用 `splitDAO()` 函数
- 代码执行到 `withdrawRewardFor(msg.sender)`

**第3步：重入攻击开始**
```solidity
// withdrawRewardFor 内部会调用类似这样的代码：
if (msg.sender.call.value(reward)()) {
    // 🚨 这里会触发攻击者合约的fallback函数
    // 但此时 balances[msg.sender] 还没有被清零！
}
```

**第4步：恶意合约的fallback函数**
```solidity
// 攻击者的恶意合约
function() payable {
    if (attackCount < maxAttacks) {
        attackCount++;
        // 🚨 重新调用splitDAO！
        theDAO.splitDAO(proposalID, newCurator);
    }
}
```

**第5步：循环攻击**
- 每次重入调用时，`balances[msg.sender]` 仍然保持原值
- `withdrawRewardFor` 会再次转账相同金额
- 直到合约余额耗尽或达到gas限制

**攻击成功的原因**

1. **Check-Effects-Interactions 模式违反**
正确的顺序应该是：
```solidity
// ✅ 正确做法
balances[msg.sender] = 0;           // 先更新状态
totalSupply -= oldBalance;          
withdrawRewardFor(msg.sender);      // 最后进行外部调用
```

2. **状态更新滞后**
- 转账发生在状态清零之前
- 重入时合约认为用户仍有余额
- 可以重复提取相同数量的以太币

3. **外部调用的不可控性**
- `call.value()` 会触发接收地址的代码
- 攻击者可以在这个时机重新调用原函数

**防护措施**

1. **重入锁（Reentrancy Guard）**
```solidity
bool private locked;
modifier noReentrancy() {
    require(!locked, "Reentrancy detected");
    locked = true;
    _;
    locked = false;
}
```

2. **使用 transfer() 代替 call()**
```solidity
// transfer() 只提供2300 gas，防止复杂重入
msg.sender.transfer(amount);
```

3. **遵循 CEI 模式**
- **C**heck：检查条件
- **E**ffects：更新状态  
- **I**nteractions：外部交互

**历史影响**

这次攻击导致：
- **6000万美元**被盗
- 以太坊**硬分叉**（ETH/ETC分离）
- 智能合约安全意识的觉醒
- 现代DeFi项目的安全标准建立

TheDAO攻击成为区块链历史上最重要的安全教训之一！

**补救措施：**
- 软分叉
- 硬分叉
  
参考：
https://www.yuque.com/tmfl/block_chain/vmktm4brwehcu5qc
https://www.yuque.com/tmfl/block_chain/cbvx4tw96iv19g4l

:::

## 相关链接和资源

### 历史档案和纪念网站
- **TheDAO代币博物馆**: https://thedaotoken.eth.link/ - 保存了TheDAO的历史信息，说明"TheDAO合约仍然存活并运行，原始代币仍然存在，保留着完整的历史记录"

### 权威信息源
- **以太坊官方DAO介绍**: https://ethereum.org/dao/ - 以太坊基金会对DAO概念的官方解释
- **维基百科条目**: https://en.wikipedia.org/wiki/The_DAO - 详细记录了TheDAO作为"在以太坊区块链上的一组合约，没有实体地址或正式权威官员"

### 详细分析文章
- **Gemini交易所分析**: https://www.gemini.com/cryptopedia/the-dao-hack-makerdao - 介绍了TheDAO"在2016年在以太坊区块链上启动，通过代币销售筹集了价值1.5亿美元的以太币后被黑客攻击"
- **CoinDesk深度报道**: https://www.coindesk.com/consensus-magazine/2023/05/09/coindesk-turns-10-how-the-dao-hack-changed-ethereum-and-crypto

### 技术分析
- **Medium详细故事**: https://medium.com/swlh/the-story-of-the-dao-its-history-and-consequences-71e6a8a551ee
- **GeeksforGeeks技术解析**: https://www.geeksforgeeks.org/what-was-the-dao-hack/

## 关键历史事实
2016年9月Poloniex下架了DAO交易对，12月Kraken也跟进下架，这标志着TheDAO项目的正式结束。这次6000万美元的黑客攻击导致了区块链的争议性修订，也成为了次年ICO热潮的推动因素。

TheDAO虽然失败了，但它的理念和技术创新对整个区块链行业产生了深远影响。