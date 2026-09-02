# 项目架构文档

## 1. 概述

网页围棋（Go Game Monorepo）是一个基于 **Vue 3 + Next.js 14 (BFF) + TypeScript + Supabase** 的全栈围棋应用，采用 **pnpm Workspace Monorepo** 架构。项目实现完整围棋规则（落子、提子、打劫、中国数子法），支持本地 IndexedDB 持久化、棋局导入导出（JSON/SGF）、模拟复盘、Supabase 在线联机对战等功能。

**三层架构**：
```
Vue 3 前端 (apps/web)  →  Next.js BFF (apps/server)  →  Supabase (PostgreSQL + Auth + Realtime)
     Vite dev server            Next.js API Routes              with RLS policies
     :3000                       :3000                           (managed via Infisical)
```

仓库名：`go_game_web`，Git 根目录为 `go-game-monorepo/`。

## 2. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.5 | 前端框架（Composition API + SFC） |
| Vite (Rolldown) | ^7.0 | 前端构建工具（Rolldown 引擎） |
| Next.js | ^14.2 | BFF 服务端（API Routes + Supabase SSR） |
| React | ^18.3 | Next.js 运行依赖（服务器端渲染辅助） |
| TypeScript | ^5.8 | 类型安全 |
| Pinia | ^2.3 | 前端状态管理 |
| Tailwind CSS | ^3.4 | 原子化 CSS |
| LocalForage | ^1.10 | IndexedDB 封装（本地持久化） |
| Supabase | — | 后端即服务（PostgreSQL + Auth + Realtime） |
| @supabase/ssr | ^0.5 | Supabase SSR 客户端（服务端 cookie 读写） |
| @supabase/supabase-js | ^2.49 | Supabase JS 客户端 |
| Infisical SDK | ^2.0 | 密钥管理（SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY 动态注入） |
| Vue Router | ^4.5 | SPA 前端路由 |
| pnpm | ^9.0 | Workspace Monorepo 包管理 |

## 3. Monorepo 目录结构

