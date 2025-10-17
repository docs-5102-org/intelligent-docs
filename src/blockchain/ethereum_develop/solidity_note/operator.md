---
title: Solidity 运算符完整指南
category:
  - 以太坊
  - Solidity
---

# Solidity 运算符完整指南

## 📋 目录
- [运算符基础规则](#运算符基础规则)
- [三元运算符](#三元运算符)
- [复合赋值与增减运算符](#复合赋值与增减运算符)
- [delete 操作符](#delete-操作符)
- [实战示例](#实战示例)

---

## 🔹 运算符基础规则

### 类型转换优先级
运算时，Solidity 按以下规则确定运算类型：

1. **右操作数能隐式转换为左操作数类型** → 按左操作数类型运算
2. **左操作数能隐式转换为右操作数类型** → 按右操作数类型运算  
3. **两者互相都不能隐式转换** → ❌ 编译错误

### 字面常数处理
- **自动类型推导**：`5` → `uint8`，`-5` → `int8`
- **无限精度**：两个字面常数运算时精度无限，不会溢出
- **优先级**：相同位宽下，无符号类型优先级 < 有符号类型

### 结果类型规则
- **一般运算**：结果类型 = 运算所采用的类型
- **比较运算**：`<`, `>`, `<=`, `>=`, `==`, `!=` 结果始终是 `bool`
- **特殊运算**：幂运算 `**`、位移 `<<`、`>>` 结果使用**左操作数类型**

### 示例
```solidity
uint8  x = 5;
int32  z = 10;
var y = x + z;      // int32 类型（uint8 可转为 int32）

uint256 a = 2;
uint8   b = 10;
var c = a ** b;     // uint256 类型（左操作数类型）

bool cmp = (x < z); // bool 类型
```

---

## 🔹 三元运算符

### 语法
```solidity
<条件表达式> ? <true表达式> : <false表达式>
```

### 核心规则
- **类型确定**：结果类型由两个分支表达式类型决定
- **不保持有理数类型**：会强制转换为实际类型
- **转换规则**：与普通运算符相同

### 关键区别
| 情况 | 示例 | 结果 |
|------|------|------|
| 纯字面量表达式 | `1.5 + 1.5` | ✅ 保持无限精度 |
| 三元表达式参与 | `1.5 + (true ? 1.5 : 2.5)` | ❌ 可能编译错误 |

### 示例分析

#### ❌ 溢出陷阱
```solidity
uint8 a = 255;
uint8 b = a + (true ? 1 : 0);  
// 错误：(true ? 1 : 0) 被推断为 uint8
// 导致 255 + 1 = 256 溢出 uint8 范围
```

#### ❌ 小数类型错误
```solidity
var y = 1.5 + (true ? 1.5 : 2.5); 
// 错误：无法将小数字面量作为整数类型处理
```

#### ✅ 正确用法
```solidity
uint256 a = 10;
uint256 b = 20;
uint256 c = (a > b ? a : b);  // c = 20

uint8  m = 5;
int32  n = -3;
var r = (true ? m : n);       // r 类型为 int32
```

---

## 🔹 复合赋值与增减运算符

### 复合赋值运算符
对于 LValue 变量 `a`，支持以下简写形式：

| 运算符 | 等价形式 | 说明 |
|--------|----------|------|
| `a += e` | `a = a + e` | 加法赋值 |
| `a -= e` | `a = a - e` | 减法赋值 |
| `a *= e` | `a = a * e` | 乘法赋值 |
| `a /= e` | `a = a / e` | 除法赋值 |
| `a %= e` | `a = a % e` | 取模赋值 |
| `a \|= e` | `a = a \| e` | 按位或赋值 |
| `a &= e` | `a = a & e` | 按位与赋值 |
| `a ^= e` | `a = a ^ e` | 按位异或赋值 |
| `a <<= e` | `a = a << e` | 左移赋值 |
| `a >>= e` | `a = a >> e` | 右移赋值 |

### 增减运算符

| 运算符 | 行为 | 返回值 |
|--------|------|--------|
| `a++` | 后置递增 | 修改前的旧值 |
| `++a` | 前置递增 | 修改后的新值 |
| `a--` | 后置递减 | 修改前的旧值 |
| `--a` | 前置递减 | 修改后的新值 |

```solidity
uint256 x = 5;
uint256 y = x++;  // y = 5, x = 6 (先返回再修改)
uint256 z = ++x;  // z = 7, x = 7 (先修改再返回)
```

---

## 🔹 delete 操作符

### 基本概念
`delete a` 将变量 `a` 重置为该类型的**默认初始值**。

### 不同类型的 delete 行为

| 类型 | delete 行为 | 示例 |
|------|-------------|------|
| **整数类型** | 重置为 `0` | `delete x` → `x = 0` |
| **布尔类型** | 重置为 `false` | `delete flag` → `flag = false` |
| **静态数组** | 所有元素重置，长度保持 | `delete arr` → 元素变为 0，长度不变 |
| **动态数组** | 长度变为 0 | `delete dynamicArr` → `length = 0` |
| **结构体** | 所有成员重置（除 mapping） | `delete struct` → 成员重置 |
| **映射整体** | 无效果 | `delete mapping` → 无作用 |
| **映射元素** | 删除指定键的值 | `delete mapping[key]` → 值重置 |

### 特殊情况

#### 数组元素删除
```solidity
uint[] arr = [1, 2, 3, 4];
delete arr[1];  // arr = [1, 0, 3, 4] - 留下"空洞"，长度不变
```

#### 引用类型注意事项
```solidity
// 对于 storage 中的引用类型
// delete 是重新赋值为新的初始对象，而非修改原对象
```

---

## 🔹 实战示例

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OperatorDemo {
    uint256 public x = 10;
    uint8 public y = 255;
    bool public flag = true;
    
    uint[] public arr;
    struct Person { 
        uint age; 
        bool isActive; 
    }
    Person public person;
    mapping(address => uint) public balances;

    constructor() {
        // 初始化数组
        arr.push(1);
        arr.push(2);
        arr.push(3);
        
        // 初始化结构体
        person.age = 25;
        person.isActive = true;
        
        // 初始化映射
        balances[msg.sender] = 100;
    }

    function testBasicOperators() public {
        // 基础运算
        uint8  a = 5;
        int32  b = 10;
        int32  result = a + b;  // 结果为 int32 类型
        
        // 三元运算符
        uint256 max = (x > 20) ? x : 20;
        
        // 比较运算
        bool isEqual = (a == 5);  // 结果为 bool
    }

    function testCompoundOperators() public {
        // 复合赋值
        x += 5;   // x = 15
        x *= 2;   // x = 30
        x /= 3;   // x = 10
        
        // 增减运算符
        uint256 oldY = y++;  // oldY = 255, y = 0 (溢出)
        uint256 newY = ++y;  // newY = 1, y = 1
    }

    function testDeleteOperator() public {
        // 删除基本类型
        delete x;         // x = 0
        delete flag;      // flag = false
        
        // 删除结构体
        delete person;    // person.age = 0, person.isActive = false
        
        // 删除数组元素（留下空洞）
        delete arr[1];    // arr = [1, 0, 3]
        
        // 删除整个动态数组
        delete arr;       // arr.length = 0
        
        // 删除映射元素
        delete balances[msg.sender];  // balances[msg.sender] = 0
    }

    function getArrayElement(uint index) public view returns (uint) {
        require(index < arr.length, "Index out of bounds");
        return arr[index];
    }
    
    function getBalance(address addr) public view returns (uint) {
        return balances[addr];
    }
}
```

---

## 💡 最佳实践

1. **类型安全**：明确变量类型，避免隐式转换陷阱
2. **溢出检查**：使用 Solidity 0.8+ 的内置溢出检查
3. **三元运算符**：谨慎使用，确保两个分支类型兼容
4. **delete 操作**：理解不同类型的删除行为差异
5. **数组操作**：删除数组元素后注意"空洞"问题

---

*参考文档：[Solidity 官方文档 - 运算符](https://docs.soliditylang.org/zh-cn/latest/types.html)*