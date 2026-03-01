---
title: Next.js + shadcn/ui 项目搭建指令
order: 4
category:
  - 提示词
tag:
  - Web开发
---

<CopyMdButton />

# Next.js + shadcn/ui 项目搭建指令

## 角色

你是一位精通 Next.js、TypeScript、shadcn/ui、Tailwind CSS 的资深全栈工程师。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14+（App Router） |
| UI 组件库 | shadcn/ui + Radix UI |
| 样式 | Tailwind CSS |
| 图标 | Lucide React |
| 状态管理 | React Context / Zustand（可选） |
| 数据模拟 | 本地 Mock 数据 |
| 类型检查 | TypeScript（严格模式） |
| 渲染模式 | 完全 CSR（Client-Side Rendering） |
| 包管理器 | pnpm |

---

## 项目结构

按以下目录结构完整搭建项目，不得省略任何文件：

```
src/
├── app/
│   ├── globals.css               # 全局样式 + Tailwind 指令
│   ├── layout.tsx                # 根布局（含 Toaster）
│   ├── page.tsx                  # 首页 / 仪表盘
│   ├── login/
│   │   └── page.tsx              # 登录页面
│   └── students/
│       └── page.tsx              # 学生列表页面
├── components/
│   ├── ui/                       # shadcn/ui 自动生成组件（勿手动修改）
│   ├── layout/
│   │   ├── header.tsx            # 顶部导航栏
│   │   ├── sidebar.tsx           # 左侧导航栏
│   │   └── dashboard-layout.tsx  # 整体布局容器
│   ├── auth/
│   │   └── login-form.tsx        # 登录表单组件
│   └── students/
│       ├── students-table.tsx    # 学生数据表格
│       └── students-filters.tsx  # 搜索筛选栏
├── lib/
│   ├── utils.ts                  # cn() 等工具函数
│   ├── mock-data.ts              # Mock 数据（学生 + 用户）
│   └── auth.ts                  # 认证逻辑（登录 / 登出 / 状态检查）
├── hooks/
│   ├── use-auth.ts               # 认证状态 Hook
│   └── use-students.ts           # 学生数据 Hook（含搜索 / 分页）
└── types/
    ├── auth.ts                   # 用户 / 认证相关类型
    └── student.ts                # 学生相关类型
```

---

## 数据类型定义

### 学生类型 `types/student.ts`

```typescript
export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  age: number;
  status: 'active' | 'inactive';
  enrollDate: string;
  avatar?: string;
}

export type StudentStatus = Student['status'];
```

### 用户类型 `types/auth.ts`

```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'teacher';
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

---

## Mock 数据要求 `lib/mock-data.ts`

- 学生数据：生成 **50 条**，覆盖所有年级（一年级 ~ 六年级）、active / inactive 两种状态
- 用户数据：生成 **2 条**，分别为 admin 和 teacher 角色
- 登录账号：`admin / 123456`、`teacher / 123456`

---

## 功能模块要求

### 1. 认证模块

- 登录表单：用户名 + 密码，含表单验证（不能为空，密码 ≥ 6 位）
- 登录成功后跳转到 `/`，失败时显示错误提示
- 用户信息持久化到 `localStorage`
- 所有 `/students`、`/` 页面需要登录才能访问，未登录自动跳转 `/login`
- 顶部导航栏右侧显示当前用户名和登出按钮

### 2. 学生管理模块

- 表格列：头像、姓名、邮箱、年级、年龄、状态（Badge）、入学日期、操作
- 操作列：查看详情（Dialog）、编辑（Toast 提示 Mock）、删除（确认后从列表移除）
- 搜索：按姓名实时过滤（防抖 300ms）
- 筛选：按年级下拉筛选、按状态下拉筛选
- 分页：每页支持 10 / 20 / 50 条切换，显示总条数
- 表格列支持点击排序（姓名、年龄、入学日期）

### 3. 仪表盘首页

- 统计卡片（4 个）：学生总数、活跃学生数、本月新增、非活跃学生数
- 每个卡片显示数值、环比变化趋势（↑ / ↓）
- 快捷入口：跳转学生列表、添加学生（Mock）
- 最近添加的学生列表（最新 5 条）

---

## 页面设计规范

### 登录页 `/login`

- 整页居中卡片布局，背景使用渐变色
- Card 宽度 `max-w-md`，含 Logo 占位、标题、表单
- 提交按钮显示 loading 状态

### 学生列表页 `/students`

- 顶部：页面标题 + 新增学生按钮（右对齐）
- 搜索栏 + 筛选器横向排列
- 表格下方分页组件居中

### 仪表盘 `/`

- 顶部统计卡片 Grid 布局（桌面 4 列，平板 2 列，手机 1 列）
- 下方快捷操作 + 最近学生列表左右分栏

---

## shadcn/ui 组件安装

```bash
# 基础
npx shadcn-ui@latest add button input card table form label

# 布局
npx shadcn-ui@latest add sheet separator scroll-area

# 交互
npx shadcn-ui@latest add dialog dropdown-menu select pagination

# 反馈
npx shadcn-ui@latest add toast alert badge avatar

# 其他
npx shadcn-ui@latest add skeleton tooltip
```

---

## Next.js 配置 `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

---

## 代码规范要求

- 所有页面和组件顶部添加 `'use client'`
- 组件使用函数式写法 + TypeScript 明确标注 Props 类型
- 禁止使用 `any`，所有类型必须明确定义
- 样式只使用 Tailwind CSS，禁止内联 style
- 图标只使用 `lucide-react`，禁止引入其他图标库
- 所有异步操作需要处理 loading 和 error 状态
- 表单使用 `react-hook-form` + `zod` 做验证

---

## 开发阶段

按以下顺序完成，每个阶段结束后确保可以正常运行：

```
Phase 1：项目初始化
  ├── pnpm create next-app 创建项目
  ├── 安装并配置 shadcn/ui
  ├── 配置 Tailwind CSS 主题色
  └── 搭建目录结构 + 类型定义

Phase 2：基础布局
  ├── 实现 Header、Sidebar、DashboardLayout
  ├── 配置路由结构
  └── 添加响应式适配

Phase 3：认证系统
  ├── 实现 Mock 登录逻辑
  ├── 完成登录页面 UI
  └── 添加路由守卫

Phase 4：学生管理
  ├── 完成学生列表页面
  ├── 实现搜索、筛选、排序、分页
  └── 实现查看详情、删除功能

Phase 5：仪表盘
  ├── 完成统计卡片
  ├── 快捷操作入口
  └── 最近学生列表
```

---

## 交付要求

- 所有文件完整输出，不得使用 `// ...省略` 或 `// TODO` 占位
- 项目启动命令：`pnpm dev`，访问 `http://localhost:3000` 可正常运行
- 登录后可正常访问所有页面，未登录自动跳转登录页