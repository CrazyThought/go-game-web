# 具体实现计划

## 1. 初始化开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev        # Vite 前端 → http://localhost:3000（见端口注意事项）

# 启动 BFF 服务器（单独终端）
pnpm --filter @go-game/server dev   # → http://localhost:3000

# 类型检查
pnpm typecheck

# 构建
pnpm build
```

> **端口注意事项**：当前前端和 BFF 都配置为 3000 端口，同时启动会冲突。实际开发时需将 BFF 端口设置为 3001（修改 `apps/server/package.json` 中 `dev` 脚本的 `--port` 参数），并同步更新 `next.config.mjs` 的 CORS `Access-Control-Allow-Origin`。

## 2. 项目模块划分

| 模块 | 包名 | 职责 | 状态 |
|------|------|------|------|
| 游戏引擎 | `@go-game/core` | 围棋棋谱规则、状态机、SGF 解析 | ✅ 已实现 |
| UI 组件 | `@go-game/ui` | 棋盘 Canvas 渲染、信息面板、控制按钮 | ✅ 已实现 |
| 本地存储 | `@go-game/storage` | IndexedDB（LocalForage）持久化 | ✅ 已实现 |
| BFF 服务 | `@go-game/server` | Next.js API Routes，Infisical 密钥管理，Supabase 代理 | 🚧 框架就绪，接口待实现 |
| AI 对战 | `@go-game/ai` | AI 引擎接口 | 🔧 预留（空壳） |
| 网络对战 | `@go-game/network` | 联机通信层（Supabase Realtime 客户端） | 🔧 预留 |
| Web 应用 | `@go-game/web` | 页面路由、状态管理、组合函数、弹窗 | ✅ 已实现 |

## 3. 已实现功能清单

### 3.1 前端（Vue 3）

- [x] 9×9 / 13×13 / 19×19 三种棋盘
- [x] 完整围棋规则：落子、提子、打劫、自杀检测
- [x] 中国数子法实时目数计算（`calculateTerritory`）
- [x] 无限悔棋（`undoMove`，维护 `moveHistory` 回滚）
- [x] 停一手、认输
- [x] 双停手 → 死棋标记 → 终局目数计算
- [x] 棋局保存到 IndexedDB（LocalForage → GoGameDB）
- [x] 棋局导入导出（JSON 格式文本 + 文件上传；SGF 格式文本 + 文件上传）
- [x] 模拟模式（分支探索 → 应用/丢弃）
- [x] 初始页面路由（HomeView：开始对局 / 导入棋局 / 查看棋局）
- [x] 初始页面棋盘大小选择（BoardSizeSelector 集成到 HomeView）
- [x] 已保存棋局列表弹窗（SavedGamesModal → IndexedDB 多局管理）
- [x] 棋局列表操作：进入棋局 / 删除 / 下载（JSON/SGF）
- [x] 退出确认弹窗 + 返回首页清除数据
- [x] Canvas DPR 缩放正确坐标转换（`ctx.setTransform(dpr,0,0,dpr,0,0)`）
- [x] 落子悬停预览 → 径向渐变 + 跟随当前玩家颜色（`#555→#000` / `#fff→#ccc`）
- [x] 模拟历史改为悬浮浮层（紫色按钮 + absolute 定位面板，z-50）
- [x] SavedGamesModal 下拉菜单 position:fixed 防裁剪（z-[60]）
- [x] 键盘快捷键（Ctrl+Z/S/N，Escape）

### 3.2 BFF 服务端（Next.js 14）

- [x] Next.js 14 项目框架搭建（App Router）
- [x] Infisical SDK 集成（密钥管理 + 60s 缓存）
- [x] Supabase 客户端三层模式（server / admin / client）
- [x] CORS 配置（允许 localhost:3000 跨域）
- [x] API Routes 路由骨架搭好（auth / rooms / ai 三大模块）

## 4. 待实现功能

### 4.1 高优先级 — BFF API 实现

