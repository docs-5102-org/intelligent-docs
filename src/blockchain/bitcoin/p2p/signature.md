---
title: 数字签名
category:
  - 区块链
  - 数字签名
---

# 比特币数字签名指南

## 1. 数字签名基础概念

### 1.1 什么是数字签名？

**数字签名**（Digital Signature）是基于公钥密码学的安全技术，是数字世界中的"电子印章"。它在比特币系统中发挥着验证交易合法性和防止双重支付的核心作用。

### 1.2 数字签名的三大安全特性

- **身份验证**：证明签名者的真实身份
- **数据完整性**：确保交易内容未被篡改  
- **不可抵赖性**：签名者无法否认已签名的交易

### 1.3 传统加密 vs 数字签名

| 特性 | 传统公钥加密 | 数字签名 |
|------|--------------|----------|
| 加密方 | 公钥加密 | 私钥签名 |
| 解密方 | 私钥解密 | 公钥验证 |
| 主要目的 | 保护消息机密性 | 验证身份和完整性 |

## 2. 比特币中的数字签名应用

### 2.1 核心功能

在比特币网络中，数字签名实现四个关键功能：

1. **所有权证明** - 通过签名证明拥有特定UTXO
2. **转账授权** - 授权将比特币转移给指定接收方
3. **防止双花** - 确保同一笔资金不被重复使用
4. **交易验证** - 让全网节点能够验证交易合法性

### 2.2 密钥体系结构

```
比特币密钥体系
├── 私钥 (Private Key)
│   ├── 256位随机数
│   ├── 绝对保密，控制资金
│   └── 用于签名交易
└── 公钥 (Public Key)  
    ├── 由私钥生成（椭圆曲线算法）
    ├── 可以公开分享
    └── 用于验证签名
```

## 3. 地址生成与交易签名流程

### 3.1 从私钥到比特币地址

```
生成流程：私钥 → 公钥 → 公钥哈希 → 比特币地址
         256位   椭圆曲线   RIPEMD160   Base58编码
         随机数   算法生成   哈希运算    (1开头)
```

### 3.2 完整交易签名流程

#### 场景：Alice向Bob发送1 BTC

**第一步：构造交易**
- 输入：Alice控制的UTXO
- 输出：Bob的比特币地址 + 1 BTC
- 手续费：网络处理费用

**第二步：生成数字签名**
```
签名生成过程：
1. 计算交易数据的哈希值
2. 用Alice的私钥对哈希值签名
3. 生成签名对 (r, s)
4. 将签名附加到交易
```

**第三步：广播到网络**
交易包含：
- 交易详细信息
- 数字签名
- Alice的公钥

**第四步：网络验证**
```
节点验证步骤：
1. 用Alice的公钥验证数字签名
2. 确认签名匹配交易哈希
3. 检查UTXO存在且未被使用
4. 验证通过后加入交易池
```

## 4. 签名算法技术详解

### ECDSA椭圆曲线数字签名算法

比特币采用的签名标准：

**技术参数**
- 椭圆曲线：secp256k1
- 私钥长度：256位
- 公钥长度：33字节（压缩）/ 65字节（非压缩）
- 签名长度：70-72字节

**技术优势**
- 高安全性：256位私钥 ≈ 3072位RSA安全强度
- 高效率：计算速度快，适合区块链环境
- 紧凑性：签名体积相对较小

### 代码实现示例

```js
const bitcoin = require('bitcoinjs-lib');

let
    message = 'a secret message!', // 原始消息
    hash = bitcoin.crypto.sha256(message), // 消息哈希
    wif = 'KwdMAjGmerYanjeui5SHS7JkmpZvVipYvB2LJGU1ZxJwYvP98617',
    keyPair = bitcoin.ECPair.fromWIF(wif);
// 用私钥签名:
let signature = keyPair.sign(hash).toDER(); // ECSignature对象
// 打印签名:
console.log('signature = ' + signature.toString('hex'));
// 打印公钥以便验证签名:
console.log('public key = ' + keyPair.getPublicKeyBuffer().toString('hex'));
```

#### 签名验证

ECSignature对象可序列化为十六进制表示的字符串。