```
go-game-monorepo/
├── apps/
│   ├── web/                          # Vue 3 前端应用
│   │   ├── src/
│   │   │   ├── main.ts               # 应用启动入口（createApp + router + pinia）
│   │   │   ├── App.vue               # 根组件（RouterView）
│   │   │   ├── router/index.ts       # SPA 路由（/ → HomeView, /game → GameView）
│   │   │   ├── stores/               # Pinia 状态管理
│   │   │   │   ├── gameStore.ts      # 围棋游戏状态（封装 GoGame 实例）
│   │   │   │   └── uiStore.ts        # UI 状态（弹窗、通知、棋盘大小选择）
│   │   │   ├── views/                # 页面级组件
│   │   │   │   ├── HomeView.vue      # 初始页面
│   │   │   │   └── GameView.vue      # 游戏主页面
│   │   │   ├── components/modals/    # 弹窗组件
│   │   │   │   ├── ExitConfirmModal.vue   # 退出确认
│   │   │   │   ├── GameOverModal.vue      # 对局结束
│   │   │   │   ├── LoadGameModal.vue      # 导入棋局（JSON/SGF）
│   │   │   │   ├── NewGameConfirm.vue     # 新局确认
│   │   │   │   ├── SaveGameModal.vue      # 保存棋局
│   │   │   │   └── SavedGamesModal.vue    # 查看已保存棋局列表
│   │   │   ├── composables/          # Vue 组合函数（业务逻辑桥接层）
│   │   │   │   ├── useGame.ts        # 游戏操作（落子、悔棋、停手、模拟控制）
│   │   │   │   ├── useKeyboard.ts    # 全局键盘快捷键
│   │   │   │   └── useStorage.ts     # 存储/导入/导出操作
│   │   │   └── assets/styles/        # 全局样式（Tailwind 基础层）
│   │   ├── index.html
│   │   ├── vite.config.ts            # 构建配置（resolve.alias 包映射，port 3000）
│   │   └── tailwind.config.js
│   └── server/                       # Next.js 14 BFF 服务端
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx        # Next.js 根布局（html → body → children）
│       │   │   ├── page.tsx          # 默认首页（Go Game BFF Server 占位）
│       │   │   └── api/              # API Routes（所有接口返回 501 占位）
│       │   │       ├── auth/
│       │   │       │   ├── register/route.ts   # POST 注册
│       │   │       │   ├── login/route.ts      # POST 登录
│       │   │       │   ├── logout/route.ts     # POST 登出
│       │   │       │   └── me/route.ts         # GET 当前用户
│       │   │       ├── rooms/
│       │   │       │   ├── route.ts            # GET 列表 / POST 创建
│       │   │       │   └── [id]/
│       │   │       │       ├── route.ts        # GET 房间详情
│       │   │       │       ├── join/route.ts   # POST 加入
│       │   │       │       ├── leave/route.ts  # POST 离开
│       │   │       │       └── moves/route.ts  # POST 落子
│       │   │       └── ai/
│       │   │           └── move/route.ts       # POST AI 落子
│       │   └── lib/
│       │       ├── infisical/index.ts  # Infisical SDK 封装（60s 缓存 secrets）
│       │       └── supabase/
│       │           ├── server.ts       # createServerClient（cookie 读写 + Infisical 密钥）
│       │           ├── admin.ts        # createAdminClient（service_role 绕过 RLS）
│       │           └── client.ts       # createBrowserClient（客户端组件）
│       ├── .env.example               # 环境变量模板（INFISICAL_TOKEN / PROJECT_ID）
│       ├── next.config.mjs            # CORS 配置（允许 localhost:3000）
│       ├── package.json               # @go-game/server（port 3000）
│       └── tsconfig.json              # Next.js TypeScript 配置
├── packages/
│   ├── core/                         # 围棋核心引擎（纯逻辑，无 UI 依赖）
│   │   └── src/
│   │       ├── GoGame.ts             # 主游戏类（状态机：playing → ko_check → capture → switch）
│   │       ├── board.ts              # 棋盘算法（BFS 找连通组、气数计算、提子、星位）
│   │       ├── territory.ts          # 中国数子法目数计算
│   │       ├── sgf.ts                # SGF 格式解析 / 生成
│   │       └── types.ts              # 类型定义与枚举常量
│   ├── ui/                           # 可复用 UI 组件库
│   │   └── src/components/
│   │       ├── GoBoard/              # Canvas 2D 棋盘渲染（DPR 适配 + 渐变棋子）
│   │       ├── GameInfo/             # 对局信息面板（玩家/目数/提子/领地/步数）
│   │       ├── GameControls/         # 操作按钮面板（新局/悔棋/停手/认输/模拟）
│   │       └── BoardSizeSelector/    # 棋盘大小选择器（9×9 / 13×13 / 19×19）
│   ├── storage/                      # 本地持久化存储
│   │   └── src/GameStorage.ts        # LocalForage 单例（GoGameDB → savedGames store）
│   ├── ai/                           # AI 对战引擎（预留，typescript 空壳）
│   └── network/                      # 网络对战通信（预留，typescript 空壳）
├── docs/                             # 项目文档（01 架构 / 02 实现计划 / 03 SOP）
├── .gitignore
├── .npmrc                            # pnpm 配置
├── .prettierrc                       # 代码格式化
├── package.json                      # 根 scripts（dev/build/typecheck/lint/format）
├── pnpm-workspace.yaml               # Monorepo 工作区声明
└── tsconfig.base.json                # 共享 TypeScript 配置
```

## 4. 核心架构分层

### 4.1 游戏引擎层（packages/core）

**GoGame 类** 是整个应用的逻辑核心，采用状态机模式管理一局围棋的完整生命周期：

| 阶段 | 动作 | 说明 |
|------|------|------|
| `placeStone(x, y)` | 位置校验 → 克隆棋盘 → 落子 → 检测对方提子 → 自杀检测 → ko 检测 | 返回 `PlaceResult { success, error? }` |
| `pass()` | 记录停手 → consecutivePasses++ → 切换玩家 | 双停手触发死棋标记流程（由 useGame 检测） |
| `resign()` | 立即结束 → winner = 对手 | 模拟模式中不可用 |
| `undoMove()` | 弹出最后一步 → 恢复棋盘/提子/ko → 重算领土 | 模拟/正常模式各自维护 |

**内部数据结构 (GameState)**：