- [ ] **POST `/api/auth/register`** — 调用 `supabase.auth.signUp()` + cookie 设置
- [ ] **POST `/api/auth/login`** — 调用 `supabase.auth.signInWithPassword()` + cookie 设置
- [ ] **POST `/api/auth/logout`** — 调用 `supabase.auth.signOut()` + cookie 清除
- [ ] **GET `/api/auth/me`** — 返回当前登录用户信息（`supabase.auth.getUser()`）
- [ ] **GET `/api/rooms`** — 查询公开房间列表（`supabase.from('rooms').select()`）
- [ ] **POST `/api/rooms`** — 创建联机房间（`supabase.from('rooms').insert()`）
- [ ] **GET `/api/rooms/[id]`** — 获取房间详情 + 已落子列表
- [ ] **POST `/api/rooms/[id]/join`** — 加入房间（更新 `guest_id`）
- [ ] **POST `/api/rooms/[id]/leave`** — 离开房间
- [ ] **POST `/api/rooms/[id]/moves`** — 落子（校验颜色、轮次、坐标）→ `supabase.from('moves').insert()`
- [ ] **POST `/api/ai/move`** — AI 落子请求（难度、当前棋盘状态）→ 返回坐标

### 4.2 高优先级 — Vue 前端联机集成

- [ ] **AuthStore** — 登录/注册/登出/会话管理（通过 fetch BFF API）
- [ ] **登录/注册 UI** — 邮箱密码表单 + HomeView 登录入口
- [ ] **房间列表页** — fetch `/api/rooms` → 列表渲染 → 加入创建
- [ ] **Realtime 落子同步** — 前端 Supabase 客户端订阅 `moves` 表变更 → 渲染对手落子
- [ ] **联机 GameView 适配** — 当前玩家校验、对手落子等待、双停手终局
- [ ] **联机对局结束后保存** — 写入 `games` 表（含完整 SGF 棋谱）

### 4.3 中优先级

- [ ] AI 对战界面（难度选择 1-4 + AI 落子动画）
- [ ] 用户个人信息页（profiles 读写）
- [ ] 用户等级分（rating）显示与更新
- [ ] 对局历史列表（games 表查询）
- [ ] AI 对局历史列表（ai_games 表查询）
- [ ] 端口冲突解决（BFF → 3001）

### 4.4 低优先级

- [ ] PWA 离线支持
- [ ] i18n 国际化
- [ ] 暗色主题
- [ ] 棋局分析引擎
- [ ] 单元测试覆盖率

## 5. 组件开发规范

### 5.1 Vue 组件规范
- 使用 `<script setup lang="ts">` 语法
- Props / Emits 使用 TypeScript 泛型声明
- 样式使用 Tailwind CSS 原子类
- 组件目录：每个组件一个文件夹（含 `.vue` 文件）

### 5.2 弹窗组件模式
所有弹窗遵循统一结构：
```vue
<template>
  <!-- 遮罩层：点击空白处关闭 -->
  <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
       @click.self="emit('close')">
    <!-- 弹窗主体 -->
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
      <!-- Header / Body / Footer 三段式结构 -->
    </div>
  </div>
</template>
```

### 5.3 状态管理规范
- 游戏状态 → `useGameStore`（全局单例，封装 `GoGame` 实例）
- UI 状态 → `useUIStore`（全局单例，弹窗/通知/选中等）
- 业务逻辑 → `composables/` 组合函数（桥接 Store ⇔ View）
- 联机状态 → `useAuthStore`（待实现，BFF API 调用封装）

### 5.4 命名约定
- 组合函数：`use` 前缀（`useGame`、`useStorage`、`useKeyboard`）
- Pinia Store：`use` 前缀 + `Store` 后缀
- 事件处理：`handle` 前缀
- Props/Emits：kebab-case（模板）/ camelCase（脚本）

### 5.5 BFF API Route 开发规范
- 每个 API Route 导出对应的 HTTP 方法函数（`GET`/`POST`/`PUT`/`DELETE`）
- 使用 `createServerClient()` 获取带 cookie 的 Supabase 客户端
- 使用 `createAdminClient()` 执行需要 service_role 的特权操作
- API Route 返回标准 `NextResponse.json(data, { status })` 格式
- 错误处理使用 try/catch，返回 `{ error: string }` + 对应 HTTP 状态码
- 敏感操作（如创建房间、落子）需先验证用户登录状态（`supabase.auth.getUser()`）

### 5.6 Supabase 调用规范（通过 BFF）
- 前端不直接引入 `@supabase/supabase-js`，所有 Supabase 操作通过 `fetch('/api/...')` 代理
- BFF 调用 `createServerClient()` 处理 cookie 认证
- 需要绕过 RLS 的操作（如管理员查询所有用户）使用 `createAdminClient()`
- Realtime 订阅可由前端 Supabase 客户端直接处理（仅订阅，不写入）

## 6. TypeScript 类型约定

