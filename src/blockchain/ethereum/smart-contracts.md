---
title: 智能合约
category:
  - 区块链
  - 以太坊
  - 智能合约
---

# 智能合约

## 概念

智能合约是以太坊应用程序层的基石。 它们是存储在区块链上的计算机程序，遵循“如果...那么...”(IFTTT) 逻辑，并且保证按照其代码定义的规则执行，智能合约一旦创建就无法更改。

### 传统合约中的信任问题

传统合约的最大问题之一是需要可信的个人来执行合约的结果。

下面是一个例子：

Alice 和 Bob 要进行一场自行车比赛。 假设 Alice 和 Bob 打赌 $10 元她会赢得比赛。 Bob 相信自己会成为赢家并同意下注。 最后，Alice 远远领先 Bob 完成了比赛，并且毫无疑问是赢家。 但 Bob 拒绝支付赌注，声称 Alice 一定是作弊了。

这个荒唐的例子说明了所有非智能协议存在的问题。 即使协议条件得到满足（即你是比赛的获胜者），你仍然必须要信任对方会履行协议（即支付赌注）。

### 数字自动售货机

一个适合智能合约的简单比喻是自动售货机，其工作方式有点类似于智能合约 — 特定的输入保证预定的输出。

你选择一种产品
自动售货机显示出价格
你付款
自动售货机验证你的付款金额是否正确
自动售货机给你提供产品

只有在所有要求满足后，自动售货机才会提供你想要的产品。 如果你不选择产品或投入足够的钱，自动售货机将不会提供你选择的产品。

### 自动执行

智能合约的主要优点是在满足特定条件时确定地执行清晰的代码。 无需等待人来执行或商量结果。 这消除了对可信中介的需求。

例如，你可以编写一个智能合约为孩子托管资金，并允许他们在特定日期后提取资金。 如果他们试图在指定日期前提取资金，智能合约将无法执行。 或者你可以编写一份合约，在你向经销商付款后它会自动授予你汽车的数字化所有权。

### 可预测的结果

传统合约比较含糊，因为它们依赖于人来解释和执行。 例如，两位法官可能会对合同有不同的解释，这可能会导致不一致的判决和不公平的结果。 智能合约消除了这种可能性。 然而，智能合约会根据合约代码中写入的条件精确执行。 这种精确性意味着在相同情况下，智能合约将产生相同的结果。

### 公开的记录

智能合约可用于审计和跟踪。 由于以太坊智能合约位于公共区块链上，任何人都可以立即跟踪资产转移和其他相关信息。 例如，你可以检查是否有人向自己的地址发送了资金。

### 隐私保护

智能合约还可以保护你的隐私。 由于以太坊是匿名网络（你的交易公开绑定到唯一的加密地址，而不是你的身份），你可以保护你的隐私不受观察者窥探。

### 可查看的条款

最后一点，与传统合约一样，你可以在签署（或以其他方式与之交互）之前检查智能合约的内容。 智能合约的透明性保证了任何人都可以进行审查。

### 智能合约用例

- https://ethereum.org/zh/smart-contracts/#introduction-to-smart-contracts

### 智能合约的账户

智能合约的账户保存了合约当前的运行状态：
● balance：当前余额
● nonce：交易次数
● code：合约代码
● storage：存储（数据结构是一棵MPT）

## 智能合约语言

最受欢迎和维护得最好的两种语言是：

