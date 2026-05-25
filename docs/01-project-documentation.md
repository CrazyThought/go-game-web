# 项目架构文档

## 1. 概述

网页围棋（Go Game Monorepo）是一个基于 Vue 3 + TypeScript + Vite 7 (Rolldown) 的现代网页围棋游戏，采用 pnpm Workspace Monorepo 架构。项目实现完整的围棋规则（落子、提子、打劫、中国数子法），支持本地存储、棋局导入导出、模拟复盘等功能。

## 2. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.5 | 前端框架（Composition API + SFC） |
| TypeScript | ^5.8 | 类型安全 |
| Vite (Rolldown) | ^7.0 | 构建工具 |
| Pinia | ^2.3 | 状态管理 |
| Tailwind CSS | ^3.4 | 原子化 CSS |
| LocalForage | ^1.10 | IndexedDB 封装 |
| pnpm | ^9.0 | 包管理器（Workspace） |

## 3. Monorepo 目录结构

```
go-game-monorepo/
├── apps/
│   └── web/                     # Web 应用入口
│       ├── src/
│       │   ├── main.ts          # 应用启动入口
│       │   ├── App.vue          # 根组件（RouterView）
│       │   ├── router/          # 路由配置
│       │   ├── stores/          # Pinia 状态管理
│       │   ├── views/           # 页面级组件
│       │   ├── components/      # 应用级组件（含 modals/）
│       │   ├── composables/     # 组合函数
│       │   └── assets/styles/   # 全局样式
│       ├── index.html
│       ├── vite.config.ts       # 构建配置（含别名映射）
│       └── tailwind.config.js
├── packages/
│   ├── core/                    # 围棋核心引擎
│   │   └── src/
│   │       ├── GoGame.ts        # 主游戏类（状态机）
│   │       ├── board.ts         # 棋盘算法（BFS、提子等）
│   │       ├── territory.ts     # 数子法目数计算
│   │       ├── sgf.ts           # SGF 格式解析/生成
│   │       └── types.ts         # 类型定义与常量
│   ├── ui/                      # 可复用 UI 组件
│   │   └── src/components/
│   │       ├── GoBoard/         # Canvas 棋盘组件
│   │       ├── GameInfo/        # 对局信息面板
│   │       ├── GameControls/    # 操作按钮面板
│   │       └── BoardSizeSelector/ # 棋盘大小选择器
│   ├── storage/                 # 持久化存储
│   │   └── src/GameStorage.ts   # LocalForage CRUD 封装
│   ├── ai/                      # AI 对战（预留）
│   └── network/                 # 网络对战（预留）
├── docs/                        # 项目文档
├── package.json                 # 根配置（脚本总入口）
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## 4. 核心架构分层

### 4.1 游戏引擎层（packages/core）

**GoGame 类** 是整个应用的逻辑核心，采用状态机模式管理一局围棋的完整生命周期：

- **状态管理**：`position` → `playing` → `pass` → `play` → `ko_check` → `capture` → `switch_player`
- **内部数据结构**：`GameState` 包含 `board[][]`、`moveHistory[]`、`capturedStones`、`currentPlayer`、`consecutivePasses` 等
- **规则实现**：打劫检测、自杀检测、提子、双停手检测
- **模拟模式**：`simulationMoves[]` 独立于主 `moveHistory[]`，支持分支探索后应用或丢弃
- **序列化**：`serialize()` / `deserialize()` 支持完整游戏状态 JSON 化

**棋盘算法（board.ts）**：
- `getGroup(pos)` — BFS 广度优先搜索找连通棋子组
- `countLiberties(group)` — 计算气数
- `removeGroup(group, board)` — 提子
- `getStarPoints(size)` — 星位坐标

**数子法（territory.ts）**：
- `calculateTerritory(board, deadStones, komi)` — 基于中国数子法（填空法）计算领地

**SGF 支持（sgf.ts）**：
- `generateSGF(boardSize, moveHistory)` — 生成 SGF 文本
- `parseSGF(sgfText)` — 解析 SGF 为 Move 数组

### 4.2 状态管理层（apps/web/src/stores/）

**gameStore**：
- 封装单个 `GoGame` 实例为 Pinia store
- 通过 `computed` 暴露只读 `gameState`
- 提供 `placeStone`、`undo`、`pass`、`resign`、`reset`、`startSimulation` 等操作

**uiStore**：
- 管理所有 UI 状态标志（弹窗显隐、棋盘大小选择、Toast 通知）
- `showSaveModal`、`showLoadModal`、`showGameOverModal`、`showDeadStoneMarker`、`showNewGameConfirm`、`showExitConfirm`
- `selectedBoardSize`：当前选中的棋盘大小（默认 19×19）
- `toasts[]`：通知队列（自动 3 秒消失）

### 4.3 组合函数层（apps/web/src/composables/）

**useGame()**：
- `handlePlaceStone(pos)` — 落子并检测双停手触发死棋标记
- `handleUndo()`、`handlePass()`、`handleResign()` — 基本操作
- `handleBoardSizeChange(size)` — 设置待定棋盘大小并弹出确认弹窗
- `confirmNewGame()` / `cancelNewGame()` — 新局确认流程
- `handleStartSimulation()` / `handleEndSimulation()` / `handleApplySimulation()` — 模拟控制

**useStorage()**：
- `saveCurrentGame(name, note)` — 保存当前棋局（序列化 + 存储）
- `loadSavedGames(page, keyword)` — 分页查询
- `loadGame(id)` — 加载并反序列化
- `loadFromJSON(json)` / `importFromSGF(sgf)` — 文本导入
- `downloadJSON()` / `downloadSGF()` — 浏览器下载

**useKeyboard()**：
- 全局快捷键：`Ctrl+Z` 悔棋、`Ctrl+S` 保存、`Ctrl+N` 新局、`Escape` 关闭弹窗

### 4.4 视图层

**路由**：
| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | HomeView | 初始页面（开始对局/导入棋局/查看棋局） |
| `/game` | GameView | 游戏主页面 |

**HomeView**（初始页面）：
- 围棋主题视觉（渐变背景、SVG 棋盘图标）
- 三个入口按钮：开始对局、导入棋局、查看现有棋局
- 包含 LoadGameModal 和 SavedGamesModal

**GameView**（游戏主页面）：
- **Top Bar**：返回首页按钮 + 棋盘大小选择 + 游戏状态标签
- **GoBoard**：Canvas 棋盘，支持落子、悬停预览、最后落子标记、模拟步数显示、死棋标记
- **GameInfo**：当前玩家、目数统计、提子数、领地、步数
- **GameControls**：新局、悔棋、停一手、认输、保存棋局、模拟控制
- **模拟历史**：当模拟模式激活时展示模拟步数列表
- **弹窗**：SaveGameModal、LoadGameModal、GameOverModal、NewGameConfirm、ExitConfirmModal

### 4.5 持久化层（packages/storage）

**GameStorage** 单例类：
- 使用 LocalForage 封装 IndexedDB
- 数据库名：`GoGameDB`
- CRUD：`saveGame()`、`getGameById()`、`getAllSavedGames()`、`deleteGame()`
- `SavedGame` 结构：`{ id, name, boardSize, totalMoves, gameData, note, createdAt, updatedAt }`

## 5. 组件通信模式

```
GameView.vue
 ├── <GoBoard> ──(emit: place-stone)──→ useGame.handlePlaceStone() ──→ gameStore.placeStone()
 ├── <GameInfo> ←──(props)── gameStore.gameState
 ├── <GameControls> ──(emit: save/undo/pass/...)──→ useGame.handlers ──→ gameStore
 ├── <BoardSizeSelector> ──(emit: change)──→ useGame.handleBoardSizeChange() ──→ uiStore + gameStore
 ├── <SaveGameModal> ──(emit: save)──→ useStorage.saveCurrentGame()
 ├── <LoadGameModal> ──(props: storage)──→ useStorage
 └── <ExitConfirmModal> ──(emit: confirm)──→ gameStore.reset() + router.push('/')
