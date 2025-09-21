---
title: 美链
category:
  - 区块链
  - 以太坊
  - 智能合约
  - 美链
---

# 以太坊历史重大事件：美链（BEC）整数溢出攻击

## 事件概述

**美链（BeautyChain，BEC）**是以太坊历史上另一个重大安全事件，发生在2018年4月22日（实际是4月23日中午11:30左右），黑客利用整数溢出漏洞攻击美链BEC智能合约，成功向两个地址转出天量级别的BEC代币，导致市场海量抛售，该数字货币价值几乎归零。

## 项目背景

### 基本信息
- **发行时间**: 2018年2月23日下午16:00开盘，价格0.09美元
- **价格表现**: 开盘后如火箭般扶摇直上，一度飙涨至80美元，后跌至4美元，短短一天涨幅高达4000%
- **市值巅峰**: 总发行70亿代币，总市值瞬间达到280亿美元左右
- **合作关系**: 美链与美图公司在2018年2月达成战略合作

### 项目特点
- 美链是部署在以太坊上的智能合约，有自己的代币BEC，以智能合约形式运行在以太坊EVM平台上
- 白皮书中既没有团队介绍，也未涉及任何技术描述，采用什么共识算法不知，什么时候上线主网不知

## 技术漏洞分析

### 攻击核心：batchTransfer函数
```solidity
function batchTransfer(address[] _receivers, uint256 _value) public returns (bool) {
    uint256 cnt = _receivers.length;
    uint256 amount = uint256(cnt) * _value;  // 🚨 漏洞点：整数溢出
    require(cnt > 0 && cnt <= 20);
    require(_value > 0 && balances[msg.sender] >= amount);
    
    balances[msg.sender] = balances[msg.sender].sub(amount);
    for (uint256 i = 0; i < cnt; i++) {
        balances[_receivers[i]] = balances[_receivers[i]].add(_value);
        Transfer(msg.sender, _receivers[i], _value);
    }
    return true;
}
```

### 攻击步骤详解

**第1步：构造攻击参数**
- 攻击者传入两个地址，value值为2^255
- cnt为转账地址数量，这里是2

**第2步：整数溢出计算**
```solidity
uint256 amount = uint256(2) * 2^255;
// 结果: 2^256 溢出，amount变为0
```

**第3步：绕过余额检查**
- 使cnt * value后超过uint256的最大值溢出导致amount变为0
- `require(balances[msg.sender] >= 0)` 总是为真
- 余额检查被成功绕过

**第4步：大量代币生成**
- 循环中每个地址获得 `2^255` 个代币
- 黑客转出的代币数量远超BEC发行数量70亿枚

## 攻击交易记录

**关键交易哈希**: 0xad89ff16fd1ebe3a0a7d405a1ab651de4ed7a9901ba99906d7ca1d88bed09cb2

**合约地址**: 0xc5d105e63711398af9bbff092d4b6769c82f793d

## 市场影响

### immediate后果
- BEC价格呈现断崖式下跌
- BEC市值瞬间几乎归零，OKEx随后暂停BEC交易和提现
- 迫使交易所不得不暂时停止交易

### 连锁反应
- 美图公司宣布终止合作
- 引发对ERC-20代币安全性的广泛质疑
- 智能合约安全事件频发引起外界关注

## 技术根因分析

### 代码缺陷
BEC智能合约代码中，其他地方都使用了SafeMath，而关键的uint256 amount = uint256(cnt) * _value却没有使用

### 修复方案
```solidity
// ❌ 有漏洞的代码
uint256 amount = uint256(cnt) * _value;

// ✅ 正确的代码
uint256 amount = _value.mul(uint256(cnt));  // 使用SafeMath
```

## 深层反思

### 技术层面
微博研发副总经理Tim Yang认为："最近的ERC20转账安全问题直接原因都是代码安全漏洞，但深层次原因是以太坊只是记录dapp执行结果的区块链，本身并没有加密货币复式记账所需的utxo模型。重要token资产需要货币级别的安全程度，以太坊目前设计更适合游戏积分类合约"