```
board: StoneColor[][]        # 棋盘二维数组
currentPlayer: StoneColor    # 当前玩家（Black/White）
moveHistory: Move[]          # 正式落子历史（含 step/capturedStones）
lastKoPosition: Position?    # 当前打劫点（禁落子）
isGameOver: boolean          # 游戏结束标志
winner: StoneColor?          # 胜方
consecutivePasses: number    # 连续停手计数
isSimulationMode: boolean    # 是否处于模拟模式
simulationMoves: Move[]      # 模拟步数（独立于 moveHistory）
preSimulationState: GameState? # 进入模拟前的状态快照（deep copy via JSON）
territory: TerritoryResult   # 实时目数统计
```

**模拟模式机制**：
- `startSimulation()`：深拷贝当前 GameState → 进入模拟模式
- 模拟中落子写入 `simulationMoves[]` 而非 `moveHistory[]`
- `applySimulation()`：将 simulationMoves 合并到 moveHistory
- `endSimulation()`：丢弃所有模拟步数，恢复 preSimulationState

**棋盘算法（board.ts）**：
- `getGroup(board, pos)` — BFS 广度优先搜索找连通棋子组
- `countLiberties(board, group)` — 计算气数
- `removeGroup(board, group)` — 提子（将棋组所有位置设为 Empty）
- `getStarPoints(boardSize)` — 星位坐标（不同棋盘大小不同星位布局）
- `opponentColor(color)` — 翻转颜色

**数子法（territory.ts）**：
- `calculateTerritory(board, capturedBlack, capturedWhite, deadStones?)` — 中国数子法填空算法
- 遍历所有空格 BFS 找区域 → 检测区域边界颜色 → 全黑/全白边境 → 归属对应颜色
- 总目数 = 领地 + 提子数（黑: blackTerritory + capturedWhite, 白: whiteTerritory + capturedBlack）

**SGF 支持（sgf.ts）**：
- `generateSGF(boardSize, moves, komi=6.5)` — 生成标准 SGF 文本（GM/SZ/KM/AP 元数据 + B[]/W[] 步序列）
- `parseSGF(sgf)` — 解析 SGF 为 `{ boardSize, moves, komi }`
- `replayMoves(boardSize, moves)` — 回放步序列重建棋盘

### 4.2 BFF 服务层（apps/server）

**架构设计**：Next.js 14 作为 BFF（Backend For Frontend），位于 Vue 前端和 Supabase 之间，负责：

1. **密钥安全管理**：通过 Infisical SDK 动态获取 Supabase 密钥，避免客户端暴露 `service_role`
2. **服务端认证**：使用 `@supabase/ssr` 的 `createServerClient` 在 API Route 中读写 cookie，完成用户会话管理
3. **Admin 权限操作**：`createAdminClient` 使用 `service_role` key 执行需要绕过 RLS 的特权操作
4. **API 代理**：前端通过 `fetch('/api/...')` 调用 BFF，BFF 再操作 Supabase，前端不直接持有 Supabase 密钥

**Supabase 客户端三种模式**：

