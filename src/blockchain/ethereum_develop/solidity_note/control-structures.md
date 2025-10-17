---
title: Solidity 课堂笔记补充 - 表达式和控制结构
category:
  - 区块链
  - 以太坊
  - Solidity
---

# Solidity 课堂笔记补充 - 表达式和控制结构

- [Solidity 官网 - 表达式和控制结构](https://docs.soliditylang.org/zh-cn/latest/control-structures.html#id1)

## 控制结构

**📌 小结**

- Solidity 控制结构在基本形式上和 C / JavaScript 很像，但它严格要求条件为布尔类型，必须加括号，对于语句体的大括号是可选的；并且异常处理（try/catch）仅适用于外部调用和合约创建。
- 与 C 或 JavaScript 不同，Solidity 不允许非布尔类型隐式转换成布尔类型

```solidity
if (1) { … }   // ❌ 在 Solidity 中无效
```

## 函数调用

- [函数调用](https://docs.soliditylang.org/zh-cn/latest/control-structures.html#function-calls)

### 加盐合约创建 / create2

Solidity中**加盐（Salt）合约创建**的过程：

#### 两种合约创建方式对比

**1. 传统创建方式（CREATE）**
- 合约地址 = `keccak256(创建者地址, nonce)`
- nonce是一个递增计数器，每次创建合约时+1
- 地址不可预测，因为nonce会变化

**2. 加盐创建方式（CREATE2）**
- 使用固定的salt值替代变化的nonce
- 地址完全可预测和确定

#### 加盐创建的详细过程

**地址计算公式**
```
合约地址 = keccak256(
    0xff +                    // 固定前缀
    创建者地址 +               // 调用create2的合约地址
    salt +                    // 32字节的盐值
    keccak256(创建字节码 + 构造参数)  // 合约代码哈希
)
```

**代码示例分析**

在您的代码中：

```solidity
address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
    bytes1(0xff),           // 固定前缀
    address(this),          // 合约C的地址（创建者）
    salt,                   // 传入的盐值
    keccak256(abi.encodePacked(
        type(D).creationCode,   // 合约D的创建字节码
        abi.encode(arg)         // 构造函数参数
    ))
)))));
```

**实际创建**
```solidity
D d = new D{salt: salt}(arg);  // 使用CREATE2操作码创建
```

**加盐创建的优势**

1. **地址可预测性**
   - 在合约部署前就能计算出准确地址
   - 便于提前规划和集成

2. **确定性**
   - 相同的参数总是产生相同的地址
   - 不受nonce变化影响

3. **灵活性**
   - 可以选择性部署合约
   - 支持条件部署（如争议解决场景）

**主要用例**

**链外仲裁合约**：
- 双方约定一个仲裁合约地址
- 只有发生争议时才实际部署
- 节省gas费用，提高效率

这种机制特别适合需要**预先确定合约地址**但**延迟部署**的场景，比如状态通道、支付通道等Layer 2解决方案。


#### 类型转换过程详解

**数据流转过程**

```
输入数据
    ↓
abi.encodePacked() → bytes (动态长度字节数组)
    ↓
keccak256() → bytes32 (32字节哈希)
    ↓
uint() → uint256 (256位整数)
    ↓
uint160() → uint160 (160位整数，截取低160位)
    ↓
address() → address (20字节地址)
```

**每步转换的作用**

| 步骤 | 输入类型 | 输出类型 | 作用 | 示例 |
|------|----------|----------|------|------|
| 1 | 各种类型 | `bytes` | 数据打包 | `0xff` + 地址 + salt + 哈希 |
| 2 | `bytes` | `bytes32` | 哈希计算 | `0x1234...abcd` (64个十六进制字符) |
| 3 | `bytes32` | `uint256` | 转为整数 | `123456789012345678901234567890...` |
| 4 | `uint256` | `uint160` | 截取160位 | 只保留后40个十六进制字符 |
| 5 | `uint160` | `address` | 转为地址 | `0x1234567890123456789012345678901234567890` |

**为什么是160位？**

以太坊地址设计：
- **长度**：20字节 = 160位 = 40个十六进制字符
- **格式**：`0x` + 40个十六进制字符
- **示例**：`0x742d35Cc6634C0532925a3b8D45C1A87c9e64D4F`

**内存中的数据变化**

```
原始哈希（256位）：
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

截取为160位：
                                        ↓ 从这里开始取160位
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
                                        ↓
最终地址：0x567890abcdef1234567890abcdef1234567890abcdef
```

**一步步验证**

可以用以下方式验证每一步：

```solidity
// 分步骤计算
bytes memory packed = abi.encodePacked(bytes1(0xff), address(this), salt, codeHash);
bytes32 hash = keccak256(packed);
uint256 hashAsUint = uint256(hash);
uint160 addressAsUint = uint160(hashAsUint);  // 自动截取低160位
address finalAddress = address(addressAsUint);
```

### 赋值

- https://docs.soliditylang.org/zh-cn/latest/control-structures.html#index-4

#### 解构赋值和返回多个值

**元组(Tuple)**

- 编译时元素数量固定的对象列表
- 元素可以是不同类型
- 同时返回或赋值多个数值
- 元组不是真正的类型，只是语法分组工具

**场景*

模式1：全部声明新变量

```solidity
(uint a, string memory b, bool c) = getValues();
```

模式2：全部使用已存在的变量

```solidity
uint a;
string memory b;
bool c;
// ... 其他代码 ...
(a, b, c) = getValues();
```

```solidity
(x, uint y) = (1, 2); ❌
```

#### 作用域和声明

##### 第一个例子：正常的块级作用域

```solidity
contract C {
    function minimalScoping() pure public {
        {
            uint same;
            same = 1;
        }

        {
            uint same;
            same = 3;
        }
    }
}
```

:::tip
解析：
- **两个独立的块作用域**：每个 `{}` 创建一个独立的作用域
- **变量名可以重复**：在不同作用域中，可以使用相同的变量名 `same`
- **作用域隔离**：第一个块中的 `same` 和第二个块中的 `same` 是完全不同的变量
- **内存管理**：每个变量在其作用域结束时自动销毁

**执行流程：**
1. 进入第一个块，创建 `uint same`，赋值为 1
2. 退出第一个块，第一个 `same` 被销毁
3. 进入第二个块，创建新的 `uint same`，赋值为 3
4. 退出第二个块，第二个 `same` 被销毁
:::

##### 第二个例子：变量遮蔽（Shadowing）问题

```solidity
uint x = 1;
{
    x = 2;            // 修改外层 x 为 2
    uint x;           // 内层 x 声明（默认值 0），遮蔽外层 x
}                     // 内层 x 销毁
return x;             // 返回外层 x（值为 2）
```