* [Solidity](https://soliditylang.org/) - 与Javascript类似
* Vyper

### Solidity

* 执行智能合约的目标导向高级语言。
* 受 C++ 影响最深的大括号编程语言。
* 静态类型（编译时已知变量类型）。
* 支持：
  * 继承（你可以拓展其它合约）。
  * 库（你可以创建从不同的合约调用的可重用代码 - 就像静态函数在其它面向对象编程语言的静态类中一样）。
  * 复杂的用户自定义类型。

#### “公开拍卖” 示例

```js
pragma solidity ^0.8.4;        // 声明使用的solidity版本号
contract SimpleAuction {  // 面向对象的语言，contract关键字类似于class关键字
    // 状态变量，强类型语言，变量类型和c++等语言类似
    address payable public beneficiary;  // 拍卖受益人
    uint public auctionEndTime;  // 结束时间
    address public highestBidder;  // 当前的最高出价人
    uint public highestBid;  // 当前最高报价
    mapping(address => uint) pendingReturns;   // 允许撤回的之前的报价（即之前所有竞拍者的出价）。mapping是一个哈希表，但是与其他语言不同，Solidity的mapping不可以直接遍历，如果需要遍历则需要自己想办法。
    bool ended; // 是否完成
    address[] bidder;  // 所有竞拍者，因为pendingReturns是mapping类型无法遍历，可以通过bidder进行遍历。 Solidity的数组可以是固定长度的，也可以是动态改变长度的。

    // 需要记录的事件，事件可以被合约内部或外部的代码监听到，触发对应的监听器执行相应操作
    // event可以通过emit语句来进行触发
    // event只能用于记录日志，并不能够改变合约的状态。将相关信息记录到合约日志中，然后外部的竞拍人代码可以监控该事件，掌握拍卖情况
    event HighestBidIncreased(address bidder, uint amount); // 出现新的最高价时的竞拍人地址、报价
    event AuctionEnded(address winner, uint amount); // 竞拍结束，赢得竞拍人的地址、报价

    // Errors that describe failures.
    error AuctionAlreadyEnded();
    error BidNotHighEnough(uint highestBid);
    error AuctionNotYetEnded();
    error AuctionEndAlreadyCalled();

	/// 构造函数，只能有一个，仅在合约创建时调用一次。也可以定义一个与类同名的函数来创建构造函数，但是更推荐使用constructor来定义
	/// 创建一个简单的拍卖，参数为：拍卖时间biddingTime，受益者地址beneficiaryAddress
    constructor(
        uint biddingTime,
        address payable beneficiaryAddress
    ) {
        beneficiary = beneficiaryAddress;
        auctionEndTime = block.timestamp + biddingTime;
    }

	// 成员函数
	// payable表示该函数可以接收以太币转账，转账的数量以msg.value传入到合约余额中。
	// external 是可见性修饰符，表示该函数只能被外部合约或交易调用，不能在当前合约内部直接调用
    function bid() external payable {  
        
        if (block.timestamp > auctionEndTime)
            revert AuctionAlreadyEnded();

		// msg是一个全局变量，包含当前函数调用的交易信息。
		// msg.sender可以获取当前交易的发送者地址
		// msg.value可以获取当前交易的价值
		// msg.data可以获取当前交易的数据
        if (msg.value <= highestBid)
            revert BidNotHighEnough(highestBid);

        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid; // highestBidder在整个拍卖过程中，可能之前已经做出过最高报价，被别人报价超过，自己又报了一个最高报价，此处被本次交易超过后要用加等，否则之前付进合约的以太币就漏掉了。
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

	// 自己不是最高报价时，撤回自己支付到合约账户的币
	// returns 函数返回值，可以一次性返回多个值
    function withdraw() external returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;

            if (!payable(msg.sender).send(amount)) { // 从合约中将撤回的金额转入撤回人的账户中。如果send函数发生错误，会返回false而不是抛异常，所以此处直接用if判断返回值
            	// 如果撤回失败的回滚操作，即重新将该报价人的报价设置到允许撤回的哈希表中
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

	// 结束拍卖
    function auctionEnd() external {
        if (block.timestamp < auctionEndTime)
            revert AuctionNotYetEnded();
        if (ended)
            revert AuctionEndAlreadyCalled();

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        beneficiary.transfer(highestBid);  // transfer函数对接收到的以太币进行处理，将最高报价金额从本和阅读余额转移到受益人地址中
    }
}
```

#### fallback函数

```js
fallback() external payable {
    // 处理逻辑
}
```

**1. 匿名性**

没有 function 关键字后的函数名
没有参数和返回值
使用 fallback() 关键字定义

**2. 触发条件**
正如您所说，有两种情况会触发fallback函数：

```js
contract Example {
    fallback() external payable {
        // 当以下情况发生时被调用：
        // 1. 直接向合约转账且calldata为空
        // 2. 调用不存在的函数
    }
}
```

**3. 可见性和支付能力**

* 必须声明为 external
* 如果需要接收以太币，必须声明 payable
* 如果不声明 payable，向合约转账会失败

#### 实际用例

```js
contract MyContract {
    mapping(address => uint256) public balances;
    
    // 接收以太币的fallback函数
    fallback() external payable {
        balances[msg.sender] += msg.value;
        emit Received(msg.sender, msg.value);
    }
    
    event Received(address sender, uint256 amount);
}
```

:::tip
注意事项

1. Gas限制：通过 send() 或 transfer() 调用fallback时，Gas限制为2300，应避免复杂操作
2. 可选性：如您所说，fallback函数不是必需的，没有定义时相关操作会revert
3. 与receive函数的区别：Solidity 0.6.0后引入了专门的 receive() 函数处理纯以太币转账
:::

#### 重要链接

- [以太坊](https://ethereum.org/zh/developers/docs/smart-contracts/languages/#solidity)
- [Solidity官网](https://soliditylang.org/)
- [Solidity示例](https://docs.soliditylang.org/en/latest/solidity-by-example.html)
- [Github](https://github.com/ethereum/solidity/)


### Vyper

- Python风格的编程语言
- 强类型系统
- 小巧且易于理解的编译器代码
- 高效的字节码生成
- 相比Solidity有意减少了一些特性，目的是使合约更安全且更易于审计。Vyper不支持以下特性：
  - 修饰器（Modifiers）
  - 继承
  - 内联汇编
  - 函数重载
  - 运算符重载
  - 递归调用
  - 无限循环
  - 二进制定点数

更多信息，请[阅读Vyper设计理念](https://vyper.readthedocs.io/en/latest/index.html)。

#### 重要链接

- [官方文档](https://vyper.readthedocs.io)
- [Vyper示例教程](https://vyper.readthedocs.io/en/latest/vyper-by-example.html)
- [更多Vyper示例](https://vyper-by-example.org/)
- [GitHub代码仓库](https://github.com/vyperlang/vyper)
- [Vyper社区Discord聊天](https://discord.gg/SdvKC79cJk)
- [速查表](https://reference.auditless.com/cheatsheet)
- [Vyper智能合约开发框架和工具](/developers/docs/programming-languages/python/)
- [VyperPunk - 学习保护和破解Vyper智能合约](https://github.com/SupremacyTeam/VyperPunk)
- [Vyper开发中心](https://github.com/zcor/vyper-dev)
- [Vyper精选智能合约示例](https://github.com/pynchmeister/vyper-greatest-hits/tree/main/contracts)
- [Vyper优质资源集合](https://github.com/spadebuilders/awesome-vyper)

## 外部账户调用智能合约

**外部账户（EOA - Externally Owned Account）**

* 由私钥控制的账户
* 可以主动发起交易
* 没有代码

**合约账户（Contract Account）**

* 由智能合约代码控制
* 只能被动响应调用
* 包含可执行代码

### 调用方式


交易内容如下：

```json
{
  "hash": "0x1eb39b814df220a6b382c5945c7fc20a418602ab1c124c36a3df2537ede4d506",
  "blockHash": "0x676250c02dd3e54276e48cdd0f2150e958a9593b41db9835e9b3f0dab3dbcf13",
  "blockNumber": "18574462",
  "to": "0xbfc89484a50d730191ebbe341c26d9ba5da9d12e",
  "from": "0x71f531b1c01235d7a5848f6afe713d7ca1a00455",
  "value": "0",
  "nonce": "1163",
  "gasPrice": "33421518957",
  "gasLimit": "120000",
  "gasUsed": "46643",
  "data": "095ea7b30000000000000000000000005200a0e9b161bc59feecb165fe2592bef3e1847affffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  "transactionIndex": "21",
  "success": true,
  "state": "CONFIRMED",
  "timestamp": "1700017055",
  "internalTransactions": []
}
```
> 来源： https://www.blockchain.com/explorer/transactions/eth/0x1eb39b814df220a6b382c5945c7fc20a418602ab1c124c36a3df2537ede4d506

#### 调用示例

```js
pragma solidity ^0.8.0;

// 模拟ERC20接口
interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

// 示例：三种不同的合约调用方式

contract DirectCallExample {
    // 1. 直接调用示例
    function approveDirectly(address tokenAddr, address spender, uint256 amount) public returns (bool) {
        IERC20 token = IERC20(tokenAddr);
        
        // 直接调用approve函数
        // 如果执行过程中抛出错误，整个交易会回滚
        bool success = token.approve(spender, amount);
        return success;
    }
    
    // 对应交易的直接调用
    function approveMaxAmount(address tokenAddr) public returns (bool) {
        IERC20 token = IERC20(tokenAddr);
        
        // 批准最大数量给指定地址
        address spender = 0x5200a0E9b161bc59feECb165FE2592BeF3E1847a;
        uint256 maxAmount = type(uint256).max; // 等同于 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        
        return token.approve(spender, maxAmount);
    }
}

contract CallExample {
    // 2. 使用call函数调用示例
    function approveByCall(address tokenAddr, address spender, uint256 amount) public returns (bool, bytes memory) {
        // 使用abi.encodeWithSignature编码函数调用
        bytes memory data = abi.encodeWithSignature("approve(address,uint256)", spender, amount);
        
        // 使用call函数调用，返回执行结果和返回数据
        (bool success, bytes memory returnData) = tokenAddr.call(data);
        
        return (success, returnData);
    }
    
    // 对应交易的call调用
    function approveMaxAmountByCall(address tokenAddr) public returns (bool, bool) {
        address spender = 0x5200a0E9b161bc59feECb165FE2592BeF3E1847a;
        uint256 maxAmount = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
        
        // 方法1: 使用abi.encodeWithSignature
        (bool success, bytes memory returnData) = tokenAddr.call(
            abi.encodeWithSignature("approve(address,uint256)", spender, maxAmount)
        );
        
        bool approveResult = false;
        if (success && returnData.length > 0) {
            approveResult = abi.decode(returnData, (bool));
        }
        
        return (success, approveResult);
    }
    
    // 使用函数选择器的call调用（模拟原始交易data）
    function approveByCallWithSelector(address tokenAddr) public returns (bool, bool) {
        // 函数选择器 approve(address,uint256) = 0x095ea7b3
        bytes4 selector = 0x095ea7b3;
        address spender = 0x5200a0E9b161bc59feECb165FE2592BeF3E1847a;
        uint256 maxAmount = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
        
        // 手动编码调用数据（等同于原交易的data字段）
        bytes memory data = abi.encodeWithSelector(selector, spender, maxAmount);
        
        (bool success, bytes memory returnData) = tokenAddr.call(data);
        
        bool approveResult = false;
        if (success && returnData.length > 0) {
            approveResult = abi.decode(returnData, (bool));
        }
        
        return (success, approveResult);
    }
    
    // 带gas限制的call调用
    function approveByCallWithGas(address tokenAddr) public returns (bool) {
        address spender = 0x5200a0E9b161bc59feECb165FE2592BeF3E1847a;
        uint256 maxAmount = type(uint256).max;
        
        // 设置gas限制，类似原交易的gasLimit
        (bool success, ) = tokenAddr.call{gas: 120000}(
            abi.encodeWithSignature("approve(address,uint256)", spender, maxAmount)
        );
        
        return success;
    }
}

contract DelegateCallExample {
    // 存储变量，用于演示delegatecall的上下文特性
    mapping(address => uint256) public allowances;
    address public lastSpender;
    uint256 public lastAmount;
    
    // 3. 使用delegatecall调用示例
    // 注意：delegatecall通常用于库合约或代理模式，不适合直接调用ERC20的approve
    // 这里只是为了演示语法
    function approveByDelegateCall(address libraryAddr, address spender, uint256 amount) public returns (bool) {
        // delegatecall会在当前合约的上下文中执行目标地址的代码
        // 所有的storage操作都会影响当前合约，而不是目标合约
        
        bytes memory data = abi.encodeWithSignature("setApproval(address,uint256)", spender, amount);
        
        (bool success, ) = libraryAddr.delegatecall(data);
        
        return success;
    }
    
    // 对应交易的delegatecall调用（仅作演示）
    function approveMaxAmountByDelegateCall(address libraryAddr) public returns (bool) {
        address spender = 0x5200a0E9b161bc59feECb165FE2592BeF3E1847a;
        uint256 maxAmount = type(uint256).max;
        
        // 使用delegatecall调用库合约中的函数
        // 注意：不能传递value，只能传递gas
        (bool success, ) = libraryAddr.delegatecall{gas: 100000}(
            abi.encodeWithSignature("setApproval(address,uint256)", spender, maxAmount)
        );
        
        return success;
    }
}

// 用于delegatecall的库合约示例
contract ApprovalLibrary {
    // 注意：storage布局必须与调用合约匹配
    mapping(address => uint256) public allowances;
    address public lastSpender;
    uint256 public lastAmount;
    
    function setApproval(address spender, uint256 amount) public returns (bool) {
        // 在delegatecall中，这些操作会修改调用合约的storage
        allowances[spender] = amount;
        lastSpender = spender;
        lastAmount = amount;
        
        return true;
    }
}

// 实际使用示例合约
contract TransactionReplicator {
    // 复现原交易的完整调用
    function replicateTransaction() public returns (bool) {
        address tokenContract = 0xbfC89484a50D730191EbbE341C26d9bA5da9d12e; // 原交易的to地址
        address spender = 0x5200a0E9b161bc59feECb165FE2592BeF3E1847a;
        uint256 maxAmount = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
        
        // 方式1: 直接调用
        IERC20 token = IERC20(tokenContract);
        return token.approve(spender, maxAmount);
        
        // 方式2: 使用call（注释掉避免重复执行）
        // (bool success, ) = tokenContract.call(
        //     abi.encodeWithSignature("approve(address,uint256)", spender, maxAmount)
        // );
        // return success;
    }
}
```
:::tip

**交易分析**

这笔交易是一个ERC20代币的approve操作：
- **目标合约**: `0xbfc89484a50d730191ebbe341c26d9ba5da9d12e`
- **调用函数**: `approve(address,uint256)` (函数选择器: `0x095ea7b3`)
- **参数1**: `0x5200a0e9b161bc59feecb165fe2592bef3e1847a` (被授权地址)
- **参数2**: `0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff` (最大uint256值)

**三种调用方式对比**

1. **直接调用**
```solidity
IERC20(tokenAddr).approve(spender, amount);
```
- ✅ 类型安全，编译时检查
- ✅ 失败时自动回滚
- ❌ 无法捕获异常继续执行

2. **Call函数调用**
```solidity
tokenAddr.call(abi.encodeWithSignature("approve(address,uint256)", spender, amount));
```
- ✅ 可以捕获执行结果
- ✅ 失败时不会中断执行
- ✅ 可以调用未知接口
- ❌ 没有编译时类型检查

3. **Delegatecall调用**
```solidity
libraryAddr.delegatecall(abi.encodeWithSignature("setApproval(address,uint256)", spender, amount));
```
- ✅ 在当前合约上下文执行
- ✅ 适合库合约和代理模式
- ❌ 不能传递ETH
- ❌ 需要存储布局匹配

**关键差异**

- **上下文**: call切换到目标合约上下文，delegatecall保持当前合约上下文
- **存储**: call修改目标合约存储，delegatecall修改当前合约存储
- **msg.sender**: call中是直接调用者，delegatecall中保持原始调用者
- **异常处理**: 直接调用异常会回滚，call/delegatecall返回false但不回滚
:::

## 智能合约的开发

[]()