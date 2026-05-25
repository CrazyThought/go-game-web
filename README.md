# 网页围棋 (Go Game Monorepo)

基于 **Vue 3 + TypeScript + Vite 7 (Rolldown)** 的现代网页围棋游戏，采用 Monorepo 架构。

## 技术栈

| 技术              | 版本    |
| --------------- | ----- |
| Vue 3           | ^3.5  |
| TypeScript      | ^5.8  |
| Vite (Rolldown) | ^7.0  |
| Pinia           | ^2.3  |
| Tailwind CSS    | ^3.4  |
| LocalForage     | ^1.10 |
| pnpm            | ^9.0  |

## 项目结构

```
go-game-monorepo/
├── apps/
│   └── web/                 # 主应用
├── packages/
│   ├── core/                # 围棋核心逻辑（落子/提子/打劫/目数）
│   ├── ui/                  # 通用 UI 组件（棋盘/棋子/控制面板）
│   ├── storage/             # 本地存储模块（LocalForage + IndexDB）
│   ├── network/             # 网络通信模块（Supabase 预留）
│   └── ai/                  # AI 对战模块（预留）
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## 环境要求

- **Node.js** >= 20.19
- **pnpm** >= 9.0

## 快速开始

```bash
# 1. 克隆项目
git clone <repo-url>
cd go-game-monorepo

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 打开浏览器访问
# http://localhost:3000
```

## 关键脚本命令

### 开发·

```bash
# 启动开发服务器（热更新）
pnpm dev

# 预览生产构建结果
pnpm preview
```

### 构建

```bash
# 生产构建（Rolldown 打包）
pnpm build

# 等价命令
pnpm build:prod
```

### 类型检查与代码规范

```bash
# TypeScript 类型检查（所有包）
pnpm typecheck

# 代码格式化
pnpm format
```

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
- 棋局保存到本地 IndexDB（LocalForage）
- 棋局导入导出（JSON / SGF 格式）
- 模拟模式（尝试不同走法后决定是否应用）
- 终局死棋标记修正目数
- 键盘快捷键（Ctrl+Z 悔棋、Ctrl+S 保存、Ctrl+N 新局）

## 键盘快捷键

| 快捷键        | 功能   |
| ---------- | ---- |
| `Ctrl + Z` | 悔棋   |
| `Ctrl + S` | 保存棋局 |
| `Ctrl + N` | 新局   |
| `Escape`   | 关闭弹窗 |

## 文档

- [项目总体设计文档](./docs/01-project-documentation.md)
- [具体实现计划](./docs/02-implementation-plan.md)
- [标准操作程序 (SOP)](./docs/03-sop.md)