```

## 6. 数据流

```
用户交互 → UI 组件 emit → composable 处理 → Pinia store 操作 → GoGame 引擎计算 → computed 响应 → UI 更新
```

- **单向数据流**：State → View → Action → State
- **引擎与 UI 分离**：GoGame（纯逻辑） → gameStore（Pinia 桥接） → Vue 组件（响应式渲染）
- **持久化**：gameStore 序列化 ↔ GameStorage（IndexedDB）

## 7. GoBoard Canvas 渲染架构

**GoBoard** 是核心渲染组件，使用 Canvas 2D API 绘制棋盘：

- **尺寸计算**：根据容器宽度动态计算 `cellSize` 和 `boardPixelSize`
- **DPR 适配**：`canvas.width = boardPixelSize * dpr`，通过 `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` 统一缩放
- **坐标转换**：`worldToBoard(clientX, clientY)` — 物理屏幕坐标 → Canvas CSS 坐标 → 棋盘逻辑坐标
- **绘制层次**：背景 → 网格线 → 星位点 → 棋子（径向渐变） → 最后落子标记 → 死棋标记（红色虚线） → 模拟步数标签 → 悬停预览
- **响应式**：`ResizeObserver` 监听容器宽度变化自动重绘
- **玩家颜色适配**（新增）：通过 `currentPlayer` prop 控制悬停预览颜色
