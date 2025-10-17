---
title: 递归映射-官方示例讲解
category:
  - 以太坊
  - Solidity
---

# 递归映射-官方示例讲解

```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.8;

struct IndexValue { uint keyIndex; uint value; }
struct KeyFlag { uint key; bool deleted; }

struct itmap {
    mapping(uint => IndexValue) data;
    KeyFlag[] keys;
    uint size;
}

type Iterator is uint;

library IterableMapping {
    function insert(itmap storage self, uint key, uint value) internal returns (bool replaced) {
        uint keyIndex = self.data[key].keyIndex;    // 从映射中获取该key对应的索引值（如果key不存在则为0）
        self.data[key].value = value;               // 无论key是否存在，都直接设置或更新其对应的value值
        if (keyIndex > 0)                          // 如果keyIndex大于0，说明该key已经存在于映射中
            return true;                           // 返回true表示这是一个替换操作（更新现有key的值）
        else {                                     // 否则说明这是一个新key
            keyIndex = self.keys.length;           // 获取keys数组的当前长度，这将成为新元素在数组中的索引位置
            self.keys.push();                      // 在keys数组末尾添加一个新的空元素（此时该元素的key和deleted字段都是默认值）
            self.data[key].keyIndex = keyIndex + 1; // 设置该key在mapping中的keyIndex为数组索引+1（+1是为了区分存在和不存在，因为0表示不存在）
            self.keys[keyIndex].key = key;         // 将实际的key值存储到keys数组中刚刚创建的位置
            self.size++;                           // 增加映射中有效元素的计数
            return false;                          // 返回false表示这是一个插入操作（添加新key）
        }
    }

    function remove(itmap storage self, uint key) internal returns (bool success) {
        uint keyIndex = self.data[key].keyIndex;
        if (keyIndex == 0)
            return false;
        delete self.data[key];
        self.keys[keyIndex - 1].deleted = true;
        self.size --;
    }

    function contains(itmap storage self, uint key) internal view returns (bool) {
        return self.data[key].keyIndex > 0;
    }

    function iterateStart(itmap storage self) internal view returns (Iterator) {
        return iteratorSkipDeleted(self, 0);
    }

    function iterateValid(itmap storage self, Iterator iterator) internal view returns (bool) {
        return Iterator.unwrap(iterator) < self.keys.length;
    }

    function iterateNext(itmap storage self, Iterator iterator) internal view returns (Iterator) {
        return iteratorSkipDeleted(self, Iterator.unwrap(iterator) + 1);
    }

    function iterateGet(itmap storage self, Iterator iterator) internal view returns (uint key, uint value) {
        uint keyIndex = Iterator.unwrap(iterator);
        key = self.keys[keyIndex].key;
        value = self.data[key].value;
    }

    function iteratorSkipDeleted(itmap storage self, uint keyIndex) private view returns (Iterator) {
        while (keyIndex < self.keys.length && self.keys[keyIndex].deleted)
            keyIndex++;
        return Iterator.wrap(keyIndex);
    }
}

// 如何使用
contract User {
    // 只是一个保存我们数据的结构体。
    itmap data;
    // 对数据类型应用库函数。
    using IterableMapping for itmap;

    // 插入一些数据
    function insert(uint k, uint v) public returns (uint size) {
        // 这将调用 IterableMapping.insert(data, k, v)
        data.insert(k, v);
        // 我们仍然可以访问结构中的成员，
        // 但我们应该注意不要乱动他们。
        return data.size;
    }

    // 计算所有存储数据的总和。
    function sum() public view returns (uint s) {
        for (
            Iterator i = data.iterateStart();
            data.iterateValid(i);
            i = data.iterateNext(i)
        ) {
            (, uint value) = data.iterateGet(i);
            s += value;
        }
    }
}
```

## 核心数据结构

### 1. IndexValue 结构体
```solidity
struct IndexValue { uint keyIndex; uint value; }
```
- `keyIndex`：键在keys数组中的位置索引（从1开始，0表示不存在）
- `value`：存储的实际数值

### 2. KeyFlag 结构体
```solidity
struct KeyFlag { uint key; bool deleted; }
```
- `key`：实际的键值
- `deleted`：标记该键是否已被删除（软删除机制）

### 3. itmap 结构体
```solidity
struct itmap {
    mapping(uint => IndexValue) data;  // 主要的映射存储
    KeyFlag[] keys;                    // 键的数组，用于迭代
    uint size;                         // 当前有效元素数量
}
```

## 设计巧思

这个设计巧妙地解决了Solidity中mapping无法迭代的问题：
- **data映射**：提供O(1)的查找、插入、删除操作
- **keys数组**：记录所有键的顺序，使迭代成为可能
- **keyIndex**：连接mapping和array，keyIndex-1就是在keys数组中的实际位置

## 主要功能函数

### 1. insert() - 插入操作
```solidity
function insert(itmap storage self, uint key, uint value) internal returns (bool replaced)
```
- 如果键已存在（`keyIndex > 0`），更新值并返回true
- 如果是新键，在keys数组末尾添加新元素，size增加，返回false

### 2. remove() - 删除操作
```solidity
function remove(itmap storage self, uint key) internal returns (bool success)
```
- 采用**软删除**：只标记`deleted = true`，不实际移除数组元素
- 避免了数组重排的高昂gas成本
- 删除data映射中的条目，size减少

### 3. 迭代器系统

#### iterateStart() - 开始迭代
返回第一个未删除元素的迭代器

#### iterateValid() - 检查迭代器有效性
判断迭代器是否还在有效范围内

#### iterateNext() - 获取下一个迭代器
跳过已删除的元素，返回下一个有效位置

#### iterateGet() - 获取当前元素
根据迭代器位置返回对应的键值对

#### iteratorSkipDeleted() - 跳过删除元素
这是核心辅助函数，确保迭代器总是指向未删除的元素

## 使用示例解析

```solidity
contract User {
    itmap data;
    using IterableMapping for itmap;
    
    function insert(uint k, uint v) public returns (uint size) {
        data.insert(k, v);  // 调用库函数
        return data.size;
    }
    
    function sum() public view returns (uint s) {
        // 标准的迭代模式
        for (
            Iterator i = data.iterateStart();
            data.iterateValid(i);
            i = data.iterateNext(i)
        ) {
            (, uint value) = data.iterateGet(i);
            s += value;
        }
    }
}
```

## 优势与特点

1. **高效查找**：O(1)时间复杂度的查找和更新
2. **可迭代性**：支持遍历所有元素
3. **内存效率**：软删除避免了数组重排
4. **gas优化**：删除操作不需要移动大量数据
5. **类型安全**：使用自定义Iterator类型防止错误

## 潜在缺陷

1. **内存泄漏**：删除的元素仍占用keys数组空间
2. **迭代效率**：需要跳过删除的元素，可能影响遍历性能
3. **无清理机制**：没有提供压缩数组的功能

这个库非常适合需要频繁查找但偶尔需要遍历的场景，是Solidity中处理可迭代映射的经典解决方案。