---
title: Solidity 课堂笔记补充 - 合约
category:
  - 区块链
  - 以太坊
  - Solidity
---

# Solidity 课堂笔记补充 - 合约

- [合约](https://docs.soliditylang.org/zh-cn/latest/contracts.html#contracts)

## 创建合约

### ⚙️ 合约创建的流程和规则

1. **外部创建 vs 内部创建**

   * 一个合约可以通过外部交易被创建（比如用户在钱包里部署合约）。
   * 或者一个合约里调用其他合约创建合约（内部创建）。

2. **IDE 和 web3.js 辅助**

   * 工具如 Remix 等 IDE 提供 UI，使部署过程对用户来说比较无缝（界面化）。
   * 用 JavaScript API，例如 `web3.eth.Contract` 可以程序性地创建合约。 

3. **构造函数（constructor）**

   * 构造函数是一个特殊函数，用 `constructor` 关键字声明的。创建合约时执行一次。
   * 它是可选的；如果不写就当作 “默认构造函数” 处理。
   * 一个合约只能有一个构造函数（不支持重载）。
4. **部署后存储在区块链上的代码**

   * 构造函数执行完后，合约最终的 *runtime code* 被存储在区块链上。这个 runtime code 包含所有公开的（public / external）函数，以及那些从这些函数可以 reach（调用）到的函数。
   * 不包括构造函数本身（constructor）里的代码，也不包括那些只在构造函数中调用的内部函数（internal 函数仅在 constructor 调用后如果没有被其它公开／外部函数引用，也不会包括在部署后的 runtime code 中）。

5. **构造函数参数的传递**

   * 构造函数的参数在内部是通过 ABI 编码（ABI-encoded）附加在合约字节码之后传递的。部署工具（如 web3.js）一般封装了这些细节，你不用手动处理。

6. **创建合约依赖关系**

   * 如果一个合约要创建另一个合约，那么创建者（caller）必须知道要创建合约的源代码或编译出的二进制。换句话说，**循环依赖**（contract A 创建 B，B 创建 A）在代码级通常是不可行的 / 不允许的。
---

## 可见性和 getter 函数

### 状态变量可见性

| 可见性 | 同一合约内访问 | 派生合约访问 | 外部合约访问 | 自动生成getter | 备注 |
|--------|---------------|-------------|-------------|---------------|------|
| `public` | ✅ | ✅ | ✅ | ✅ | 编译器自动生成getter函数，无setter |
| `internal` | ✅ | ✅ | ❌ | ❌ | **默认可见性**，只能内部和派生合约访问 |
| `private` | ✅ | ❌ | ❌ | ❌ | 只能在定义的合约中访问 |

### 函数可见性

| 可见性 | 同一合约内访问 | 派生合约访问 | 外部合约访问 | 调用方式 | 备注 |
|--------|---------------|-------------|-------------|----------|------|
| `external` | ❌ (需要`this.f()`) | ✅ | ✅ | 消息调用 | 合约接口的一部分，不能直接内部调用 |
| `public` | ✅ | ✅ | ✅ | 内部/消息调用 | 合约接口的一部分，可内部和外部调用 |
| `internal` | ✅ | ✅ | ❌ | 内部调用 | 不通过ABI暴露，可接受内部类型参数 |
| `private` | ✅ | ❌ | ❌ | 内部调用 | 只能在定义的合约中访问 |


:::tip
#### 重要提醒

⚠️ **安全警告**：标记为 `private` 或 `internal` 的变量和函数仍然会在区块链上公开可见，这些修饰符只是防止其他合约的程序化访问。

#### *调用方式说明

- **内部调用**：直接函数调用，不创建EVM消息调用
- **消息调用**：通过EVM消息调用，如 `this.f()` 或从其他合约调用
:::

### Getter函数

#### 基本规则
- 编译器为所有 `public` 状态变量自动生成同名的 getter 函数
- Getter 函数具有 `external` 可见性
- 状态变量可以在声明时初始化

```solidity
uint public data = 42;  // 自动生成 function data() external view returns (uint)
```

#### 访问方式差异

| 访问方式 | 语法 | 调用类型 | 说明 |
|---------|------|---------|------|
| 内部访问 | `data` | 直接读取状态变量 | 不使用 `this.` |
| 外部访问 | `this.data()` | 调用 getter 函数 | 使用 `this.` 或从其他合约调用 |

#### 复杂类型的 Getter 函数

##### 数组类型
- **限制**：只能获取单个元素，不能返回整个数组
- **原因**：避免高额 Gas 费用
- **解决方案**：手动编写返回整个数组的函数

```solidity
uint[] public myArray;
// 自动生成：function myArray(uint i) external view returns (uint)

// 手动添加获取整个数组的函数
function getArray() public view returns (uint[] memory) {
    return myArray;
}
```

##### 映射和结构体
- **复杂映射**：`mapping(uint => mapping(bool => Data[])) public data`
- **生成的 getter**：会为每层映射和数组提供参数
- **限制**：结构体中的映射和动态数组会被省略（bytes 除外）
- **原因**：无法为映射提供合适的键选择机制

**复杂结构体示例：**
```solidity
struct Data {
    uint a;           // ✅ 包含在 getter 中
    bytes3 b;         // ✅ 包含在 getter 中  
    mapping(uint => uint) map;  // ❌ 省略（映射无法选择键）
    uint[3] c;        // ❌ 省略（固定数组）
    uint[] d;         // ❌ 省略（动态数组）
    bytes e;          // ✅ 包含在 getter 中（bytes 例外）
}
mapping(uint => mapping(bool => Data[])) public data;
```

**编译器自动生成的 getter 函数：**
```solidity
function data(uint arg1, bool arg2, uint arg3)
    public
    view
    returns (uint a, bytes3 b, bytes memory e)
{
    a = data[arg1][arg2][arg3].a;
    b = data[arg1][arg2][arg3].b;
    e = data[arg1][arg2][arg3].e;
}
```

**参数说明：**
- `arg1`: 第一层映射的键 (uint)
- `arg2`: 第二层映射的键 (bool) 
- `arg3`: 数组的索引 (uint)
- **返回值**: 只包含结构体中可访问的字段 (a, b, e)

## 函数修饰器

**修饰器是用来声明式改变函数行为的工具**，主要用于：
- 权限控制（如`onlyOwner`检查调用者身份）
- 条件检查（如`costs`检查支付金额）
- 状态保护（如`noReentrancy`防重入攻击）

### 核心语法特性

#### 1. 基本结构
```solidity
modifier modifierName {
    require(condition, "Error message");
    _;  // 占位符，函数体插入位置
}
```

#### 2. 参数化修饰器
```solidity
modifier costs(uint price) {
    if (msg.value >= price) {
        _;
    }
}
```

#### 3. 继承性
- 修饰器可以被派生合约继承
- 标记为`virtual`时可被重写
- 可通过`C.m`语法引用特定合约的修饰器

### 执行机制

#### 1. 占位符`_`的作用
- 表示被修饰函数体的插入位置
- 可在修饰器中多次使用
- 每次出现都会执行一遍函数体

#### 2. 多修饰器执行顺序
```solidity
function register() public payable costs(price) onlyOwner {
    // 按从左到右顺序执行：先costs，再onlyOwner
}
```

#### 3. 返回值处理
- 修饰器中的`return`只退出当前修饰器
- 函数的最终返回值是最后一次执行的结果
- 如果修饰器不执行`_`，返回变量为默认值

### 实用场景示例

```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.1 <0.9.0;
// 这将报告一个由于废弃的 selfdestruct 而产生的警告

contract owned {
    constructor() { owner = payable(msg.sender); }
    address payable owner;

    // 这个合约只定义了一个修饰器，但没有使用它：
    // 它将在派生合约中使用。
    // 修饰器所修饰的函数体会被插入到特殊符号 `_;` 的位置。
    // 这意味着，如果所有者调用这个函数，这个函数就会被执行，
    // 否则就会抛出一个异常。
    modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only owner can call this function."
        );
        _;
    }
}

contract destructible is owned {
    // 这个合约从 `owned` 合约继承了 `onlyOwner` 修饰器，
    // 并将其应用于 `destroy` 函数，
    // 只有在合约里保存的 owner 调用 `destroy` 函数，才会生效。
    function destroy() public onlyOwner {
        selfdestruct(owner);
    }
}

contract priced {
    // 修饰器可以接受参数：
    modifier costs(uint price) {
        if (msg.value >= price) {
            _;
        }
    }
}

contract Register is priced, destructible {
    mapping(address => bool) registeredAddresses;
    uint price;

    constructor(uint initialPrice) { price = initialPrice; }

    // 在这里也使用关键字 `payable` 非常重要，
    // 否则函数会自动拒绝所有发送给它的以太币。
    function register() public payable costs(price) {
        registeredAddresses[msg.sender] = true;
    }

    /*
        执行过程
        // === onlyOwner修饰器的前置逻辑 ===
        require(
            msg.sender == owner,
            "Only owner can call this function."
        );
        
        // === 这里是 `_` 占位符的位置 ===
        // 原始函数体会被插入到这里：
        price = price_;
        // === 函数体插入结束 ===
        
        // === onlyOwner修饰器的后置逻辑（本例中没有）===
    */
    function changePrice(uint price_) public onlyOwner {
        price = price_;
    }
}

contract Mutex {
    bool locked;
    modifier noReentrancy() {
        require(
            !locked,
            "Reentrant call."
        );
        locked = true;
        _;
        locked = false;
    }

    /// 这个函数受互斥量保护，这意味着 `msg.sender.call` 中的重入调用不能再次调用  `f`。
    /// `return 7` 语句指定返回值为 7，但修饰器中的语句 `locked = false` 仍会执行。
    function f() public noReentrancy returns (uint) {
        (bool success,) = msg.sender.call("");
        require(success);
        return 7;
    }
}
```

## 常量和不可变状态变量

### 基本特性对比

| 特性 | Constant | Immutable |
|------|----------|-----------|
| **修改性** | 合约构建后不能修改 | 合约构建后不能修改 |
| **赋值时机** | 编译时必须固定 | 构造时可以分配 |
| **声明位置** | 可在文件级别或合约内声明 | 只能在合约内声明 |
| **存储方式** | 编译器不预留存储空间，每次出现都被替换为常量表达式 | 构造时评估一次，值被复制到代码中所有访问位置 |

### 赋值规则对比

| 赋值规则 | Constant | Immutable |
|----------|----------|-----------|
| **赋值位置** | 必须在变量声明处 | 可在声明处或构造函数中 |
| **赋值次数** | 声明时一次 | 构造时可多次赋值 |
| **访问限制** | 不允许访问存储、区块链数据、执行数据、外部合约调用 | 构造时可以访问环境变量（如 `msg.sender`、`ref.balance`） |
| **允许的函数** | `keccak256`、`sha256`、`ripemd160`、`ecrecover`、`addmod`、`mulmod` | 无特殊限制 |

### 支持的数据类型

| 类型支持 | Constant | Immutable |
|----------|----------|-----------|
| **字符串类型** | ✅ 支持 | ❌ 不支持 |
| **值类型** | ✅ 支持 | ✅ 支持 |
| **其他类型** | ❌ 当前未完全实现 | ❌ 当前未完全实现 |

### 燃料成本对比

| 成本因素 | Constant | Immutable |
|----------|----------|-----------|
| **相对成本** | 通常更便宜 | 相对较高 |
| **存储占用** | 0 字节（直接替换） | 32 字节（即使值更小） |
| **优化程度** | 局部优化可能性高 | 一次评估，全局复制 |

### 代码示例对比

#### Constant 示例
```solidity
// 文件级别常量
uint constant X = 32**22 + 8;

contract C {
    // 字符串常量
    string constant TEXT = "abc";
    // 哈希常量
    bytes32 constant MY_HASH = keccak256("abc");
}
```

#### Immutable 示例
```solidity
contract C {
    uint immutable decimals = 18;  // 声明时初始化
    uint immutable maxBalance;     // 构造函数中初始化
    address immutable owner = msg.sender;  // 可访问环境变量
    
    constructor(uint decimals_, address ref) {
        if (decimals_ != 0)
            decimals = decimals_;  // 构造时可多次赋值
        
        maxBalance = ref.balance;  // 可访问外部状态
    }
}
```

### 重要注意事项

#### Constant 注意事项
- 值必须在编译时完全确定
- 不能访问任何运行时数据
- 支持复杂表达式但有副作用限制

#### Immutable 注意事项
- Solidity 0.8.21 前限制更严格
- 需注意继承层次结构中的初始化顺序
- 可在首次写入前读取（有默认初始值）
- 编译器会修改运行时代码替换不可变变量引用

#### 使用建议
- **选择 Constant**：当值在编译时就能确定，且希望最低 gas 成本
- **选择 Immutable**：当需要在部署时根据构造函数参数或环境变量设置值

## 函数

- https://docs.soliditylang.org/zh-cn/latest/contracts.html#functions


### 函数重写的问题

**最佳实践建议**：
- 避免使用函数重载，特别是涉及数值类型时
- 使用清晰的函数命名
- 优先考虑单一函数处理多种情况
- 如果必须重载，确保参数类型差异足够大，避免隐式转换冲突

这就是为什么很多 Solidity 风格指南都建议**谨慎使用或避免函数重载**的原因。


## 事件

- https://docs.soliditylang.org/zh-cn/latest/contracts.html#events

## 错误和恢复语句

- https://docs.soliditylang.org/zh-cn/latest/contracts.html#errors


### Gas 成本排序（从低到高）

| 方式 | Gas 成本 | 适用场景 | 优缺点 |
|------|----------|----------|---------|
| `revert` + 自定义错误 | **最低** | 用户输入错误、业务逻辑错误 | ✅ Gas效率最高<br>✅ 结构化数据<br>✅ 易于前端解析 |
| `require` + 自定义错误 | **低** | 前置条件检查 | ✅ 简洁语法<br>✅ 结构化数据 |
| `revert` + 字符串 | **中等** | 简单错误提示 | ❌ Gas消耗较高<br>✅ 易读 |
| `require` + 字符串 | **高** | 传统方式 | ❌ Gas消耗最高<br>✅ 语法简单 |
| `assert` | **最高**（异常时） | 内部错误检测 | ❌ 消耗所有剩余Gas<br>⚠️ 仅用于不应发生的情况 |

### 最佳实践建议

#### ✅ 推荐：自定义错误 + revert
```solidity
// 定义错误类型
error InsufficientBalance(uint256 available, uint256 required);
error InvalidRecipient(address recipient);
error TransferPaused();

contract BestPractice {
    mapping(address => uint256) private balances;
    bool public paused;
    
    function transfer(address to, uint256 amount) public {
        // 使用自定义错误
        if (paused) revert TransferPaused();
        if (to == address(0)) revert InvalidRecipient(to);
        if (amount > balances[msg.sender]) {
            revert InsufficientBalance(balances[msg.sender], amount);
        }
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}
```

#### 🔄 可接受：require + 自定义错误
```solidity
function transfer(address to, uint256 amount) public {
    require(!paused, TransferPaused());
    require(to != address(0), InvalidRecipient(to));
    require(amount <= balances[msg.sender], InsufficientBalance(balances[msg.sender], amount));
    
    balances[msg.sender] -= amount;
    balances[to] += amount;
}
```

#### ❌ 不推荐：字符串错误消息
```solidity
function transfer(address to, uint256 amount) public {
    require(!paused, "Transfer is paused");
    require(to != address(0), "Invalid recipient");
    require(amount <= balances[msg.sender], "Insufficient balance");
    
    balances[msg.sender] -= amount;
    balances[to] += amount;
}
```

#### 何时使用不同方式

##### `revert` + 自定义错误
- **最推荐**的现代方式
- 用于：用户输入错误、业务逻辑违规
- Gas 效率最高
- 提供结构化错误数据

##### `require`
- 用于：简单的前置条件检查
- 语法更简洁
- 与自定义错误结合使用效果好

##### `assert`
- **仅用于**：内部不变量检查
- 不应该用于用户可能触发的错误
- 失败时消耗所有剩余Gas

### 前端集成优势

使用自定义错误的合约更易于前端集成：

```javascript
// 前端可以轻松解析结构化错误
try {
    await contract.transfer(recipient, amount);
} catch (error) {
    if (error.data && error.data.includes('InsufficientBalance')) {
        const decoded = contract.interface.parseError(error.data);
        console.log(`余额不足：可用 ${decoded.args.available}，需要 ${decoded.args.required}`);
    }
}
```

### 总结

**强烈推荐使用：`revert` + 自定义错误**

1. **Gas 效率最高**
2. **结构化数据传递**
3. **前端易于解析**
4. **现代Solidity最佳实践**
5. **代码可读性好**

## 继承

- https://docs.soliditylang.org/zh-cn/latest/contracts.html#index-17

## 抽象合约

- https://docs.soliditylang.org/zh-cn/latest/contracts.html#abstract-contract


## 接口（interface）合约

- https://docs.soliditylang.org/zh-cn/latest/contracts.html#interface

## 库合约

- https://docs.soliditylang.org/zh-cn/latest/contracts.html#libraries

## Using For

- https://docs.soliditylang.org/zh-cn/latest/contracts.html#using-for

