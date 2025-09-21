---
title: vscode 配置 solidity 开发环境
category:
  - 区块链
  - 以太坊
  - Solidity
---

# vscode 配置 solidity 开发环境

## 🔧 基础环境准备

### 1. 安装 Node.js 和 npm
```bash
# 检查是否已安装
node --version
npm --version

# 如果未安装，访问 https://nodejs.org/ 下载安装
```

### 2. 安装 Git
```bash
# 检查 Git 版本
git --version

# 如果未安装，访问 https://git-scm.com/ 下载安装
```

## 📦 VSCode 扩展安装

### 必装扩展

**1. Solidity (Juan Blanco)**
- **功能**：语法高亮、智能提示、编译支持
- **安装**：在 VSCode 扩展市场搜索 "Solidity" 
- **扩展ID**：`JuanBlanco.solidity`
- **地址**: https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity7


### 推荐扩展

**3. Solidity Visual Developer**
- **功能**：可视化合约结构、UML图生成
- **扩展ID**：`tintinweb.solidity-visual-auditor`

**4. Ethereum Security Bundle**
- **功能**：安全分析工具集
- **扩展ID**：`tintinweb.ethereum-security-bundle`

**5. Rainbow Brackets**
- **功能**：彩色括号匹配
- **扩展ID**：`2gua.rainbow-brackets`

## ⚙️ VSCode 设置配置

### 创建工作区设置
在项目根目录创建 `.vscode/settings.json`：

```json
{
    // Solidity 编译器设置
    "solidity.compileUsingRemoteVersion": "0.8.19",
    "solidity.compileUsingLocalVersion": "",
    
    // 默认编译器（可选：builtin, remote, localFile, localNodeModule）
    "solidity.defaultCompiler": "remote",
    
    // 编译器优化
    "solidity.compiler.optimize": true,
    "solidity.compiler.runs": 200,
    
    // 语言服务器设置
    "solidity.packageDefaultDependenciesContractsDirectory": "contracts",
    "solidity.packageDefaultDependenciesDirectory": "node_modules",
    
    // 代码格式化
    "solidity.formatter": "prettier",
    "solidity.formatOnSave": true,
    
    // 错误和警告
    "solidity.enableLocalNodeImports": true,
    "solidity.monoRepoSupport": true,
    
    // 文件关联
    "files.associations": {
        "*.sol": "solidity"
    },
    
    // 代码提示
    "editor.quickSuggestions": {
        "strings": true
    },
    
    // Prettier 配置
    "[solidity]": {
        "editor.defaultFormatter": "JuanBlanco.solidity",
        "editor.formatOnSave": true,
        "editor.tabSize": 4,
        "editor.insertSpaces": true
    }
}
```

### 全局用户设置
打开 VSCode 设置 (Ctrl/Cmd + ,)，添加：

```json
{
    // Solidity 全局设置
    "solidity.compileUsingRemoteVersion": "latest",
    "solidity.enabledAsYouTypeCompilationErrorCheck": true,
    "solidity.validationDelay": 1500,
    
    // 终端设置
    "terminal.integrated.defaultProfile.windows": "Command Prompt",
    
    // 文件监视
    "files.watcherExclude": {
        "**/node_modules/**": true,
        "**/cache/**": true,
        "**/artifacts/**": true
    }
}
```

## 🛠️ 开发框架安装

### 选项一：Hardhat（推荐）

```bash
# 创建项目目录
mkdir my-solidity-project
cd my-solidity-project

# 初始化 npm 项目
npm init -y

# 安装 Hardhat
npm install --save-dev hardhat

# 初始化 Hardhat 项目（初始化时，要求安装一些依赖）
npx hardhat --init

# 手动安装常用依赖
npm install --save-dev @nomicfoundation/hardhat-toolbox
npm install --save-dev @openzeppelin/contracts
# 或
pnpm install --save-dev "@nomicfoundation/hardhat-toolbox-viem@^5.0.0" "@nomicfoundation/hardhat-ignition@^3.0.0" "@types/node@^22.8.5" "forge-std@foundry-rs/forge-std#v1.9.4" "typescript@~5.8.0" "viem@^2.30.0" "@nomicfoundation/hardhat-network-helpers"
```

