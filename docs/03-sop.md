# 标准操作程序 (SOP)

## 1. 环境准备

### 1.1 前置条件
- Node.js >= 20.19
- pnpm >= 9.0

### 1.2 初始化
```bash
cd go-game-monorepo
pnpm install
```

## 2. 开发流程

### 2.1 启动开发服务器
```bash
pnpm dev
# → http://localhost:3000
# 支持 HMR 热更新
```

### 2.2 代码编写规范

#### 2.2.1 Vue 组件编写
- 所有组件必须使用 `<script setup lang="ts">` 语法
- 模板中不允许新增注释（项目规则）
- Props 和 Emits 使用 TypeScript 类型声明：
  ```typescript
  const props = defineProps<{
    foo: string;
    bar?: number;
  }>();
  const emit = defineEmits<{
    'event-name': [param: Type];
  }>();
  ```

#### 2.2.2 Store 使用
- 使用 Pinia `defineStore` 创建 store
- Store 内不包含 UI 渲染逻辑
- 通过 composable 桥接 store 和组件

#### 2.2.3 文件操作规范
- 修改前必须先 `Read` 文件查看内容
- 优先使用 `SearchReplace` 精确修改，避免全文件重写
- 仅修改必要的代码，最小变更原则

### 2.3 修改后验证
```bash
# TypeScript 类型检查（仅 web 应用）
pnpm --filter @go-game/web typecheck

# 全局类型检查
pnpm typecheck

# Lint 检查
pnpm --filter @go-game/web lint

# 代码格式化
pnpm format
```

## 3. 特性开发流程（Spec-driven）

### 3.1 分析阶段
1. 阅读相关源码，理解现有逻辑
2. 定位问题的根本原因（根因分析）
3. 确定影响范围（哪些文件需要修改）

### 3.2 规格阶段（Proposal）
1. 编写 `spec.md`：Why / What Changes / Impact / Requirements
2. 编写 `tasks.md`：有序任务列表，含子任务分解
3. 编写 `checklist.md`：可验证的检查点
4. 向用户呈现规格文档，等待批准

### 3.3 实施阶段（Apply）
1. 按 tasks.md 顺序执行
2. **必须使用子 Agent 并行执行** 无依赖关系的任务
3. 每完成一个任务立即在 tasks.md 中打勾
4. 实施完成后运行 typecheck + lint

### 3.4 验证阶段（Verify）
1. 逐条对照 checklist.md 验证
2. **使用子 Agent 并行验证**
3. 通过的检查点标记为 `[x]`
4. 失败的检查点新建修复任务

## 4. 常见问题排查

### 4.1 Canvas 坐标偏移
- **根因**：DPR 缩放未正确处理，`canvas.width` = `boardPixelSize * dpr`
- **修复**：坐标计算时除以 dpr，统一到 CSS 坐标空间

### 4.2 页面高度异常增长
- **根因**：每次 `draw()` 重新设置 canvas.width/height 引发重排
- **修复**：追踪上次尺寸，仅在变化时更新

### 4.3 弹窗内子元素被裁剪
- **根因**：父容器 `overflow-y-auto` 裁剪了 `position: absolute` 子元素
- **修复**：使用 `position: fixed` 或 `overflow: visible` 策略

### 4.4 组件 Props 传递
- 新增 prop 时确保在组件定义、父组件传递两处同步修改
- Props 使用 kebab-case（模板）/ camelCase（TypeScript）