在获得签名、原始消息和公钥的基础上，可以对签名进行验证。验证签名需要先构造一个不含私钥的ECPair，然后调用verify()方法验证签名

```js
const bitcoin = require('bitcoinjs-lib');

let signAsStr = '304402205d0b6e817e01e22ba6ab19c0'
              + 'ab9cdbb2dbcd0612c5b8f990431dd063'
              + '4f5a96530220188b989017ee7e830de5'
              + '81d4e0d46aa36bbe79537774d56cbe41'
              + '993b3fd66686'

let
    signAsBuffer = Buffer.from(signAsStr, 'hex'),
    signature = bitcoin.ECSignature.fromDER(signAsBuffer), // ECSignature对象
    message = 'a secret message!', // 原始消息
    hash = bitcoin.crypto.sha256(message), // 消息哈希
    pubKeyAsStr = '02d0de0aaeaefad02b8bdc8a01a1b8b11c696bd3d66a2c5f10780d95b7df42645c',
    pubKeyAsBuffer = Buffer.from(pubKeyAsStr, 'hex'),
    pubKeyOnly = bitcoin.ECPair.fromPublicKeyBuffer(pubKeyAsBuffer); // 从public key构造ECPair

// 验证签名:
let result = pubKeyOnly.verify(hash, signature);
console.log('Verify result: ' + result);

```

:::tip
上述代码只引入了公钥，并没有引入私钥。
修改signAsStr、message和pubKeyAsStr的任意一个变量的任意一个字节，再尝试验证签名，看看是否通过。
比特币对交易数据进行签名和对消息进行签名的原理是一样的，只是格式更加复杂。对交易签名确保了只有持有私钥的人才能够花费对应地址的资金。
:::

### 4.2 Schnorr签名（技术演进）

比特币未来可能采用的先进算法：
- **更高效率** - 签名验证速度更快
- **更小体积** - 节省区块链存储空间  
- **更强隐私** - 支持签名聚合技术
- **更好可扩展性** - 支持复杂的多重签名方案

## 5. 安全特性深度分析

### 5.1 不可伪造性（Cryptographic Unforgeability）

**技术原理**：基于椭圆曲线离散对数难题
- 即使拥有公钥和历史签名，也无法推导出私钥
- 没有私钥就无法生成新的有效签名
- 暴力破解需要2^128次运算（实际不可行）

### 5.2 消息完整性（Message Integrity）

**保护机制**：任何微小改动都会导致验证失败
- 交易金额修改 → 签名失效
- 接收地址改变 → 签名失效
- 手续费调整 → 签名失效
- 时间戳篡改 → 签名失效

### 5.3 不可抵赖性（Non-repudiation）

**法律效力**：数学证明胜过传统合同
- 签名验证 = 数学证明签名者身份
- 区块链永久记录，无法删除
- 提供完整的审计追踪链条

## 6. 高级应用：多重签名

### 6.1 多重签名基本概念

多重签名（MultiSig）需要多个私钥共同授权交易，提供更高安全性。

**常见配置**
- **2-of-3**：3个密钥中需要2个签名
- **3-of-5**：5个密钥中需要3个签名  
- **M-of-N**：N个密钥中需要M个签名

### 6.2 实际应用场景

**企业资金管理**
- 公司账户需要多位高管共同签名
- 防止单点故障和内部欺诈
- 提供职责分离和制衡机制

**个人资产保护**  
- 分散私钥存储风险
- 防止单一设备丢失导致资产损失
- 家庭成员间的资产共管

### 6.3 多重签名交易示例

```json
{
  "inputs": [
    {
      "previous_tx": "a1b2c3d4e5f6...",
      "output_index": 0,
      "signatures": [
        "304502210...",  // 第一个签名
        "304402201...",  // 第二个签名
        null             // 第三个位置为空（2-of-3）
      ],
      "public_keys": [
        "03a1b2c3...",   // 第一个公钥
        "02d4e5f6...",   // 第二个公钥  
        "03g7h8i9..."    // 第三个公钥
      ]
    }
  ],
  "outputs": [
    {
      "value": 100000000,  // 1 BTC
      "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
    }
  ]
}
```

## 7. 小结

私钥可以对消息进行签名，签名可以保证消息防伪造，防篡改，防抵赖。