- `packages/core/src/types.ts` 定义所有围棋领域类型
- 枚举值（`StoneColor`、`BoardSize`、`GameStatus`）用于运行时比较
- 接口（`Position`、`Move`、`GameState` 等）用于类型检查
- 使用 `type` 导入（`import type { ... }`）防止运行时导入
- 联机相关类型定义在 `@go-game/network` 包（待创建）
- BFF API 请求/响应类型建议定义在 `apps/server/src/types/` 目录下

## 7. 包间依赖关系

```
@go-game/web (Vue 前端, Vite :3000)
  ├── @go-game/core       (workspace:*)     — 游戏引擎
  ├── @go-game/ui         (workspace:*)     — UI 组件
  ├── @go-game/storage    (workspace:*)     — IndexedDB
  ├── pinia               ^2.3
  ├── vue                 ^3.5
  └── vue-router           ^4.5

@go-game/server (Next.js BFF, :3000)
  ├── @go-game/core       (workspace:*)     — 共享围棋类型
  ├── @supabase/ssr        ^0.5             — SSR 客户端（cookie）
  ├── @supabase/supabase-js ^2.49           — JS 客户端
  ├── @infisical/sdk       ^2.0             — 密钥管理
  ├── next                 ^14.2            — 框架
  └── react                ^18.3            — Next.js 运行时

@go-game/ui
  └── @go-game/core       (workspace:*)     — 类型依赖

@go-game/storage
  ├── localforage         ^1.10
  └── @go-game/core       (workspace:*)     — SavedGame 类型

@go-game/ai / @go-game/network
  └── (独立预留包，TypeScript 空壳)
```

Vite 通过 `resolve.alias` 直接引用各包源码目录，开发时无需预构建。

## 8. Supabase 数据库设计

### 表结构总览

| 表名 | 说明 | 主键/引用 | 核心字段 |
|------|------|----------|----------|
| `profiles` | 用户扩展信息 | `id → auth.users` | `username`, `avatar_url`, `rating(1200)` |
| `rooms` | 对局房间 | `id UUID` | `host_id`, `guest_id`, `board_size(9/13/19)`, `status` |
| `moves` | 落子记录 | `id UUID`, `room_id → rooms` | `player_id`, `color(black/white)`, `x/y`, `step`, `is_pass` |
| `games` | 已结束对局 | `id UUID` | `black_id`, `white_id`, `winner_id`, `result`, `sgf_data`, `komi(6.5)` |
| `ai_games` | AI 对局 | `id UUID` | `user_id`, `difficulty(1-4)`, `user_color`, `sgf_data` |

### RLS 安全矩阵

| 表 | SELECT | INSERT | UPDATE | DELETE |
|----|--------|--------|--------|--------|
| `profiles` | 所有人 | — | 仅自己（`uid() = id`） | — |
| `rooms` | `status='waiting'` → 公开；参与者可见 | `uid() = host_id` | `uid() = host_id OR guest_id` | 仅 `uid() = host_id` |
| `moves` | 参与者（`is_room_participant`） | 参与者 + 落子人校验 | 禁止 | 禁止 |
| `games` | `uid() = black_id OR white_id` | 参与者 | 禁止 | 禁止 |
| `ai_games` | `uid() = user_id` | `uid() = user_id` | `uid() = user_id` | `uid() = user_id` |

### 自动触发器
- `on_auth_user_created`：新用户注册 → `INSERT INTO profiles (id) VALUES (new.id)`
- `updated_at`：所有表 `BEFORE UPDATE` 自动设置为 `now()`

### 约束
- `board_size IN (9, 13, 19)`
- `host_id <> guest_id`
- `moves.x BETWEEN 0 AND 18`，`moves.y BETWEEN 0 AND 18`

### Realtime 发布
- `moves` 表加入 `supabase_realtime` publication
- BFF 可通过 Supabase 客户端订阅 `INSERT` 事件转发给前端，或前端 Supabase 客户端直接订阅

## 9. 构建与部署

- **前端开发**：`rolldown-vite` 直接解析 TypeScript/Vue 源文件，HMR 热更新
- **前端生产构建**：`vite build` → `apps/web/dist/` 静态资源
- **目标浏览器**：`baseline-widely-available`（现代浏览器）
- **BFF 开发**：`next dev` → 热重载
- **BFF 部署**：Vercel（推荐，原生 Next.js 支持）/ 自托管 Node.js 服务器
- **前端部署**：Vercel / Netlify / Cloudflare Pages 等静态托管
