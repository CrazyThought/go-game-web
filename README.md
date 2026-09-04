# 网页围棋 (Go Game Monorepo)

基于 **Vue 3 + Next.js 14 (BFF) + TypeScript + Supabase** 的全栈网页围棋应用，采用 pnpm Workspace Monorepo 架构。

## 技术栈

| 技术                  | 版本  | 用途                         |
| --------------------- | ----- | ---------------------------- |
| Vue 3                 | ^3.5  | 前端框架                     |
| TypeScript            | ^5.8  | 类型安全                     |
| Vite (Rolldown)       | ^7.0  | 前端构建工具                 |
| Pinia                 | ^2.3  | 状态管理                     |
| Vue Router            | ^4.5  | 前端路由                     |
| Tailwind CSS          | ^3.4  | 原子化 CSS                   |
| LocalForage           | ^1.10 | IndexedDB 封装（本地持久化） |
| Next.js               | ^14.2 | BFF 服务端（API Routes）     |
| React                 | ^18.3 | Next.js 运行依赖             |
| @supabase/ssr         | ^0.5  | Supabase 服务端客户端        |
| @supabase/supabase-js | ^2.49 | Supabase JS 客户端           |
| Infisical SDK         | ^2.0  | 密钥管理                     |
| pnpm                  | ^9.0  | Workspace Monorepo 包管理    |

## 项目结构

```
go-game-monorepo/
├── apps/
│   ├── web/                 # Vue 3 主应用
│   └── server/              # Next.js 14 BFF（Supabase 代理 / Infisical 密钥）
├── packages/
│   ├── core/                # 围棋核心逻辑（落子/提子/打劫/目数）
│   ├── ui/                  # 通用 UI 组件（棋盘/棋子/控制面板）
│   ├── storage/             # 本地存储模块（LocalForage + IndexedDB）
│   ├── ai/                  # AI 对战（接口 + Mock 实现）
│   └── network/             # 网络通信（接口 + Mock 实现）
├── docs/                    # 项目文档（架构 / 实现计划 / SOP）
├── .husky/                  # Git hooks（pre-commit）
├── .github/                 # CI 工作流（Supabase ping）
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## 环境要求

- **Node.js** >= 20.19
- **pnpm** >= 9.0
- **Supabase 项目**（联机功能预留，通过 BFF 访问）
- **Infisical 项目**（BFF 密钥管理，启动 BFF 时需要）

## 快速开始

```bash
# 1. 克隆项目
git clone <repo-url>
cd go-game-monorepo

# 2. 安装依赖
pnpm install

# 3. 启动前端开发服务器（本地模式，仅依赖 IndexedDB）
pnpm dev
# → http://localhost:3000
```

### 启动 BFF（联机/AI 功能预留）

BFF 默认端口与前端冲突（均为 3000），且需先配置 Infisical 环境变量，建议单独启动：

```bash
# 1. 配置环境变量
cp apps/server/.env.example apps/server/.env.local
# 编辑 apps/server/.env.local，填入 INFISICAL_TOKEN 与 INFISICAL_PROJECT_ID

# 2. 启动 BFF（改端口 3001）
pnpm --filter @go-game/server dev --port 3001
```

> 说明：当前 BFF 的 API Route 均为 501 占位（尚未实现），联机对战功能仍在开发中。

## 关键脚本命令

### 开发

```bash
# 启动开发服务器（热更新）
pnpm dev

# 预览生产构建结果
pnpm preview
```

### 构建

```bash
# 生产构建（所有包：前端 Rolldown + BFF Next.js）
pnpm build

# 等价命令
pnpm build:prod
```

### 类型检查与代码规范

```bash
# TypeScript 类型检查（所有包）
pnpm typecheck

# 代码静态检查（ESLint 9 flat config，覆盖 web + packages）
pnpm lint

# 自动修复可修复的 lint 问题
pnpm lint:fix

# 子包级检查（BFF 使用 Next.js 内置 next lint）
pnpm --filter @go-game/web lint
pnpm --filter @go-game/server lint

# 代码格式化
pnpm format
```

> 已接入 Husky + lint-staged：`git commit` 时会自动对暂存文件执行 `prettier --write` 与 `eslint --fix`，无需手动触发。

### 测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

### 子包操作

```bash
# 仅构建/测试特定包
pnpm --filter @go-game/core build
pnpm --filter @go-game/core test

# 仅启动 web 应用
pnpm --filter @go-game/web dev
```

### 其他

```bash
# 清理构建产物
pnpm clean
```

## 功能

- 支持 9×9 / 13×13 / 19×19 三种棋盘
- 完整围棋规则：落子、提子、打劫、自杀检测
- 中国数子法实时目数计算
- 无限悔棋
- 停一手、认输
- 棋局保存到本地 IndexedDB（LocalForage）
- 棋局导入导出（JSON / SGF 格式）
- 模拟模式（尝试不同走法后决定是否应用）
- 终局死棋标记修正目数
- 键盘快捷键（Ctrl+Z 悔棋、Ctrl+S 保存、Ctrl+N 新局）

## 服务端 (BFF)

Next.js 14 App Router 作为前端与 Supabase 之间的代理层（Backend For Frontend）：

- 密钥管理：通过 Infisical SDK 动态获取 Supabase 密钥，避免客户端暴露 `service_role`
- Supabase 客户端三层模式：`server`（cookie 认证）/ `admin`（绕过 RLS）/ `client`（浏览器）
- API 模块：`auth`（登录/注册/登出/当前用户）、`rooms`（房间/加入/离开/落子）、`ai`（AI 落子）

> 当前所有 API Route 均为 501 占位（尚未实现），联机与 AI 对战仍在开发中。

## 键盘快捷键

| 快捷键     | 功能     |
| ---------- | -------- |
| `Ctrl + Z` | 悔棋     |
| `Ctrl + S` | 保存棋局 |
| `Ctrl + N` | 新局     |
| `Escape`   | 关闭弹窗 |

## 文档

- [项目总体设计文档](./docs/01-project-documentation.md)
- [具体实现计划](./docs/02-implementation-plan.md)
- [标准操作程序 (SOP)](./docs/03-sop.md)
