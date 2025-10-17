---
title: 映射类型-官方示例1讲解
category:
  - 以太坊
  - Solidity
---

# 映射类型-官方示例1讲解

```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract MappingExample {
    mapping(address => uint) public balances;

    function update(uint newBalance) public {
        balances[msg.sender] = newBalance;
    }
}

contract MappingUser {
    function f() public returns (uint) {
        MappingExample m = new MappingExample();
        m.update(100);
        return m.balances(address(this));
    }
}
```

## 关键问题

为什么 `m.update(100)` 和 `m.balances(address(this))` 会对应同一个地址？

## 执行步骤分析

```solidity
function f() public returns (uint) {
    MappingExample m = new MappingExample();  // 步骤1
    m.update(100);                           // 步骤2
    return m.balances(address(this));        // 步骤3
}
```

### 步骤1: 创建新合约实例
```solidity
MappingExample m = new MappingExample();
```
- 创建了一个新的 `MappingExample` 合约实例
- 此时映射 `balances` 是空的（所有值都是默认值0）

### 步骤2: 调用update函数
```solidity
m.update(100);
```

让我们看看 `update` 函数内部发生了什么：
```solidity
function update(uint newBalance) public {
    balances[msg.sender] = newBalance;  // 关键：msg.sender是谁？
}
```

**重要概念：`msg.sender` 的含义**
- `msg.sender` 是**调用当前函数的地址**
- 当 `MappingUser` 合约调用 `m.update(100)` 时
- 在 `update` 函数中，`msg.sender` = `MappingUser合约的地址`
- 所以实际执行的是：`balances[MappingUser合约地址] = 100`

### 步骤3: 查询余额
```solidity
return m.balances(address(this));
```

- `address(this)` 在 `MappingUser` 合约中指的是 `MappingUser合约的地址`
- 查询的是：`balances[MappingUser合约地址]`
- 这正好是步骤2中设置的那个键值对！

## 图解说明

```
调用链：
外部账户 -> MappingUser.f() -> MappingExample.update()

在update()函数中：
msg.sender = MappingUser合约地址
balances[MappingUser合约地址] = 100

在f()函数中：
address(this) = MappingUser合约地址
查询 balances[MappingUser合约地址] = 100 ✓
```

## 验证实验

为了验证这个逻辑，我们可以添加一些调试信息：

```solidity
contract MappingExampleDebug {
    mapping(address => uint) public balances;
    
    event UpdateCalled(address caller, uint amount);
    
    function update(uint newBalance) public {
        emit UpdateCalled(msg.sender, newBalance);
        balances[msg.sender] = newBalance;
    }
}

contract MappingUserDebug {
    event ContractAddress(address self);
    
    function f() public returns (uint) {
        emit ContractAddress(address(this));
        MappingExampleDebug m = new MappingExampleDebug();
        m.update(100);
        return m.balances(address(this));
    }
}
```

## 关键理解点

1. **msg.sender的传递**：
   - 当A调用B，B调用C时
   - 在C中，msg.sender = B的地址（不是A）

2. **address(this)的含义**：
   - 始终指向当前合约的地址
   - 在MappingUser中就是MappingUser的地址

3. **为什么能对应上**：
   - update()中存储：`balances[MappingUser地址] = 100`
   - 查询时：`balances[MappingUser地址]` = 100

## 实际测试建议

在Remix中部署后，你可以：
1. 查看事件日志，确认地址一致性
2. 直接调用 `balances(MappingUser合约地址)` 验证
3. 尝试用不同账户调用，观察结果差异

## Remix部署调试完整指南

## 步骤1: 编译合约
1. 在左侧面板选择 **"Solidity Compiler"** 图标
2. 确保编译器版本在 `>=0.4.0 <0.9.0` 范围内（推荐使用 0.8.18+）
3. 点击 **"Compile MappingExample.sol"** 按钮
4. 确保没有编译错误

## 步骤2: 部署合约
1. 切换到 **"Deploy & Run Transactions"** 面板
2. 选择环境：
   - **Remix VM (London)**: 本地测试环境（推荐新手）
   - **Injected Web3**: 连接MetaMask使用真实测试网
   - **Web3 Provider**: 连接自定义节点

### 部署MappingExample合约
1. 在 **"Contract"** 下拉菜单选择 `MappingExample`
2. 点击橙色 **"Deploy"** 按钮
3. 部署成功后，合约会出现在 **"Deployed Contracts"** 区域

### 部署MappingUser合约
1. 选择 `MappingUser` 合约
2. 点击 **"Deploy"** 按钮

## 步骤3: 测试合约功能

### 测试MappingExample
1. 展开已部署的 `MappingExample` 合约
2. 可以看到两个函数：
   - `balances` (蓝色按钮 - view函数)
   - `update` (橙色按钮 - 状态改变函数)

#### 测试update函数
1. 在 `update` 输入框输入一个数值，如：`100`
2. 点击 **"update"** 按钮
3. 交易执行后会在控制台显示结果

#### 测试balances函数
1. 在 `balances` 输入框输入一个地址（复制当前账户地址）
2. 点击 **"balances"** 按钮
3. 应该显示之前设置的余额值

### 测试MappingUser
1. 展开 `MappingUser` 合约
2. 点击 `f` 函数按钮
3. 这会：
   - 创建新的MappingExample实例
   - 调用update(100)
   - 查询当前合约地址的余额
   - 返回结果

## 步骤4: 调试技巧

### 查看交易详情
1. 每次函数调用后，在控制台会显示交易信息
2. 点击交易哈希可以查看详细信息
3. 包含gas消耗、事件日志等

### 使用Debugger
1. 在交易详情中点击 **"Debug"** 按钮
2. 可以逐步执行代码，查看变量状态
3. 观察storage变化和函数调用栈

### 常见问题排查
- **Out of Gas**: 增加gas限制
- **Revert**: 检查require条件或余额不足
- **Address错误**: 确保使用正确的合约地址

## 步骤5: 高级调试

### 添加事件日志
```solidity
contract MappingExample {
    mapping(address => uint) public balances;
    
    event BalanceUpdated(address user, uint newBalance);
    
    function update(uint newBalance) public {
        balances[msg.sender] = newBalance;
        emit BalanceUpdated(msg.sender, newBalance);
    }
}
```

### 使用console.log (需要Hardhat环境)
```solidity
import "hardhat/console.sol";

function update(uint newBalance) public {
    console.log("Updating balance for:", msg.sender);
    console.log("New balance:", newBalance);
    balances[msg.sender] = newBalance;
}
```

## 注意事项
- 在Remix VM环境中，每次刷新页面都会重置状态
- 测试时注意区分不同的账户地址
- 观察gas消耗，优化合约性能
- 使用不同的输入值测试边界条件