> 最新版本的hardhat，要求Node:22.x.x.lts

### 选项二：Foundry

```bash
# 安装 Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 创建新项目
forge init my-solidity-project
cd my-solidity-project

# 安装依赖
forge install OpenZeppelin/openzeppelin-contracts
```

### 选项三：Truffle

```bash
# 全局安装 Truffle
npm install -g truffle

# 创建项目
mkdir my-solidity-project
cd my-solidity-project
truffle init

# 安装 OpenZeppelin
npm install @openzeppelin/contracts
```

## 📁 项目结构示例

### Hardhat 项目结构
```
my-solidity-project/
├── .vscode/
│   └── settings.json
├── contracts/
│   ├── MyContract.sol
│   └── interfaces/
├── test/
│   └── MyContract.test.js
├── scripts/
│   └── deploy.js
├── hardhat.config.js
├── package.json
├── .gitignore
└── README.md
```


## 🎨 代码片段配置

创建 `.vscode/snippets.json`:
```json
{
  "SPDX License": {
    "prefix": "spdx",
    "body": ["// SPDX-License-Identifier: MIT"],
    "description": "SPDX License identifier"
  },
  
  "Pragma Solidity": {
    "prefix": "pragma",
    "body": ["pragma solidity ^0.8.19;"],
    "description": "Solidity version pragma"
  },
  
  "Basic Contract": {
    "prefix": "contract",
    "body": [
      "// SPDX-License-Identifier: MIT",
      "pragma solidity ^0.8.19;",
      "",
      "contract ${1:ContractName} {",
      "    ${2:// Contract body}",
      "}"
    ],
    "description": "Basic contract template"
  },
  
  "Function": {
    "prefix": "function",
    "body": [
      "function ${1:functionName}(${2:params}) ${3:public} ${4:returns (${5:type})} {",
      "    ${6:// Function body}",
      "}"
    ],
    "description": "Function template"
  }
}
```

## 🔍 调试配置

创建 `.vscode/launch.json`:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Run Hardhat Test",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/node_modules/.bin/hardhat",
            "args": ["test"],
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen"
        },
        {
            "name": "Deploy Contract",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/node_modules/.bin/hardhat",
            "args": ["run", "scripts/deploy.js", "--network", "localhost"],
            "console": "integratedTerminal"
        }
    ]
}
```

## 📋 任务配置

创建 `.vscode/tasks.json`:
```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Compile Contracts",
            "type": "shell",
            "command": "npx",
            "args": ["hardhat", "compile"],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Run Tests",
            "type": "shell",
            "command": "npx",
            "args": ["hardhat", "test"],
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Start Local Network",
            "type": "shell",
            "command": "npx",
            "args": ["hardhat", "node"],
            "isBackground": true,
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        }
    ]
}
```

## 🎯 Git 配置

创建 `.gitignore`:
```gitignore
# Dependencies
node_modules/

# Hardhat
cache/
artifacts/

# Environment variables
.env

# IDE
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

## 🧪 示例合约

创建 `contracts/MyToken.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, totalSupply * 10**decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
```

## 🚀 快速开始命令

```bash
# 编译合约
npx hardhat compile

# 运行测试
npx hardhat test

# 启动本地节点
npx hardhat node

# 部署到本地网络
npx hardhat run scripts/deploy.js --network localhost

# 清理编译缓存
npx hardhat clean
```

## 💡 开发技巧

### 1. 使用快捷键
- `Ctrl+Shift+P`: 命令面板
- `F12`: 转到定义
- `Shift+F12`: 查找所有引用
- `Ctrl+/`: 注释/取消注释

### 2. 启用自动保存和格式化
```json
{
    "files.autoSave": "onFocusChange",
    "editor.formatOnSave": true
}
```

### 3. 使用工作区
将相关项目添加到同一个工作区，方便管理多个合约项目。

这样配置后，您就有了一个功能完整的 Solidity 开发环境，可以开始编写、测试和部署智能合约了！