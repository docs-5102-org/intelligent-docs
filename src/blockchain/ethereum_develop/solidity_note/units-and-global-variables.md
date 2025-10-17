---
title: Solidity 课堂笔记补充 - 单位和全局可用变量
category:
  - 区块链
  - 以太坊
  - Solidity
---

# Solidity 课堂笔记补充 - 单位和全局可用变量

- [Solidity官网-单位和全局可用变量](https://docs.soliditylang.org/zh-cn/latest/units-and-global-variables.html#index-0)

## 以太坊（Ether） 单位

### 基本单位转换
```solidity
// 以太币单位层次结构（从小到大）
1 wei = 1                    // 最小单位
1 gwei = 1,000,000,000 wei  // 1e9 wei，常用于gas price
1 ether = 1,000,000,000,000,000,000 wei  // 1e18 wei，标准以太币单位
```

### 实际应用示例
```solidity
// 直接使用单位后缀
uint256 smallAmount = 100 wei;
uint256 gasPrice = 20 gwei;  // 20 Gwei，常见gas价格
uint256 balance = 1.5 ether; // 1.5 ETH

// 单位验证
assert(1 wei == 1);
assert(1 gwei == 1e9);
assert(1 ether == 1e18);


// 推荐：使用明确的单位
uint256 minimumDeposit = 0.1 ether;
uint256 gasLimit = 21000;
uint256 maxGasPrice = 100 gwei;
```

### 已废弃的单位
- `finney` (0.7.0版本删除)
- `szabo` (0.7.0版本删除)

### 注意事项

- 单位后缀只是**乘以10的幂次方**
- 编译时会自动转换为基本单位（wei/seconds）

## 时间单位

### 基本时间转换
```solidity
1 seconds = 1              // 基本单位（秒）
1 minutes = 60 seconds     // 1分钟 = 60秒
1 hours = 60 minutes       // 1小时 = 60分钟
1 days = 24 hours          // 1天 = 24小时
1 weeks = 7 days           // 1周 = 7天
```

### 实际应用示例
```solidity
// 时间锁定示例
uint256 lockPeriod = 30 days;
uint256 votingPeriod = 1 weeks;
uint256 gracePeriod = 2 hours;

// 时间计算函数
function f(uint start, uint daysAfter) public {
    if (block.timestamp >= start + daysAfter * 1 days) {
        // 执行逻辑
    }
}

// 推荐：使用明确的时间单位
uint256 stakingPeriod = 90 days;
uint256 cooldownTime = 24 hours;
uint256 votingDeadline = block.timestamp + 7 days;
```

### 注意事项

#### 1. 变量使用限制
```solidity
// ❌ 错误：不能直接在变量上使用单位后缀
uint256 timeUnit = days;  // 编译错误

// ✅ 正确：使用乘法运算
uint256 period = 5 * 1 days;  // 5天的秒数
```

#### 2. 日历计算的局限性
- 闰秒导致的时间不准确性
- 不是每年都是365天
- 不是每天都是24小时
- 需要外部预言机进行精确时间校正

#### 3. 已废弃的单位
- `years` (0.5.0版本删除，因为闰年问题)


## 错误处理

示例

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ErrorHandlingExamples {
    uint256 public balance;
    address public owner;
    mapping(address => uint256) public balances;
    bool private locked;
    
    constructor() {
        owner = msg.sender;
        balance = 1000;
    }
    
    // ========== require() 示例 ==========
    // 用于验证输入参数和外部条件
    
    function withdraw(uint256 amount) public {
        // 验证输入参数
        require(amount > 0, "Amount must be greater than zero");
        
        // 验证余额是否足够
        require(balance >= amount, "Insufficient balance");
        
        // 验证调用者权限
        require(msg.sender == owner, "Only owner can withdraw");
        
        balance -= amount;
        payable(msg.sender).transfer(amount);
    }
    
    function transfer(address to, uint256 amount) public {
        // 验证接收地址
        require(to != address(0), "Cannot transfer to zero address");
        require(to != msg.sender, "Cannot transfer to yourself");
        
        // 验证转账金额
        require(amount > 0 && amount <= balances[msg.sender], "Invalid amount");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
    
    function setOwner(address newOwner) public {
        require(msg.sender == owner, "Only current owner can set new owner");
        require(newOwner != address(0), "New owner cannot be zero address");
        
        owner = newOwner;
    }
    
    // ========== assert() 示例 ==========
    // 用于检查内部逻辑错误，理论上永远不应该失败
    
    function internalCalculation(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 result = a + b;
        
        // 检查溢出（虽然Solidity 0.8+已内置溢出检查）
        assert(result >= a);
        assert(result >= b);
        
        return result;
    }
    
    function updateBalance(uint256 newBalance) internal {
        uint256 oldBalance = balance;
        balance = newBalance;
        
        // 确保内部状态一致性
        assert(balance == newBalance);
        
        // 检查余额变化的逻辑合理性
        if (newBalance > oldBalance) {
            assert(newBalance - oldBalance <= 1000); // 单次增加不超过1000
        }
    }
    
    // ========== revert() 示例 ==========
    // 用于复杂的条件检查和自定义错误处理
    
    function complexOperation(uint256 value, bool flag) public {
        if (locked) {
            revert("Contract is locked");
        }
        
        if (value == 0) {
            revert("Value cannot be zero");
        }
        
        if (!flag && value > 100) {
            revert("When flag is false, value must not exceed 100");
        }
        
        // 执行操作
        balance += value;
    }
    
    function processPayment(uint256 amount, address recipient) public payable {
        // 复杂的业务逻辑检查
        if (msg.value != amount) {
            revert("Sent value does not match specified amount");
        }
        
        if (amount < 10) {
            revert("Minimum payment amount is 10 wei");
        }
        
        if (recipient == address(0)) {
            revert("Invalid recipient address");
        }
        
        // 处理支付
        balances[recipient] += amount;
    }
    
    // ========== 重入保护示例（使用多种错误处理） ==========
    modifier nonReentrant() {
        require(!locked, "Reentrant call detected");
        locked = true;
        _;
        locked = false;
    }
    
    function secureWithdraw(uint256 amount) public nonReentrant {
        require(msg.sender == owner, "Unauthorized");
        require(amount > 0, "Invalid amount");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        // 内部状态检查
        assert(locked == true); // 应该在modifier中被设置
        
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) {
            revert("Transfer failed");
        }
    }
    
    // ========== 综合示例 ==========
    function comprehensiveExample(uint256 x, uint256 y) public view returns (uint256) {
        // require: 验证输入参数
        require(x > 0, "X must be positive");
        require(y > 0, "Y must be positive");
        require(x <= 1000 && y <= 1000, "Values too large");
        
        // 执行计算
        uint256 product = x * y;
        
        // assert: 检查内部逻辑
        assert(product >= x); // 乘积应该大于等于任一因数
        assert(product >= y);
        
        // 复杂条件检查
        if (product > 500000) {
            revert("Result exceeds maximum allowed value");
        }
        
        return product;
    }
    
    // ========== 错误处理最佳实践示例 ==========
    
    // 使用自定义错误（Solidity 0.8.4+）
    error InsufficientFunds(uint256 requested, uint256 available);
    error Unauthorized(address caller);
    error InvalidAddress(address addr);
    
    function modernErrorHandling(address to, uint256 amount) public {
        if (msg.sender != owner) {
            revert Unauthorized(msg.sender);
        }
        
        if (to == address(0)) {
            revert InvalidAddress(to);
        }
        
        if (balance < amount) {
            revert InsufficientFunds(amount, balance);
        }
        
        balance -= amount;
        balances[to] += amount;
    }
    
    // 接收以太币
    receive() external payable {
        require(msg.value > 0, "Must send some ether");
    }
    
    // 获取合约余额
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
```

### 关键区别和使用场景：

**1. require() - 用于输入验证和外部条件检查**
- 验证函数参数
- 检查调用者权限
- 验证外部状态条件
- 提供用户友好的错误消息

**2. assert() - 用于内部逻辑检查**
- 检查不应该发生的情况
- 验证内部状态一致性
- 检查代码逻辑错误
- 通常不应该在正常情况下失败

**3. revert() - 用于复杂错误处理**
- 复杂的条件判断
- 自定义错误逻辑
- 可以提供详细的错误信息
- 灵活的错误处理流程

### 最佳实践提示：

1. **优先使用require()** - 大多数输入验证场景
2. **谨慎使用assert()** - 仅用于检查内部逻辑错误
3. **revert()适合复杂场景** - 需要复杂判断逻辑时使用
4. **使用自定义错误** - Solidity 0.8.4+支持，更节省gas
5. **提供清晰错误消息** - 帮助用户理解失败原因

这些错误处理机制都会回滚状态变化，确保合约状态的一致性和安全性。

## 数学和密码学函数

下面展示了一个全面的Solidity数学和密码学函数示例合约，展示了各个函数的实际应用场景：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoMathExamples {
    
    // ========== 数学函数示例 ==========
    
    // addmod 示例 - 防溢出的模加法
    function safeModularAddition(uint256 x, uint256 y, uint256 modulus) 
        public 
        pure 
        returns (uint256) 
    {
        require(modulus != 0, "Modulus cannot be zero");
        
        // 即使 x + y 超过 2^256，也能正确计算
        return addmod(x, y, modulus);
    }
    
    // 实际应用：计算大数加法的余数
    function largeNumberAddition() public pure returns (uint256) {
        uint256 largeNum1 = type(uint256).max - 100; // 接近最大值
        uint256 largeNum2 = 200;
        uint256 modulus = 1000;
        
        // 如果直接相加会溢出，但使用addmod可以正确计算
        return addmod(largeNum1, largeNum2, modulus); // 结果是 100
    }
    
    // mulmod 示例 - 防溢出的模乘法
    function safeModularMultiplication(uint256 x, uint256 y, uint256 modulus) 
        public 
        pure 
        returns (uint256) 
    {
        require(modulus != 0, "Modulus cannot be zero");
        
        // 即使 x * y 超过 2^256，也能正确计算
        return mulmod(x, y, modulus);
    }
    
    // 实际应用：RSA相关计算
    function rsaStyleCalculation(uint256 base, uint256 exponent, uint256 modulus) 
        public 
        pure 
        returns (uint256) 
    {
        require(modulus != 0, "Modulus cannot be zero");
        require(exponent > 0, "Exponent must be positive");
        
        uint256 result = 1;
        base = base % modulus;
        
        while (exponent > 0) {
            if (exponent % 2 == 1) {
                result = mulmod(result, base, modulus);
            }
            exponent = exponent >> 1;
            base = mulmod(base, base, modulus);
        }
        
        return result;
    }
    
    // ========== 哈希函数示例 ==========
    
    // keccak256 示例 - 最常用的哈希函数
    function hashString(string memory input) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(input));
    }
    
    function hashMultipleInputs(
        string memory str, 
        uint256 num, 
        address addr
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(str, num, addr));
    }
    
    // 用于生成唯一ID
    function generateUniqueId(address user, uint256 nonce) 
        public 
        pure 
        returns (bytes32) 
    {
        return keccak256(abi.encodePacked(user, nonce, block.timestamp));
    }
    
    // sha256 示例
    function sha256Hash(bytes memory input) public pure returns (bytes32) {
        return sha256(input);
    }
    
    // 比较不同哈希函数的结果
    function compareHashes(string memory input) 
        public 
        pure 
        returns (bytes32 keccakResult, bytes32 sha256Result) 
    {
        bytes memory encoded = abi.encodePacked(input);
        keccakResult = keccak256(encoded);
        sha256Result = sha256(encoded);
    }
    
    // ripemd160 示例（比特币中使用）
    function ripemdHash(bytes memory input) public pure returns (bytes20) {
        return ripemd160(input);
    }
    
    // ========== 数字签名验证示例 ==========
    
    // 简单的消息签名验证
    function verifySignature(
        string memory message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public pure returns (address) {
        // 创建消息哈希
        bytes32 messageHash = keccak256(abi.encodePacked(message));
        
        // 添加以太坊消息前缀
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        // 恢复签名者地址
        return ecrecover(ethSignedMessageHash, v, r, s);
    }
    
    // 更复杂的签名验证（带有nonce防重放攻击）
    function verifySignatureWithNonce(
        address signer,
        string memory message,
        uint256 nonce,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public pure returns (bool) {
        // 创建包含nonce的消息哈希
        bytes32 messageHash = keccak256(abi.encodePacked(message, nonce));
        
        // 添加以太坊消息前缀
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        // 恢复签名者地址并验证
        address recoveredSigner = ecrecover(ethSignedMessageHash, v, r, s);
        return recoveredSigner == signer && recoveredSigner != address(0);
    }
    
    // ========== 实际应用示例 ==========
    
    // 默克尔证明验证
    function verifyMerkleProof(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf,
        uint256 index
    ) public pure returns (bool) {
        bytes32 hash = leaf;
        
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (index % 2 == 0) {
                hash = keccak256(abi.encodePacked(hash, proofElement));
            } else {
                hash = keccak256(abi.encodePacked(proofElement, hash));
            }
            index = index / 2;
        }
        
        return hash == root;
    }
    
    // 承诺揭示方案（Commit-Reveal Scheme）
    mapping(address => bytes32) public commitments;
    mapping(address => bool) public revealed;
    
    function commitValue(bytes32 commitment) public {
        commitments[msg.sender] = commitment;
        revealed[msg.sender] = false;
    }
    
    function revealValue(uint256 value, uint256 nonce) public returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(value, nonce, msg.sender));
        
        require(commitments[msg.sender] == hash, "Invalid reveal");
        require(!revealed[msg.sender], "Already revealed");
        
        revealed[msg.sender] = true;
        return true;
    }
    
    // 生成承诺的辅助函数
    function generateCommitment(uint256 value, uint256 nonce, address user) 
        public 
        pure 
        returns (bytes32) 
    {
        return keccak256(abi.encodePacked(value, nonce, user));
    }
    
    // ========== 数字签名工具函数 ==========
    
    // 获取消息的以太坊签名哈希
    function getEthSignedMessageHash(bytes32 messageHash) 
        public 
        pure 
        returns (bytes32) 
    {
        return keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
    }
    
    // 分离签名数据
    function splitSignature(bytes memory signature) 
        public 
        pure 
        returns (bytes32 r, bytes32 s, uint8 v) 
    {
        require(signature.length == 65, "Invalid signature length");
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
    }
    
    // ========== 随机数生成（伪随机）==========
    
    // 注意：这种方法生成的随机数在区块链上是可预测的，仅用于演示
    function generatePseudoRandom(uint256 seed) public view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.difficulty,
                    msg.sender,
                    seed
                )
            )
        );
    }
    
    // 更安全的随机数生成（结合多个源）
    function generateSecureRandom(
        uint256 userSeed,
        string memory userInput
    ) public view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.difficulty,
                    block.number,
                    msg.sender,
                    tx.origin,
                    userSeed,
                    userInput
                )
            )
        );
    }
    
    // ========== 实用工具函数 ==========
    
    // 验证两个哈希是否相等
    function compareHashes(bytes32 hash1, bytes32 hash2) 
        public 
        pure 
        returns (bool) 
    {
        return hash1 == hash2;
    }
    
    // 创建数据的指纹
    function createFingerprint(
        string memory data1,
        string memory data2,
        uint256 timestamp
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(data1, data2, timestamp));
    }
    
    // 检查地址是否为有效恢复结果
    function isValidRecoveredAddress(address recovered) 
        public 
        pure 
        returns (bool) 
    {
        return recovered != address(0);
    }
}
```

### 主要功能分类：

#### 1. **数学函数 (addmod, mulmod)**
- **防溢出计算**：处理超大数运算
- **模运算**：密码学和数学计算中的重要操作
- **RSA样式计算**：展示实际密码学应用

#### 2. **哈希函数**
- **keccak256**：最常用，用于生成唯一ID、验证数据完整性
- **sha256**：标准SHA-256哈希
- **ripemd160**：比特币网络中使用的哈希算法

#### 3. **数字签名 (ecrecover)**
- **消息验证**：验证消息的真实性
- **身份认证**：确认签名者身份
- **防重放攻击**：使用nonce防止重复攻击

#### 4. **实际应用场景**
- **默克尔证明**：用于扩容和数据验证
- **承诺揭示方案**：用于公平的游戏和投票
- **随机数生成**：虽然不是真正随机，但可用于某些场景

### 关键注意事项：

1. **安全考虑**：`ecrecover`可能返回`address(0)`，需要验证
2. **Gas优化**：这些函数消耗的gas相对较高
3. **随机性**：区块链上的"随机"数是可预测的
4. **签名格式**：需要正确处理以太坊消息前缀

这些函数是Solidity中处理密码学操作的核心工具，广泛应用于DeFi、NFT、游戏等各种去中心化应用中。


## 地址类型的成员

### 地址属性成员

| 成员                 | 返回类型       | 描述             | 用途               |
| -------------------- | -------------- | ---------------- | ------------------ |
| `<address>.balance`  | `uint256`      | 地址的Wei余额    | 查询账户余额       |
| `<address>.code`     | `bytes memory` | 地址处的合约代码 | 获取合约字节码     |
| `<address>.codehash` | `bytes32`      | 地址代码的哈希值 | 验证合约代码完整性 |

### 转账方法成员

| 成员                                  | 返回类型 | Gas限制          | 失败处理              | 安全性 | 推荐使用       |
| ------------------------------------- | -------- | ---------------- | --------------------- | ------ | -------------- |
| `<address payable>.transfer(uint256)` | 无       | 2300 gas（固定） | 抛出异常，自动回滚    | **高** | ✅ 推荐日常转账 |
| `<address payable>.send(uint256)`     | `bool`   | 2300 gas（固定） | 返回false，需手动检查 | **中** | ⚠️ 需检查返回值 |

### 低级调用方法成员

| 成员                            | 返回类型        | Gas限制                   | 特点                     | 安全性   | 使用场景             |
| ------------------------------- | --------------- | ------------------------- | ------------------------ | -------- | -------------------- |
| `<address>.call(bytes)`         | `(bool, bytes)` | 可调节（发送所有可用gas） | 普通函数调用，可修改状态 | **低**   | 动态调用、跨合约调用 |
| `<address>.delegatecall(bytes)` | `(bool, bytes)` | 可调节（发送所有可用gas） | 在调用者上下文执行       | **极低** | 代理模式、库调用     |
| `<address>.staticcall(bytes)`   | `(bool, bytes)` | 可调节（发送所有可用gas） | 只读调用，不可修改状态   | **中**   | 查询操作、视图函数   |

### 安全警告对比

| 方法类型           | 主要风险                                                    | 安全建议                                                 |
| ------------------ | ----------------------------------------------------------- | -------------------------------------------------------- |
| **transfer()**     | • 2300 gas限制可能不足                                      | • 最安全的转账方式<br>• 自动回滚保护                     |
| **send()**         | • 需要手动检查返回值<br>• 调用栈深度攻击<br>• 接收者gas不足 | • 始终检查返回值<br>• 考虑使用提取模式                   |
| **call()**         | • 绕过类型检查<br>• 重入攻击风险<br>• 无函数存在性检查      | • 避免直接使用<br>• 使用重入保护<br>• 验证调用结果       |
| **delegatecall()** | • 存储布局必须一致<br>• 上下文混乱<br>• 极高安全风险        | • 仅用于代理模式<br>• 确保存储布局匹配<br>• 严格访问控制 |
| **staticcall()**   | • 相对安全（只读）                                          | • 用于查询操作<br>• 不会修改状态                         |

### 版本变更历史

| 版本          | 变更内容                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| **0.5.0之前** | • 允许合约实例访问地址成员（如`this.balance`）<br>• 低级调用只返回成功状态，不返回数据<br>• 存在`callcode`成员 |
| **0.5.0**     | • 必须显式转换为地址（如`address(this).balance`）<br>• 低级调用返回成功状态和数据<br>• 移除`callcode`成员      |
| **当前版本**  | • 增加`extcodesize`检查确保合约存在<br>• 低级调用不包括此检查（更便宜但不安全）                                |

### 最佳实践建议

#### 转账操作
```solidity
// ✅ 推荐：使用transfer（最安全）
payable(recipient).transfer(amount);

// ⚠️ 谨慎使用：send（需检查返回值）
if (!payable(recipient).send(amount)) {
    // 处理失败情况
    revert("Transfer failed");
}

// ✅ 现代推荐：使用call（更灵活）
(bool success, ) = payable(recipient).call{value: amount}("");
require(success, "Transfer failed");
```

#### 查询操作
```solidity
// 查询余额
uint256 balance = address(this).balance;

// 检查是否为合约
bool isContract = target.code.length > 0;

// 获取代码哈希
bytes32 hash = target.codehash;
```

#### 低级调用（谨慎使用）
```solidity
// staticcall用于只读操作
(bool success, bytes memory data) = target.staticcall(
    abi.encodeWithSignature("getData()")
);

// delegatecall用于代理模式（需要专业知识）
(bool success, bytes memory data) = implementation.delegatecall(
    abi.encodeWithSignature("function()")
);
```

## 合约相关

### 合约相关成员对比表

| 成员 | 类型 | 描述 | 用途 | 安全性 | 状态 |
|------|------|------|------|--------|------|
| `this` | 当前合约类型 | 当前合约实例的引用 | 获取合约地址、余额、调用自身 | **安全** | ✅ 正常使用 |
| `super` | 父合约类型 | 继承层次中上一级合约 | 调用父合约函数、多重继承 | **安全** | ✅ 正常使用 |
| `selfdestruct(address payable)` | 函数 | 销毁合约并转移资金 | 合约生命周期管理、资金回收 | **高风险** | ⚠️ 已废弃 |

### selfdestruct 特殊性对比表

| 特性 | 行为 | 说明 |
|------|------|------|
| **接收函数执行** | ❌ 不执行 | 接收合约的receive/fallback不会被调用 |
| **销毁时机** | 交易结束时 | 不是立即销毁，而是交易完成后 |
| **可撤销性** | ✅ 可撤销 | revert可以恢复销毁操作 |
| **函数调用** | ✅ 仍可调用 | 销毁前合约函数依然可用 |
| **版本警告** | ⚠️ 0.8.18+ | 触发废弃警告，行为将改变 |

### 版本变更历史

| 版本 | 变更内容 |
|------|----------|
| **0.5.0之前** | • 存在`suicide`函数（与selfdestruct相同） |
| **0.5.0** | • 移除`suicide`函数<br>• 统一使用`selfdestruct` |
| **0.8.18+** | • `selfdestruct`触发废弃警告<br>• 未来行为将根据EIP-6049改变 |

---

### 1. this 关键字示例

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ThisExamples {
    uint256 public balance;
    
    // 获取合约地址
    function getContractAddress() public view returns (address) {
        return address(this);
    }
    
    // 获取合约余额
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    // 合约自调用
    function selfCall() public {
        // 直接调用自身函数
        this.publicFunction();
        
        // 通过地址调用（低级调用）
        (bool success, ) = address(this).call(
            abi.encodeWithSignature("publicFunction()")
        );
        require(success, "Self call failed");
    }
    
    function publicFunction() public pure returns (string memory) {
        return "Called successfully";
    }
    
    // 检查是否为合约
    function isContract(address account) public view returns (bool) {
        return account.code.length > 0;
    }
    
    // 比较地址
    function isSameContract(address other) public view returns (bool) {
        return address(this) == other;
    }
    
    // 接收以太币
    receive() external payable {}
}
```

### 2. super 关键字示例

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 基础合约
contract Animal {
    string public species;
    
    constructor(string memory _species) {
        species = _species;
    }
    
    function makeSound() public virtual returns (string memory) {
        return "Some animal sound";
    }
    
    function move() public virtual returns (string memory) {
        return "Animal moves";
    }
}

// 中间继承合约
contract Mammal is Animal {
    constructor(string memory _species) Animal(_species) {}
    
    function makeSound() public virtual override returns (string memory) {
        return "Mammal sound";
    }
    
    function breathe() public virtual returns (string memory) {
        return "Breathes air";
    }
}

// 最终继承合约
contract Dog is Mammal {
    string public name;
    
    constructor(string memory _name) Mammal("Canine") {
        name = _name;
    }
    
    // 重写并调用父合约方法
    function makeSound() public override returns (string memory) {
        // 调用直接父合约的方法
        string memory parentSound = super.makeSound();
        return string(abi.encodePacked(parentSound, " - Woof!"));
    }
    
    // 调用祖父合约的方法
    function makeOriginalSound() public returns (string memory) {
        // 通过super逐级调用
        return super.makeSound();
    }
    
    // 组合调用多个父合约方法
    function introduce() public returns (string memory) {
        return string(abi.encodePacked(
            "I am ", name, ", species: ", species, 
            ", I ", super.breathe(), " and ", super.move()
        ));
    }
}

// 多重继承示例
contract Pet {
    function play() public virtual returns (string memory) {
        return "Playing with owner";
    }
}

contract FamilyDog is Dog, Pet {
    constructor(string memory _name) Dog(_name) {}
    
    // 重写多个父合约的方法
    function play() public override returns (string memory) {
        return string(abi.encodePacked(super.play(), " happily"));
    }
    
    // 综合调用所有父合约功能
    function fullIntroduction() public returns (string memory) {
        return string(abi.encodePacked(
            super.introduce(), " and I ", super.play()
        ));
    }
}
```

### 3. selfdestruct 示例（已废弃，仅供理解）

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 警告：selfdestruct已在0.8.18+版本中废弃
contract SelfDestructExample {
    address public owner;
    uint256 public creationTime;
    mapping(address => uint256) public balances;
    
    event ContractCreated(address indexed owner, uint256 timestamp);
    event FundsDeposited(address indexed user, uint256 amount);
    event ContractDestroyed(address indexed owner, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        creationTime = block.timestamp;
        emit ContractCreated(owner, creationTime);
    }
    
    // 接收资金
    function deposit() public payable {
        require(msg.value > 0, "Must send some ether");
        balances[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    // 提取资金
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
    
    // 获取合约信息
    function getContractInfo() public view returns (
        address contractAddress,
        uint256 contractBalance,
        uint256 age
    ) {
        return (
            address(this),
            address(this).balance,
            block.timestamp - creationTime
        );
    }
    
    // ⚠️ 已废弃：销毁合约（仅演示用途）
    function destroyContract() public onlyOwner {
        emit ContractDestroyed(owner, block.timestamp);
        
        // 在销毁前仍可调用函数
        uint256 finalBalance = address(this).balance;
        
        // 销毁合约并将剩余资金发送给owner
        // 注意：这在0.8.18+版本会产生废弃警告
        selfdestruct(payable(owner));
        
        // 这行代码永远不会执行
        // require(false, "This should never execute");
    }
    
    // 演示销毁的特殊性
    function demonstrateDestructSpecialities() public onlyOwner {
        // 1. 函数在selfdestruct后仍可调用
        if (block.timestamp % 2 == 0) {
            selfdestruct(payable(owner));
        }
        
        // 2. 如果有revert，销毁会被撤销
        if (address(this).balance < 1 ether) {
            revert("Not enough balance to destroy");
        }
    }
    
    // 现代替代方案：禁用合约
    bool public isActive = true;
    
    modifier whenActive() {
        require(isActive, "Contract is disabled");
        _;
    }
    
    function disableContract() public onlyOwner {
        isActive = false;
        // 转移所有资金给owner
        payable(owner).transfer(address(this).balance);
    }
    
    // 接收以太币
    receive() external payable whenActive {
        balances[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }
}
```

### 最佳实践建议

#### 1. this 使用建议
```solidity
// ✅ 推荐：获取合约地址和余额
address contractAddr = address(this);
uint256 balance = address(this).balance;

// ⚠️ 谨慎：自调用可能导致无限递归
// 确保有退出条件
```

#### 2. super 使用建议
```solidity
// ✅ 推荐：明确调用父合约功能
function override_function() public override {
    // 先执行父合约逻辑
    super.override_function();
    // 再执行子合约逻辑
    // additional logic
}
```

#### 3. selfdestruct 替代方案
```solidity
// ❌ 不推荐：使用selfdestruct（已废弃）
// selfdestruct(payable(owner));

// ✅ 推荐：使用禁用模式
bool public isActive = true;

function disableContract() external onlyOwner {
    isActive = false;
    // 转移资金
    payable(owner).transfer(address(this).balance);
}

modifier whenActive() {
    require(isActive, "Contract disabled");
    _;
}
```

### 安全注意事项

1. **this**: 避免不必要的自调用，防止递归
2. **super**: 确保理解继承链，避免意外调用
3. **selfdestruct**: 已废弃，使用禁用模式替代
4. **版本兼容**: 注意不同Solidity版本的行为差异

## 类型信息

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// ========== 合约类型信息示例 ==========

contract SimpleContract {
    uint256 public value;
    
    constructor(uint256 _value) {
        value = _value;
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
}

contract ContractWithConstructor {
    string public name;
    uint256 public id;
    
    constructor(string memory _name, uint256 _id) {
        name = _name;
        id = _id;
    }
}

// ========== 接口示例 ==========

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface ICustomInterface {
    function customFunction(uint256 param) external returns (bool);
    function anotherFunction(string memory data) external view returns (bytes32);
}

// ========== 类型信息演示合约 ==========

contract TypeInfoExamples {
    
    // ========== 合约类型信息 ==========
    
    // 获取合约名称
    function getContractName() public pure returns (string memory) {
        return type(SimpleContract).name; // 返回 "SimpleContract"
    }
    
    // 获取多个合约的名称
    function getMultipleContractNames() public pure returns (
        string memory simple,
        string memory withConstructor,
        string memory current
    ) {
        simple = type(SimpleContract).name;
        withConstructor = type(ContractWithConstructor).name;
        current = type(TypeInfoExamples).name;
    }
    
    // ========== 字节码信息 ==========
    
    // 获取创建字节码（Creation Code）
    function getCreationCode() public pure returns (bytes memory) {
        // 注意：不能在合约本身中访问自己的creationCode
        return type(SimpleContract).creationCode;
    }
    
    // 获取运行时字节码（Runtime Code）
    function getRuntimeCode() public pure returns (bytes memory) {
        return type(SimpleContract).runtimeCode;
    }
    
    // 比较不同合约的字节码大小
    function compareBytecodeSizes() public pure returns (
        uint256 simpleCreationSize,
        uint256 simpleRuntimeSize,
        uint256 complexCreationSize,
        uint256 complexRuntimeSize
    ) {
        simpleCreationSize = type(SimpleContract).creationCode.length;
        simpleRuntimeSize = type(SimpleContract).runtimeCode.length;
        complexCreationSize = type(ContractWithConstructor).creationCode.length;
        complexRuntimeSize = type(ContractWithConstructor).runtimeCode.length;
    }
    
    // ========== 使用CREATE2部署合约 ==========
    
    event ContractDeployed(address indexed deployedAddress, bytes32 salt);
    
    // 使用CREATE2操作码部署合约
    function deployWithCreate2(
        uint256 _value,
        bytes32 salt
    ) public returns (address) {
        // 获取创建字节码
        bytes memory creationCode = type(SimpleContract).creationCode;
        
        // 编码构造函数参数
        bytes memory bytecode = abi.encodePacked(
            creationCode,
            abi.encode(_value)
        );
        
        address deployedAddress;
        
        assembly {
            deployedAddress := create2(
                0,                    // value (0 ETH)
                add(bytecode, 0x20),  // bytecode start
                mload(bytecode),      // bytecode length
                salt                  // salt
            )
        }
        
        require(deployedAddress != address(0), "Deployment failed");
        
        emit ContractDeployed(deployedAddress, salt);
        return deployedAddress;
    }
    
    // 预计算CREATE2地址
    function computeCreate2Address(
        bytes32 salt,
        uint256 _value
    ) public view returns (address) {
        bytes memory creationCode = type(SimpleContract).creationCode;
        bytes memory bytecode = abi.encodePacked(
            creationCode,
            abi.encode(_value)
        );
        
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );
        
        return address(uint160(uint256(hash)));
    }
    
    // ========== 接口ID信息 ==========
    
    // 获取接口ID (EIP-165)
    function getInterfaceIds() public pure returns (
        bytes4 erc20Id,
        bytes4 customId
    ) {
        erc20Id = type(IERC20).interfaceId;
        customId = type(ICustomInterface).interfaceId;
    }
    
    // 验证合约是否支持接口
    function supportsInterface(
        address contractAddress,
        bytes4 interfaceId
    ) public view returns (bool) {
        // 调用EIP-165标准的supportsInterface函数
        try IERC165(contractAddress).supportsInterface(interfaceId) returns (bool supported) {
            return supported;
        } catch {
            return false;
        }
    }
    
    // 检查合约是否为ERC20
    function isERC20Contract(address contractAddress) public view returns (bool) {
        bytes4 erc20InterfaceId = type(IERC20).interfaceId;
        return supportsInterface(contractAddress, erc20InterfaceId);
    }
    
    // ========== 整数类型信息 ==========
    
    // 获取整数类型的最小值和最大值
    function getIntegerBounds() public pure returns (
        uint8 uint8Min, uint8 uint8Max,
        int8 int8Min, int8 int8Max,
        uint256 uint256Min, uint256 uint256Max,
        int256 int256Min, int256 int256Max
    ) {
        // uint8 范围
        uint8Min = type(uint8).min;   // 0
        uint8Max = type(uint8).max;   // 255
        
        // int8 范围
        int8Min = type(int8).min;     // -128
        int8Max = type(int8).max;     // 127
        
        // uint256 范围
        uint256Min = type(uint256).min; // 0
        uint256Max = type(uint256).max; // 2^256 - 1
        
        // int256 范围
        int256Min = type(int256).min;   // -2^255
        int256Max = type(int256).max;   // 2^255 - 1
    }
    
    // 安全数学运算 - 检查溢出
    function safeAdd(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 maxValue = type(uint256).max;
        require(a <= maxValue - b, "Addition overflow");
        return a + b;
    }
    
    // 检查值是否在类型范围内
    function isInRange(int256 value, string memory typeName) 
        public 
        pure 
        returns (bool) 
    {
        if (keccak256(bytes(typeName)) == keccak256(bytes("int8"))) {
            return value >= type(int8).min && value <= type(int8).max;
        } else if (keccak256(bytes(typeName)) == keccak256(bytes("int16"))) {
            return value >= type(int16).min && value <= type(int16).max;
        } else if (keccak256(bytes(typeName)) == keccak256(bytes("int32"))) {
            return value >= type(int32).min && value <= type(int32).max;
        }
        return false;
    }
    
    // 获取所有常用整数类型的范围
    function getAllIntegerRanges() public pure returns (
        string memory result
    ) {
        return string(abi.encodePacked(
            "uint8: ", uint2str(type(uint8).min), " to ", uint2str(type(uint8).max), "\n",
            "int8: ", int2str(type(int8).min), " to ", int2str(type(int8).max), "\n",
            "uint16: ", uint2str(type(uint16).min), " to ", uint2str(type(uint16).max), "\n",
            "int16: ", int2str(type(int16).min), " to ", int2str(type(int16).max)
        ));
    }
    
    // ========== 实际应用示例 ==========
    
    // 合约工厂模式
    mapping(bytes32 => address) public deployedContracts;
    
    function deployContractFactory(
        uint256 _value,
        bytes32 salt
    ) public returns (address) {
        // 检查是否已部署
        address predicted = computeCreate2Address(salt, _value);
        require(deployedContracts[salt] == address(0), "Already deployed");
        
        // 部署合约
        address deployed = deployWithCreate2(_value, salt);
        require(deployed == predicted, "Address mismatch");
        
        // 记录部署
        deployedContracts[salt] = deployed;
        
        return deployed;
    }
    
    // 字节码比较工具
    function compareContracts() public pure returns (bool sameCreation, bool sameRuntime) {
        bytes memory code1 = type(SimpleContract).creationCode;
        bytes memory code2 = type(ContractWithConstructor).creationCode;
        
        bytes memory runtime1 = type(SimpleContract).runtimeCode;
        bytes memory runtime2 = type(ContractWithConstructor).runtimeCode;
        
        sameCreation = keccak256(code1) == keccak256(code2);
        sameRuntime = keccak256(runtime1) == keccak256(runtime2);
    }
    
    // ========== 辅助函数 ==========
    
    // 将uint转换为字符串
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    // 将int转换为字符串
    function int2str(int256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        bool negative = _i < 0;
        uint256 val = uint256(negative ? -_i : _i);
        string memory str = uint2str(val);
        if (negative) {
            return string(abi.encodePacked("-", str));
        }
        return str;
    }
}

// EIP-165 接口
interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// ========== 高级应用示例 ==========

contract AdvancedTypeUsage {
    
    // 使用类型信息进行元编程
    function getContractMetadata(address contractAddr) 
        public 
        view 
        returns (
            bool isContract,
            uint256 codeSize,
            bytes32 codeHash
        ) 
    {
        // 检查是否为合约
        uint256 size;
        assembly {
            size := extcodesize(contractAddr)
        }
        isContract = size > 0;
        codeSize = size;
        
        // 获取代码哈希
        assembly {
            codeHash := extcodehash(contractAddr)
        }
    }
    
    // 动态类型检查
    function validateIntegerInput(
        int256 value,
        uint8 targetBits,
        bool isSigned
    ) public pure returns (bool valid, string memory reason) {
        if (isSigned) {
            if (targetBits == 8) {
                if (value < type(int8).min || value > type(int8).max) {
                    return (false, "Value out of int8 range");
                }
            } else if (targetBits == 16) {
                if (value < type(int16).min || value > type(int16).max) {
                    return (false, "Value out of int16 range");
                }
            } else if (targetBits == 32) {
                if (value < type(int32).min || value > type(int32).max) {
                    return (false, "Value out of int32 range");
                }
            }
        } else {
            // 无符号检查
            if (value < 0) {
                return (false, "Negative value for unsigned type");
            }
            uint256 uvalue = uint256(value);
            if (targetBits == 8 && uvalue > type(uint8).max) {
                return (false, "Value out of uint8 range");
            } else if (targetBits == 16 && uvalue > type(uint16).max) {
                return (false, "Value out of uint16 range");
            } else if (targetBits == 32 && uvalue > type(uint32).max) {
                return (false, "Value out of uint32 range");
            }
        }
        
        return (true, "Valid");
    }
}
```

## 保留关键字

- https://docs.soliditylang.org/zh-cn/latest/units-and-global-variables.html#id15