### 开发规范
- 必须使用SafeMath库进行数学运算

SafeMath提供的计算，就可以很容易检测到溢出
```js
library SafeMath {
	function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
		if (a == 0) {
			return 0;
		}
		c = a * b;
		assert(c / a == b);  // 通过c除以a是否等于b，判断是否有溢出。 solidity中都是整数，不存在精度丢失问题，可以直接用等号判断
		return c;
	}
}
```

- 所有外部输入都要进行严格验证
- 代码审计的重要性

## 历史意义

美链BEC事件与TheDAO攻击一样，成为以太坊发展史上的重要安全教训：
1. **推动了智能合约安全标准的建立**
2. **促进了代码审计行业的发展** 
3. **让开发者更重视整数溢出等底层安全问题**
4. **引发了对DeFi项目安全性的深度思考**

## 相关链接

- [北大讲堂的笔记](https://www.yuque.com/tmfl/block_chain/mge3l922sicicwgg)

### 以太坊区块链浏览器
- **BEC合约地址**: https://etherscan.io/address/0xc5d105e63711398af9bbff092d4b6769c82f793d
- **关键攻击交易**: https://etherscan.io/tx/0xad89ff16fd1ebe3a0a7d405a1ab651de4ed7a9901ba99906d7ca1d88bed09cb2

### 技术分析报告
- **360安全团队分析**: https://www.anquanke.com/post/id/106799
- **慢雾科技安全预警**: https://mp.weixin.qq.com/s/1MB-t_yZYsJDTPRazD1zxA

### 国际媒体
- **CoinDesk报道**: https://www.coindesk.com/markets/2018/04/23/ethereums-erc-20-tokens-are-disappearing/
- **Bitcoin.com分析**: https://news.bitcoin.com/bec-token-exploit-sees-millions-of-dollars-vanish/

### 国内权威报道
- **金色财经深度报道**: https://www.jinse.com/blockchain/201572.html
- **火星财经技术分析**: https://www.huoxing24.com/newsdetail/20180423164456293.html

### GitHub相关
- **智能合约代码分析**: https://github.com/ConsenSys/mythril-classic/wiki/Mythril-Classic-and-MythX-overview
- **SafeMath库**: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol

### 技术博客
- **知乎深度分析**: https://zhuanlan.zhihu.com/p/36268718
- **CSDN技术解析**: https://blog.csdn.net/weixin_42120252/article/details/80094294

### 交易所公告
- **OKEx暂停交易公告**: https://www.okex.com/support/hc/zh-cn/articles/360000715052
- **火币Pro风险提示**: https://huobiglobal.zendesk.com/hc/zh-cn/articles/360000203842

### 安全公司报告
- **PeckShield安全报告**: https://peckshield.medium.com/integer-overflow-i-e-proxyoverflow-bug-found-in-multiple-erc20-smart-contracts-14fecfba2759
- **Certik审计报告**: https://www.certik.com/resources/blog/integer-overflow-issue-in-smart-contract

### Reddit讨论
- **r/ethereum社区讨论**: https://www.reddit.com/r/ethereum/comments/8ea4cz/warning_new_batchoverflow_bug_in_multiple_erc20/

### 以太坊官方
- **以太坊博客安全提醒**: https://blog.ethereum.org/2016/06/19/thinking-smart-contract-security/

### 安全教育
- **ConsenSys安全最佳实践**: https://consensys.github.io/smart-contract-best-practices/
- **OpenZeppelin安全指南**: https://docs.openzeppelin.com/contracts/4.x/security

### 漏洞数据库
- **SWC Registry**: https://swcregistry.io/docs/SWC-101
- **Smart Contract Weakness Classification**: https://github.com/SmartContractSecurity/SWC-registry
