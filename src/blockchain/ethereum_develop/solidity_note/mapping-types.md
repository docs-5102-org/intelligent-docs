---
title: 映射类型
category:
  - 以太坊
  - Solidity
---

# 映射类型

## 什么是映射类型？

映射类型本质上是一个**哈希表**数据结构，用于建立键值对的关系。你可以把它想象成一个字典，通过键来查找对应的值。

## 基本语法

```solidity
mapping(KeyType => ValueType) variableName;
```

- **KeyType**: 键的类型，只能是基本值类型（如 `uint`、`address`、`bool`、`bytes`、`string`）或合约/枚举类型
- **ValueType**: 值的类型，可以是任何类型，包括映射、数组、结构体

## 核心特性

### 1. 自动初始化
所有可能的键都被预先"存在"，映射到该类型的默认值（如 `uint` 的默认值是 0，`address` 的默认值是 `0x0`）。

### 2. 不存储键，存储哈希
实际存储的是键的 `keccak256` 哈希值，而不是键本身。

### 3. 无长度概念
- 不能获取映射的长度
- 不能遍历所有键值对
- 不能直接删除整个映射

## 代码示例解析

### 示例1：基础映射使用
```solidity
contract MappingExample {
    mapping(address => uint) public balances;
    
    function update(uint newBalance) public {
        balances[msg.sender] = newBalance;  // 设置调用者的余额
    }
}
```

**关键点：**
- `public` 关键字会自动生成一个 getter 函数 `balances(address)`
- 可以直接通过 `balances[地址]` 访问对应的余额

### 示例2：带命名的映射
```solidity
mapping(address user => uint balance) public balances;
```

**优势：**
- 提高代码可读性
- 在 ABI 中提供更清晰的参数名称
- 不影响实际功能或gas消耗

### 示例3：嵌套映射（ERC20示例）
```solidity
mapping(address => mapping(address => uint256)) private _allowances;
```

**理解嵌套映射：**
- `_allowances[owner][spender]` 表示：owner 允许 spender 花费的代币数量
- 这是ERC20代币标准中授权机制的核心实现

## ERC20代码解析

```solidity
function allowance(address owner, address spender) public view returns (uint256) {
    return _allowances[owner][spender];  // 查询授权额度
}

function approve(address spender, uint256 amount) public returns (bool) {
    _allowances[msg.sender][spender] = amount;  // 设置授权额度
    emit Approval(msg.sender, spender, amount);
    return true;
}
```

## 使用限制

1. **只能用于 storage**：映射只能作为状态变量存在
2. **不能作为公共函数参数**：不能在 `public`/`external` 函数中传递映射
3. **不能返回映射**：公共函数不能返回映射类型

## 实际应用场景

1. **余额追踪**：`mapping(address => uint) balances`
2. **权限管理**：`mapping(address => bool) isAdmin`
3. **投票系统**：`mapping(address => bool) hasVoted`
4. **代币授权**：`mapping(address => mapping(address => uint)) allowances`

映射是Solidity中最重要的数据结构之一，特别适合需要快速查找和更新键值对的场景。

## 官方示例

- [官方示例1讲解](./mapping-example1.md)
- [官方示例2讲解](./mapping-example2.md)