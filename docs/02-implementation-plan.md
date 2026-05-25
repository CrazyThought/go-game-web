# 具体实现计划

## 1. 初始化开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev        # → http://localhost:3000

# 类型检查
pnpm typecheck

# 构建
pnpm build
```

## 2. 项目模块划分

| 模块 | 包名 | 职责 | 状态 |
|------|------|------|------|
| 游戏引擎 | `@go-game/core` | 围棋棋谱规则、状态机 | ✅ 已实现 |
| UI 组件 | `@go-game/ui` | 棋盘、信息面板、控制按钮 | ✅ 已实现 |
| 本地存储 | `@go-game/storage` | IndexedDB 持久化 | ✅ 已实现 |
| AI 对战 | `@go-game/ai` | AI 引擎接口 | 🔧 预留 |
| 网络对战 | `@go-game/network` | 联机通信 | 🔧 预留 |
| Web 应用 | `@go-game/web` | 页面路由、状态管理、组合函数 | ✅ 已实现 |

## 3. 已实现功能清单

- [x] 9×9 / 13×13 / 19×19 三种棋盘
- [x] 完整围棋规则：落子、提子、打劫、自杀检测
- [x] 中国数子法实时目数计算
- [x] 无限悔棋（保留 moveHistory）
- [x] 停一手、认输
- [x] 双停手 → 死棋标记 → 终局目数计算
- [x] 棋局保存到 IndexedDB
- [x] 棋局导入导出（JSON / SGF 格式）
- [x] 模拟模式（分支探索）
- [x] 初始页面路由（HomeView）
- [x] 已保存棋局列表（SavedGamesModal）
- [x] 退出确认（ExitConfirmModal）
- [x] Canvas DPR 缩放正确坐标转换
- [x] 落子悬停预览跟随当前玩家颜色
- [x] 键盘快捷键

## 4. 待实现功能

- [ ] 初始页面设置棋盘大小（BoardSizeSelector 集成到 HomeView）
- [ ] 模拟历史改为悬浮按钮（避免页面高度异常）
- [ ] SavedGamesModal 固定高度 + 子菜单溢出修复
- [ ] AI 对战实现
- [ ] 网络联机对战
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
<div class="fixed inset-0 z-40 flex items-center justify-center bg-black/40" @click.self="emit('close')">
  <div class="bg-white rounded-xl shadow-2xl ...">
    <!-- 弹窗内容 -->
  </div>
</div>
```

### 5.3 状态管理规范
- 游戏状态 → `useGameStore`（全局单例）
- UI 状态 → `useUIStore`（全局单例）
- 业务逻辑 → `composables/` 组合函数

### 5.4 命名约定
- 组合函数：`use` 前缀（useGame、useStorage、useKeyboard）
- Pinia Store：`use` 前缀 + `Store` 后缀
- 事件处理：`handle` 前缀
- Props/Emits：kebab-case（模板）/ camelCase（脚本）

## 6. TypeScript 类型约定

- `packages/core/src/types.ts` 定义所有围棋领域类型
- 枚举值（StoneColor、BoardSize、GameStatus）用于运行时比较
- 接口（Position、Move、GameState 等）用于类型检查
- 使用 `type` 导入（`import type { ... }`）防止运行时导入

## 7. 包间依赖关系

```
@go-game/web
  ├── @go-game/core     (直接依赖)
  ├── @go-game/ui       (直接依赖)
  └── @go-game/storage  (直接依赖)

@go-game/ui
  └── @go-game/core     (类型依赖)

@go-game/storage
  └── (无核心依赖)

@go-game/ai / @go-game/network
  └── (独立预留，无实现)
```

Vite 配置通过路径别名 (`resolve.alias`) 实现开发时包引用，无需预构建。

## 8. 构建与部署

- **开发**：`rolldown-vite` 直接解析 TypeScript/Vue 源文件，HMR 热更新
- **生产构建**：`vite build` → `apps/web/dist/` 静态资源
- **目标浏览器**：`baseline-widely-available`（现代浏览器）