| 客户端 | 路径 | 用途 | 密钥来源 |
|--------|------|------|----------|
| `server.ts→createClient()` | [lib/supabase/server.ts](file:///d:/Programmes/go_game/go-game-monorepo/apps/server/src/lib/supabase/server.ts) | API Route 中服务端操作（含 cookie 读写） | Infisical `SUPABASE_URL` + `SUPABASE_ANON_KEY` |
| `admin.ts→createAdminClient()` | [lib/supabase/admin.ts](file:///d:/Programmes/go_game/go-game-monorepo/apps/server/src/lib/supabase/admin.ts) | 绕过 RLS 的特权操作 | Infisical `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` |
| `client.ts→createClient()` | [lib/supabase/client.ts](file:///d:/Programmes/go_game/go-game-monorepo/apps/server/src/lib/supabase/client.ts) | 客户端组件使用 | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

**Infisical 密钥管理**（[lib/infisical/index.ts](file:///d:/Programmes/go_game/go-game-monorepo/apps/server/src/lib/infisical/index.ts)）：
- 初始化需要 `INFISICAL_TOKEN` + `INFISICAL_PROJECT_ID` 环境变量
- `getSecret(secretName)` 从 Infisical 获取对应环境的密钥（dev/prod）
- 内置 Map 内存缓存，TTL 60 秒，避免每次请求都调用 Infisical API
- 环境变量仅在 server 侧（`INFISICAL_*`），不暴露给浏览器

**CORS 配置**（[next.config.mjs](file:///d:/Programmes/go_game/go-game-monorepo/apps/server/next.config.mjs)）：
- 允许 `http://localhost:3000`（Vite 前端）跨域调用
- 允许 `Authorization` 和 `Content-Type` header
- 支持 Credentials 传递（cookie 认证）

**API Routes 结构**（当前全部返回 501 "Not implemented yet"）：

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 🚧 501 |
| POST | `/api/auth/login` | 用户登录 | 🚧 501 |
| POST | `/api/auth/logout` | 用户登出 | 🚧 501 |
| GET | `/api/auth/me` | 获取当前用户 | 🚧 501 |
| GET | `/api/rooms` | 房间列表 | 🚧 501 |
| POST | `/api/rooms` | 创建房间 | 🚧 501 |
| GET | `/api/rooms/[id]` | 房间详情 | 🚧 501 |
| POST | `/api/rooms/[id]/join` | 加入房间 | 🚧 501 |
| POST | `/api/rooms/[id]/leave` | 离开房间 | 🚧 501 |
| POST | `/api/rooms/[id]/moves` | 落子 | 🚧 501 |
| POST | `/api/ai/move` | AI 落子 | 🚧 501 |

**联机对战数据流（通过 BFF）**：
```
[Vue 前端]  fetch('/api/auth/login', { email, password })
    ↓
[Next.js BFF]  createServerClient() → supabase.auth.signInWithPassword()
    ↓ (set auth cookie)
[Vue 前端]  fetch('/api/rooms', { method: 'POST', body: { board_size } })
    ↓
[Next.js BFF]  createServerClient() → supabase.from('rooms').insert()
    ↓
[Vue 前端]  fetch(`/api/rooms/${roomId}/moves`, { method: 'POST', body: { x, y } })
    ↓
[Next.js BFF]  createServerClient() → supabase.from('moves').insert()
    ↓ (Supabase Realtime)
[对手]  收到 INSERT 事件 → 棋盘更新
```

### 4.3 状态管理层（apps/web/src/stores/）

**gameStore**（封装单个 GoGame 实例）：
```typescript
defineStore('game', () => {
  const goGame = ref(new GoGame(BoardSize.Large));
  const gameState = computed(() => goGame.value.getState()); // 只读
  // 方法: placeStone, undo, pass, resign, reset(boardSize?),
  //       startSimulation, endSimulation, applySimulation,
  //       loadGame(data), exportToSGF, importFromSGF, markDeadStones,
  //       canUndo, calculateTerritory
});
```

**uiStore**（所有 UI 状态标志）：
```typescript
defineStore('ui', () => {
  // 弹窗标志
  const showSaveModal = ref(false);       // 保存棋局弹窗
  const showLoadModal = ref(false);       // 导入棋局弹窗
  const showGameOverModal = ref(false);   // 对局结束弹窗
  const showDeadStoneMarker = ref(false); // 死棋标记模式
  const showSimHistory = ref(false);      // 模拟历史浮层
  const showNewGameConfirm = ref(false);  // 新局确认弹窗
  const showExitConfirm = ref(false);     // 退出确认弹窗
  // 棋盘设置
  const selectedBoardSize = ref(BoardSize.Large);  // 当前选中大小
  const pendingBoardSize = ref<BoardSize | null>(null); // 待确认大小
  // Toast 通知
  const toasts = ref<Toast[]>([]);       // 3 秒自动消失
  function toast(message, type);         // 显示通知
  function dismissToast(id);             // 手动关闭通知
});
```

### 4.4 组合函数层（apps/web/src/composables/）

这是 **Store ↔ View 的桥接层**，封装业务流程：

**useGame()**：
| 方法 | 功能 |
|------|------|
| `handlePlaceStone(pos)` | 落子 → 检测结果 → 检测双停手触发死棋标记 |
| `handleUndo()` | 悔棋 |
| `handlePass()` | 停手 → 检测双停手 |
| `handleResign()` | 认输 → 弹出 GameOverModal |
| `handleNewGame()` | 弹出 NewGameConfirm |
| `handleBoardSizeChange(size)` | 设置 pendingBoardSize → 弹出确认 |
| `confirmNewGame()` | 确认新局 → reset 棋盘大小 |
| `cancelNewGame()` | 取消 → 清除 pendingBoardSize |
| `handleStartSimulation()` | 开启模拟 |
| `handleEndSimulation()` | 关闭模拟（丢弃） |
| `handleApplySimulation()` | 应用模拟步数 |

**useStorage()**：
| 方法 | 功能 | 涉及组件 |
|------|------|----------|
| `saveCurrentGame(name, note)` | 序列化 → GameStorage.saveGame() | SaveGameModal |
| `loadSavedGames(page, keyword)` | 分页查询 | SavedGamesModal |
| `loadGame(id, asSimulation?)` | 反序列化加载 | SavedGamesModal |
| `loadFromJSON(json)` | JSON 文本解析导入 | LoadGameModal |
| `importFromSGF(sgf)` | SGF 文本解析导入 | LoadGameModal |
| `deleteGame(id)` | 删除棋局 | SavedGamesModal |
| `downloadJSON()` | 浏览器下载 .json | SavedGamesModal |
| `downloadSGF()` | 浏览器下载 .sgf | SavedGamesModal |

**useKeyboard()**（全局键盘快捷键，`onMounted` 注册，`onUnmounted` 移除）：
| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Z` | 悔棋 |
| `Ctrl+S` | 保存棋局（非模拟且非结束状态） |
| `Ctrl+N` | 新局确认 |
| `Escape` | 关闭当前弹窗 |

### 4.5 视图层

**路由**（[router/index.ts](file:///d:/Programmes/go_game/go-game-monorepo/apps/web/src/router/index.ts)）：
| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | [HomeView](file:///d:/Programmes/go_game/go-game-monorepo/apps/web/src/views/HomeView.vue) | 初始页面 |
| `/game` | [GameView](file:///d:/Programmes/go_game/go-game-monorepo/apps/web/src/views/GameView.vue) | 游戏主页面 |

**HomeView**（初始页面）：
- 围棋主题视觉（渐变背景 + 棋盘图案）
- **棋盘大小选择器**（BoardSizeSelector）：设置在 `uiStore.selectedBoardSize`
- 三个入口按钮：
  - **开始对局** → `gameStore.reset(uiStore.selectedBoardSize)` → 导航 `/game`
  - **导入棋局** → 打开 LoadGameModal（JSON Tab / SGF Tab）
  - **查看现有棋局** → 打开 SavedGamesModal（IndexedDB 本地列表）
- LoadGameModal 成功导入后通过 `@loaded` emit 导航到 `/game`

**GameView**（游戏主页面）：
- **Top Bar**：← 返回首页 + BoardSizeSelector + 游戏状态标签（进行中/模拟中/已结束）
- **GoBoard**：Canvas 2D 棋盘，支持落子、悬停预览（径向渐变 + 玩家颜色区分）、最后落子标记、模拟步数标签、死棋标记
- **GameInfo**：当前玩家、目数统计、提子数、领地、步数
- **游戏控制**（GameControls）：新局、悔棋、停一手、认输、保存棋局、导入棋局、导出（JSON/SGF）、模拟控制
- **模拟历史**：紫色悬浮按钮（📜）→ 点击展开浮层面板（z-50），列出模拟步数
- **死棋标记**：双停手后出现，用户标记死棋 → 确认 → 弹出 GameOverModal
- **Toast 通知**：右上角固定定位，success/error/warning/info 四种类型，3 秒自动消失

### 4.6 持久化层

#### 4.6.1 本地持久化（packages/storage）

**GameStorage** 单例（LocalForage）：
```
store name: GoGameDB / savedGames
索引: id (UUID v4)
CRUD: saveGame / getGameById / getAllSavedGames / deleteGame / deleteGames / clearAllGames
分页: getSavedGames(page, pageSize, keyword?) — 内存排序 + 分页
查询: searchGames(keyword) — 全表扫描 name 模糊匹配
```

**SavedGame 结构**：
```typescript
interface SavedGame {
  id: string;            // crypto.randomUUID()
  name: string;          // 棋局名称
  note: string;          // 备注
  boardSize: BoardSize;  // 9/13/19
  gameData: string;      // GoGame.serialize() JSON 字符串
  totalMoves: number;    // moveHistory 长度
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601
}
```

#### 4.6.2 云端持久化（Supabase，通过 BFF 访问）

**Supabase** 提供 PostgreSQL 关系型数据库、内置 Auth（邮箱验证码/密码登录）、Realtime WebSocket 推送。前端不直接调用 Supabase SDK，而是通过 BFF API 代理。

**数据库表结构**：

| 序号 | 表名 | 说明 | 关键字段 |
|------|------|------|----------|
| 1 | `profiles` | 用户扩展信息 | `id → auth.users`, `username`, `avatar_url`, `rating(1200)` |
| 2 | `rooms` | 对局房间 | `host_id`, `guest_id`, `board_size`, `status` |
| 3 | `moves` | 落子记录 | `room_id`, `player_id`, `color`, `x/y`, `step`, `is_pass` |
| 4 | `games` | 已结束对局 | `black_id`, `white_id`, `winner_id`, `result`, `sgf_data`, `komi` |
| 5 | `ai_games` | AI 对局 | `user_id`, `difficulty(1-4)`, `user_color`, `sgf_data` |

**RLS 策略规则**：

| 表 | SELECT | INSERT | UPDATE | DELETE |
|----|--------|--------|--------|--------|
| `profiles` | 所有人 | — | 仅自己 | — |
| `rooms` | waiting 公开 / 参与者可见 | 登录用户 | host/guest | 仅 host |
| `moves` | 对局参与者 | 参与者（落子人） | 禁止 | 禁止 |
| `games` | 黑/白方 | 参与者 | 禁止 | 禁止 |
| `ai_games` | 仅自己 | 登录用户 | 仅自己 | 仅自己 |

**额外配置**：
- **自动触发器**：新用户注册 → 自动创建 `profiles` 记录；`updated_at` 自动维护
- **Realtime**：`moves` 表已加入 `supabase_realtime` 发布，BFF 可通过 Supabase 客户端订阅落子事件
- **工具函数**：`is_room_participant(room_id, user_id)` — 供 BFF 服务端判断房间归属
- **约束检查**：棋盘大小限制 9/13/19，host ≠ guest，落子坐标 0-18

## 5. 组件通信模式

```
GameView.vue
 ├── <GoBoard> ──(emit: place-stone)──→ useGame.handlePlaceStone() ──→ gameStore.placeStone()
 ├── <GoBoard> ←──(props: boardState/currentPlayer/simMoves/deadStones)── gameStore.gameState
 ├── <GameInfo> ←──(props: territory/currentPlayer/stepCount/isGameOver/winnner)── gameStore
 ├── <GameControls> ──(emit: save/undo/pass/...)──→ useGame.handlers ──→ gameStore
 ├── <BoardSizeSelector> ──(emit: change)──→ useGame.handleBoardSizeChange() ──→ uiStore
 ├── <SaveGameModal> ──(emit: save)──→ useStorage.saveCurrentGame() ──→ GameStorage
 ├── <LoadGameModal> ←──(props: storage)──→ useStorage.loadFromJSON / importFromSGF
 ├── <GameOverModal> ──(emit: new-game/replay)──→ handleNewGameAfterOver / handleReplayAfterOver
 ├── <NewGameConfirm> ──(emit: confirm/cancel)──→ useGame.confirmNewGame / cancelNewGame
 ├── <ExitConfirmModal> ──(emit: confirm)──→ gameStore.reset() + router.push('/')
 └── <SavedGamesModal> ←──(props: storage)──→ useStorage.loadGame / deleteGame / download*

[联机相关（待实现）]
 Vue ↔ BFF API: fetch('/api/auth/...', ...) / fetch('/api/rooms/...', ...)
 BFF ↔ Supabase: createServerClient().from('rooms/moves/games').insert/select
```

## 6. 数据流

### 6.1 本地对局
```
用户交互 → UI 组件 emit → composable 处理 → Pinia store 操作 → GoGame 引擎计算 → computed 响应 → UI 更新
```

### 6.2 联机对局（通过 BFF）
```
用户交互 → Vue 组件 fetch() → BFF API Route → createServerClient() → Supabase
    ↓ (Supabase Realtime)
对手 → Supabase 推送 → BFF/前端订阅 → 棋盘更新
```

- **单向数据流**：State → View → Action → State
- **引擎与 UI 分离**：GoGame（纯逻辑） → gameStore（Pinia 桥接） → Vue 组件（响应式渲染）
- **本地持久化**：gameStore.serialize() ↔ GameStorage（IndexedDB）
- **云端持久化**：fetch BFF API → createServerClient() → Supabase（PostgreSQL）
- **Realtime**：Supabase Channel → INSERT on `moves` → 前端监听 → 渲染

## 7. GoBoard Canvas 渲染架构

**GoBoard** 是核心渲染组件，使用 Canvas 2D API 绘制棋盘：

- **尺寸计算**：根据容器宽度动态计算 `cellSize = (containerWidth - 2 * PADDING) / (boardSize - 1)`
- **DPR 适配**：`canvas.width = boardPixelSize * dpr`，通过 `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` 统一缩放（避免手动除以 dpr）
- **性能优化**：仅在 `boardPixelSize` 或 `devicePixelRatio` 变化时更新 Canvas 尺寸属性，避免模拟模式频繁重设导致页面高度抖动
- **坐标转换**：`worldToBoard(clientX, clientY)` — 物理屏幕坐标 → Canvas CSS 坐标 → 棋盘逻辑坐标
- **绘制层次**（从底到顶）：
  1. 背景（burlywood #DEB887 填充）
  2. 网格线（#333 细线 + 边框加粗）
  3. 星位点（小黑圆点）
  4. 棋子（径向渐变 `#555→#000` / `#fff→#ccc` + 描边 `#333` / `#bbb`）
  5. 最后落子标记（小实心方块）
  6. 死棋标记（红色虚线框 + ✕）
  7. 模拟步数标签（紫色数字圆点）
  8. 悬停预览（同上径向渐变 + 0.4 透明度，颜色由 `currentPlayer` prop 控制）
- **响应式**：`ResizeObserver` 监听容器宽度变化自动重绘

## 8. 包间依赖关系

```
@go-game/web (Vue 前端, Vite :3000)
  ├── @go-game/core       (workspace:*)     — 游戏引擎类型 + GoGame 运行时
  ├── @go-game/ui         (workspace:*)     — UI 组件
  ├── @go-game/storage    (workspace:*)     — IndexedDB 持久化
  ├── pinia               ^2.3             — 状态管理
  ├── vue                 ^3.5             — 框架
  └── vue-router           ^4.5             — 路由

@go-game/server (Next.js BFF, :3000)
  ├── @go-game/core       (workspace:*)     — 共享围棋类型
  ├── @supabase/ssr        ^0.5             — SSR 客户端（cookie）
  ├── @supabase/supabase-js ^2.49           — JS 客户端
  ├── @infisical/sdk       ^2.0             — 密钥管理
  ├── next                 ^14.2            — 框架
  └── react                ^18.3            — Next.js 运行时

@go-game/ui
  └── @go-game/core       (workspace:*)     — 类型引用（import type）

@go-game/storage
  ├── localforage         ^1.10            — IndexedDB 抽象
  └── @go-game/core       (workspace:*)     — SavedGame 类型

@go-game/ai / @go-game/network
  └── (独立预留包，TypeScript 空壳，无实现)
```

Vite 通过 `resolve.alias` 直接引用各包源码目录，开发时无需预构建。

## 9. 游戏对局完整生命周期

```
[HomeView] 选择棋盘大小 → 点击"开始对局"
    ↓
[GameView] gameStore.reset(boardSize) → 新建 GoGame 实例
    ↓
[对局中] 黑/白交替落子 → placeStone() → ko/capture 检测 → moveHistory.push()
    ↓
[结束方式]
  ├─ 认输 → resign() → winner = 对手 → GameOverModal
  ├─ 双停手 → consecutivePasses >= 2 → 死棋标记 → confirmDeadStones → GameOverModal
  └─ 强制结束（标记死棋完成） → GameOverModal

[模拟/复盘]
  ├─ startSimulation() → 分支探索落子 → simulationMoves[]
  ├─ applySimulation() → 合并到 moveHistory
  └─ endSimulation() → 丢弃

[保存] serialize() → IndexedDB（本地）/ fetch BFF API → Supabase（云端）
[导入] deserialize() ← IndexedDB / JSON 文件 / SGF 文件
[导出] downloadJSON() / downloadSGF() → 浏览器下载
```

## 10. 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| Vue 3 前端 (Vite) | 3000 | 开发服务器，HMR 热更新 |
| Next.js BFF | 3000 | API Routes，CORS 允许 localhost:3000 |

> **注意**：当前前端和 BFF 都配置为 3000 端口，同时启动时会产生端口冲突。实际开发中应将其一改为不同端口（如 BFF 改为 3001），并同步更新 CORS 配置。
