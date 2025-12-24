# RuoYi-Nest React 前端项目

基于 React 19 + TypeScript 5.9 + Vite 7 + React Router 7 + TanStack Query 5 + Axios 1.12 + Tailwind CSS 4 + Radix UI + shadcn/ui + React Hook Form 7 + Zod 4 + TanStack Table 8 构建的现代化前端管理系统，采用前后端分离架构，与 NestJS 后端服务协同工作。

## 📋 目录

- [1. 项目技术选型](#1-项目技术选型)
- [2. 项目主要功能介绍](#2-项目主要功能介绍)
- [3. 各种技术在项目中的主要用途](#3-各种技术在项目中的主要用途)
- [4. 项目目录结构介绍](#4-项目目录结构介绍)
- [5. 项目开发规范介绍](#5-项目开发规范介绍)
- [6. 主要功能实现介绍](#6-主要功能实现介绍)

## 1. 项目技术选型

### 核心框架

- **React 19.1.1**: 用于构建用户界面的 JavaScript 库
- **TypeScript 5.9.3**: 提供类型安全的 JavaScript 超集

### 构建工具

- **Vite 7.1.7**: 现代化前端构建工具，提供快速的开发体验
- **@vitejs/plugin-react 5.0.4**: Vite 的 React 插件

### 路由管理

- **react-router-dom 7.9.4**: 用于单页应用的路由管理

### 状态管理与数据获取

- **@tanstack/react-query 5.62.9**: 用于服务端状态管理和数据获取

### HTTP 客户端

- **axios 1.12.2**: 基于 Promise 的 HTTP 客户端

### UI 框架与样式

- **Tailwind CSS 4.1.14**: 实用优先的 CSS 框架
- **@tailwindcss/vite 4.1.14**: Tailwind CSS 的 Vite 插件
- **Radix UI**: 无样式、可访问的 UI 组件库
  - `@radix-ui/react-dialog`: 对话框组件
  - `@radix-ui/react-select`: 选择器组件
  - `@radix-ui/react-dropdown-menu`: 下拉菜单组件
  - `@radix-ui/react-popover`: 弹出框组件
  - `@radix-ui/react-tooltip`: 工具提示组件
  - `@radix-ui/react-checkbox`: 复选框组件
  - `@radix-ui/react-radio-group`: 单选按钮组
  - `@radix-ui/react-switch`: 开关组件
  - `@radix-ui/react-label`: 标签组件
  - `@radix-ui/react-separator`: 分隔线组件
  - `@radix-ui/react-avatar`: 头像组件
  - `@radix-ui/react-hover-card`: 悬停卡片组件
  - `@radix-ui/react-collapsible`: 折叠组件
  - `@radix-ui/react-accordion`: 手风琴组件
  - `@radix-ui/react-slot`: 插槽组件
- **shadcn/ui**: 基于 Radix UI 和 Tailwind CSS 的组件库

### 表单处理

- **react-hook-form 7.65.0**: 高性能、灵活的表单库
- **zod 4.1.12**: TypeScript 优先的 Schema 验证库
- **@hookform/resolvers 5.2.2**: React Hook Form 的验证器解析器

### 数据表格

- **@tanstack/react-table 8.21.3**: 强大的表格库，支持排序、过滤、分页等功能

### 主题管理

- **next-themes 0.4.6**: 用于管理明暗主题切换

### 日期处理

- **date-fns 4.1.0**: 现代 JavaScript 日期工具库
- **react-day-picker 9.11.1**: React 日期选择器组件

### 数据可视化

- **recharts 2.15.4**: 基于 React 的图表库

### 通知与反馈

- **sonner 2.0.7**: 轻量级的 Toast 通知库

### 图标库

- **lucide-react 0.545.0**: 精美的图标库

### 工具库

- **class-variance-authority 0.7.1**: 用于管理组件变体
- **clsx 2.1.1**: 用于条件性地构造 className 字符串
- **tailwind-merge 3.3.1**: 用于合并 Tailwind CSS 类名
- **qs 6.14.0**: 查询字符串解析和序列化库

### 代码质量工具

- **ESLint 9.36.0**: JavaScript/TypeScript 代码检查工具
- **TypeScript ESLint 8.45.0**: TypeScript 的 ESLint 插件
- **Prettier 3.6.2**: 代码格式化工具
- **prettier-plugin-tailwindcss 0.7.2**: Prettier 的 Tailwind CSS 插件

## 2. 项目主要功能介绍

### 2.1 用户认证模块

- **登录功能**: 用户通过账号和密码登录系统
- **注册功能**: 新用户注册账号
- **Token 自动刷新**: 当 Access Token 过期时，自动使用 Refresh Token 刷新，无需重新登录
- **路由守卫**: 未登录用户访问受保护页面时自动跳转到登录页

### 2.2 仪表盘

- **数据可视化**: 展示各种图表，包括柱状图、横向柱状图、多系列柱状图和面积图

### 2.3 系统管理模块

- **用户管理**:
  - 用户列表展示（支持筛选、搜索、排序）
  - 新增用户
  - 编辑用户信息
  - 删除用户（单个和批量）
  - 重置用户密码
  - 启用/禁用用户状态
- **部门管理**: 部门信息的增删改查
- **菜单管理**: 系统菜单的配置和管理
- **角色管理**: 角色的创建、编辑、删除和权限分配
- **字典管理**:
  - 字典类型管理
  - 字典数据管理

### 2.4 个人资料

- **查看个人信息**: 显示用户基本信息、角色、权限等
- **编辑个人信息**: 修改姓名、邮箱、性别、头像等信息

### 2.5 权限控制

- **基于权限的按钮显示**: 根据用户权限动态显示/隐藏功能按钮
- **路由权限**: 根据用户权限动态生成可访问的路由

### 2.6 主题切换

- **明暗主题**: 支持明暗主题切换，主题偏好保存在本地存储

### 2.7 响应式设计

- **移动端适配**: 使用 Tailwind CSS 响应式工具类实现移动端和桌面端的适配

## 3. 各种技术在项目中的主要用途

### 3.1 React 19

- **函数式组件**: 所有组件均采用函数式组件编写
- **Hooks 状态管理**:
  - `useState`: 管理组件内部状态（如对话框开关、表单数据、筛选条件等）
  - `useEffect`: 处理副作用（数据加载、主题切换监听等）
  - `useMemo`: 缓存计算结果，优化性能
  - `useCallback`: 缓存函数引用，避免不必要的重渲染
  - `useRef`: 获取 DOM 引用或保存可变值
- **组件化开发**: 将 UI 拆分为可复用的组件

### 3.2 TypeScript 5.9

- **类型安全**: 为所有代码提供类型检查，减少运行时错误
- **类型定义**: 定义接口和类型别名（如 `UserInfo`、`RouterItem`、`Filters` 等）
- **类型推断**: 利用 TypeScript 的类型推断能力，减少类型注解
- **路径别名**: 使用 `@/*` 指向 `src/` 目录，简化导入路径

### 3.3 Vite 7

- **快速开发**: 提供极速的 HMR（热模块替换）体验
- **构建优化**: 使用 Rollup 进行生产构建，生成优化的生产代码
- **代理配置**: 配置开发服务器代理，解决跨域问题

### 3.4 React Router 7

- **动态路由**: 根据后端返回的路由数据（`getRouters` API）动态生成路由配置
- **路由守卫**: 通过 `RequireAuth` 组件实现权限验证，未登录用户自动跳转登录页
- **嵌套路由**: 使用 `Outlet` 实现布局嵌套，`AppLayout` 包裹所有业务页面
- **编程式导航**: 使用 `useNavigate` 进行页面跳转（如登录成功后跳转首页）

### 3.5 TanStack Query 5

- **服务端状态管理**: 统一管理所有 API 请求和响应数据
- **自动缓存**: 自动缓存查询结果，减少重复请求
- **请求去重**: 相同查询键的请求自动去重，避免并发重复请求
- **查询失效**: 使用 `invalidateQueries` 在数据更新后强制刷新（如登录后刷新用户信息）
- **条件查询**: 使用 `enabled` 选项控制查询是否执行（如 `useInfoQuery(!!token)`）

### 3.6 Axios 1.12

- **HTTP 请求**: 统一的 HTTP 客户端，封装所有 API 请求
- **请求拦截器**: 自动在请求头中注入 `Authorization: Bearer ${token}`
- **响应拦截器**:
  - 处理 401 错误，自动刷新 Access Token
  - 刷新成功后自动重试原请求
  - 刷新失败时清除 Token 并跳转登录页
  - 统一错误提示（通过 `sonner` 显示 Toast）
- **Token 管理**: 内存存储 Access Token，Refresh Token 通过 HttpOnly Cookie 存储

### 3.7 Tailwind CSS 4

- **原子化 CSS**: 使用工具类快速构建 UI，无需编写自定义 CSS
- **响应式布局**: 使用 `sm:`、`md:`、`lg:` 等前缀实现响应式设计
- **主题定制**: 通过 CSS 变量定义主题色彩，支持明暗主题切换
- **暗色模式**: 使用 `.dark` 类切换暗色主题

### 3.8 Radix UI + shadcn/ui

- **无样式组件基础**: Radix UI 提供功能完整但无样式的 UI 组件
- **样式封装**: shadcn/ui 基于 Radix UI 和 Tailwind CSS 封装样式
- **无障碍访问**: 所有组件遵循 WAI-ARIA 标准，支持键盘导航和屏幕阅读器

### 3.9 React Hook Form 7

- **表单状态管理**: 使用 `useForm` 管理表单状态（值、错误、提交状态等）
- **性能优化**: 非受控组件模式，减少不必要的重渲染
- **字段注册**: 使用 `register` 注册表单字段，自动处理值变化和验证
- **表单提交**: 使用 `handleSubmit` 处理表单提交，自动验证和错误处理
- **验证模式**: 使用 `mode: "onBlur"` 实现失焦验证，提升用户体验

### 3.10 Zod 4

- **Schema 验证**: 定义表单数据的验证规则（如 `LoginSchema`、`ProfileSchema`）
- **类型推断**: 使用 `z.infer<typeof Schema>` 从 Schema 推断 TypeScript 类型
- **与 React Hook Form 集成**: 通过 `zodResolver` 将 Zod Schema 转换为 React Hook Form 验证器

### 3.11 TanStack Table 8

- **表格渲染**: 使用 `useReactTable` 创建表格实例，通过列定义渲染表格
- **列定义**: 使用 `ColumnDef` 定义表格列，支持自定义渲染
- **排序**: 支持列排序功能，点击表头切换排序状态
- **分页**: 集成分页功能，支持客户端分页
- **行选择**: 支持单选和多选，通过 `rowSelection` 状态管理选中行
- **过滤**: 支持列过滤，通过 `filters` 状态管理过滤条件
- **类型安全**: 通过泛型 `<T>` 确保表格数据的类型安全

### 3.12 Sonner

- **Toast 通知**: 用于显示成功、错误、警告等提示信息
- **统一错误处理**: 在 Axios 响应拦截器中统一显示错误提示

### 3.13 Recharts

- **数据可视化**: 在仪表盘页面展示各种图表（柱状图、面积图等）

## 4. 项目目录结构介绍

```
src/
├── components/              # 可复用组件
│   ├── Form/               # 表单组件
│   │   ├── login.tsx       # 登录表单
│   │   └── register.tsx    # 注册表单
│   ├── Table/              # 表格组件
│   │   └── nested-data-table.tsx  # 嵌套数据表格
│   ├── Dialog/             # 对话框组件
│   │   ├── dialog-delete-confirm.tsx           # 删除确认对话框
│   │   ├── dialog-form-change-password.tsx     # 修改密码对话框
│   │   └── dialog-multi-delete-confirm.tsx     # 批量删除确认对话框
│   ├── Chart/              # 图表组件
│   │   ├── bar.tsx         # 柱状图
│   │   ├── bar-horizontal.tsx  # 横向柱状图
│   │   ├── bar-multiple.tsx    # 多系列柱状图
│   │   ├── chart-radar.tsx     # 雷达图
│   │   ├── chat-radial.tsx     # 径向图
│   │   └── chat-tooltip.tsx    # 图表提示框
│   ├── ui/                 # 基础 UI 组件（基于 Radix UI 和 shadcn/ui）
│   │   ├── button.tsx      # 按钮组件
│   │   ├── input.tsx       # 输入框组件
│   │   ├── dialog.tsx     # 对话框组件
│   │   ├── table.tsx       # 表格组件
│   │   └── ...             # 其他 UI 组件
│   ├── app-sidebar.tsx     # 应用侧边栏
│   ├── app-breadcrumb.tsx  # 面包屑导航
│   ├── data-table.tsx      # 数据表格组件
│   ├── data-table-pagination.tsx  # 表格分页组件
│   ├── dict-select.tsx     # 字典选择器
│   ├── single-select.tsx   # 单选下拉框
│   ├── multi-select.tsx   # 多选下拉框
│   ├── tree-select.tsx    # 树形选择器
│   └── ...                 # 其他组件
├── hooks/                  # 自定义 Hooks
│   ├── use-mobile.ts      # 移动端检测 Hook
│   └── usePermission.tsx   # 权限判断 Hook
├── layouts/                # 布局组件
│   ├── AppLayout.tsx       # 应用主布局（包含侧边栏、头部、内容区）
│   └── AuthLayout.tsx      # 认证布局（登录、注册页面布局）
├── lib/                    # 工具库
│   ├── apiClient.ts        # Axios 客户端配置（拦截器、Token 管理）
│   ├── authQueries.ts      # 认证相关查询（用户信息、路由、侧边栏）
│   ├── dictQueries.ts      # 字典数据查询
│   ├── utils.ts            # 工具函数
│   └── validation.ts       # 表单验证 Schema
├── pages/                  # 页面组件
│   ├── Dashboard.tsx       # 仪表盘页面
│   ├── Profile.tsx         # 个人资料页面
│   └── system/             # 系统管理模块
│       ├── userManage/     # 用户管理
│       │   ├── UserManage.tsx
│       │   └── dialog/
│       │       └── add-user.tsx
│       ├── deptManage/     # 部门管理
│       │   ├── DeptManage.tsx
│       │   └── dialog/
│       │       └── add-dept.tsx
│       ├── menuManage/     # 菜单管理
│       │   ├── MenuManage.tsx
│       │   └── dialog/
│       │       └── add-Menu.tsx
│       ├── roleManage/     # 角色管理
│       │   ├── RoleManage.tsx
│       │   └── dialog/
│       │       └── add-role.tsx
│       └── dictManage/     # 字典管理
│           ├── DictManage.tsx
│           ├── DictDataPage.tsx
│           └── dialog/
│               ├── dict-dialog.tsx
│               └── dict-data-dialog.tsx
├── types/                  # TypeScript 类型定义
│   ├── router.ts           # 路由类型定义
│   └── tree.ts             # 树形数据类型定义
├── assets/                 # 静态资源
│   └── react.svg
├── App.tsx                 # 根组件（路由配置、路由守卫）
└── main.tsx                # 应用入口（React 根节点、Provider 配置）
```

## 5. 项目开发规范介绍

### 5.1 命名规范

- **组件命名**: 使用 `PascalCase`，如 `UserManage.tsx`、`AppLayout.tsx`
- **Hook 命名**: 以 `use` 开头，使用 `camelCase`，如 `usePermission.tsx`、`useInfoQuery`
- **工具函数**: 使用 `camelCase`，如 `dictDataToOptions`、`refreshAccessToken`
- **类型定义**: 使用 `PascalCase`，如 `UserInfo`、`RouterItem`、`Filters`
- **常量**: 使用 `UPPER_SNAKE_CASE`，如 `ACCESS_TOKEN`

### 5.2 文件组织规范

- **组件文件**: 每个组件一个文件，文件名与组件名保持一致
- **页面文件**: 页面组件放在 `src/pages/` 目录下，按功能模块组织
- **对话框组件**: 对话框组件放在对应页面的 `dialog/` 子目录下
- **工具函数**: 工具函数放在 `src/lib/` 目录下，按功能分类
- **类型定义**: 类型定义放在 `src/types/` 目录下

### 5.3 表单处理规范

- **表单验证**: 使用 Zod Schema 定义验证规则
- **表单状态**: 使用 React Hook Form 管理表单状态
- **验证模式**: 使用 `mode: "onBlur"` 实现失焦验证
- **错误提示**: 使用 Field 组件的 `FieldError` 显示错误信息

### 5.4 API 调用规范

- **统一客户端**: 所有 API 调用使用 `axiosClient`
- **错误处理**: 在响应拦截器中统一处理错误
- **Token 管理**: Access Token 存储在内存中，Refresh Token 通过 HttpOnly Cookie 存储
- **查询管理**: 使用 TanStack Query 管理 API 查询，利用缓存和自动刷新

### 5.5 UI 组件规范

- **组件复用**: 优先使用 `src/components/ui/` 目录下的基础组件
- **样式类名**: 使用 Tailwind CSS 工具类，避免自定义 CSS
- **响应式设计**: 使用 Tailwind CSS 响应式前缀实现移动端适配
- **无障碍访问**: 使用 Radix UI 组件，确保无障碍访问

## 🔗 相关文档

- [API 接口文档](./API.md) - 前端接口对接说明
- [字典使用指南](./DICT_USAGE.md) - 字典数据的使用方法
- [开发规范](./AGENTS.md) - 项目开发指南

## 📄 许可证

本项目为学习项目，仅供学习交流使用。
