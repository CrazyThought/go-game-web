# 标准操作程序 (SOP)

## 1. 环境准备

### 1.1 前置条件
- Node.js >= 20.19
- pnpm >= 9.0
- Supabase 项目已配置（`supabase_url`、`anon_key`、`service_role_key`）
- Infisical 项目已配置（`INFISICAL_TOKEN`、`INFISICAL_PROJECT_ID`）
  - Infisical 中需存储三个密钥：`SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`

### 1.2 初始化
```bash
cd go-game-monorepo
pnpm install
```

### 1.3 BFF 环境变量
```env
# apps/server/.env.local（不提交到 Git）
INFISICAL_TOKEN=your-infisical-service-token
INFISICAL_PROJECT_ID=your-infisical-project-id

# 可选：自托管 Infisical 时才需要
# INFISICAL_SITE_URL=https://infisical.your-domain.com
```

### 1.4 前端环境变量（联机功能时，暂不使用）
```env
# apps/web/.env（不提交到 Git）
# 注意：通过 BFF 代理后，前端不再需要直接配置 Supabase 密钥
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 2. 开发流程

### 2.1 同时启动前端和 BFF
由于当前存在端口冲突（均为 3000），建议：

**方式一：使用不同端口**
```bash
# 终端 1 — BFF（改为 3001）
pnpm --filter @go-game/server dev --port 3001

# 终端 2 — 前端（使用 3000）
pnpm dev
```
同时修改 `apps/server/next.config.mjs` 中 CORS 的 `Access-Control-Allow-Origin` 为 `http://localhost:3000`（已正确配置）。

**方式二：仅开发前端（本地模式）**
```bash
pnpm dev
# → http://localhost:3000
# 支持 HMR 热更新，所有功能仅依赖 IndexedDB 本地存储
```

### 2.2 代码编写规范

#### 2.2.1 Vue 组件编写
- 所有组件必须使用 `<script setup lang="ts">` 语法
- 模板中不允许新增注释
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

#### 2.2.3 BFF API Route 开发规范
- 所有 Supabase 数据库操作必须在 BFF API Route 中执行，前端通过 `fetch('/api/...')` 调用
- API Route 中使用 `createServerClient()` 获取服务端 Supabase 客户端（含 cookie 认证）
- 需要绕过 RLS 的操作使用 `createAdminClient()`（service_role）
- API Route 函数签名：
  ```typescript
  // 使用 auth cookie 的普通请求
  import { createClient } from '@/lib/supabase/server';
  export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // ... 业务逻辑
  }

  // 需要 service_role 的特权请求
  import { createAdminClient } from '@/lib/supabase/admin';
  export async function GET() {
    const supabase = await createAdminClient();
    // ... 绕过 RLS 的操作
  }
  ```

#### 2.2.4 Infisical 密钥使用规范
- 不要在代码中硬编码 Supabase 密钥，全部通过 `getSecret()` 从 Infisical 获取
- `getSecret()` 内置 60s TTL 缓存，避免频繁调用 Infisical API
- 生产环境 (`NODE_ENV=production`) 从 `prod` 环境获取，否则从 `dev` 环境获取
- `INFISICAL_TOKEN` 和 `INFISICAL_PROJECT_ID` 仅存在于 `.env.local` 中，不提交到 Git

#### 2.2.5 文件操作规范
- 修改前必须先 `Read` 文件查看内容
- 优先使用 `Edit` 精确修改，避免全文件重写
- 仅修改必要的代码，最小变更原则

### 2.3 修改后验证
```bash
# TypeScript 类型检查（前端）
pnpm --filter @go-game/web typecheck

# TypeScript 类型检查（BFF）
pnpm --filter @go-game/server typecheck

# 全局类型检查
pnpm typecheck

# Lint 检查
pnpm --filter @go-game/web lint
pnpm --filter @go-game/server lint

# BFF 构建检查
pnpm --filter @go-game/server build

# 代码格式化
pnpm format
```

## 3. 特性开发流程（Spec-driven）

### 3.1 分析阶段
1. 阅读相关源码，理解现有逻辑
2. 定位问题的根本原因（根因分析）
3. 确定影响范围（哪些文件需要修改，涉及前端还是 BFF）

### 3.2 规格阶段（Proposal）
1. 编写 `spec.md`：Why / What Changes / Impact / Requirements（含 Scenario）
2. 编写 `tasks.md`：有序任务列表，含子任务分解
3. 编写 `checklist.md`：可验证的检查点（每个可量化）
4. 向用户呈现规格文档，等待批准

### 3.3 实施阶段（Apply）
1. 按 tasks.md 顺序执行
2. **必须使用子 Agent 并行执行** 无依赖关系的任务
3. 每完成一个任务立即在 tasks.md 中打勾 `[x]`
4. 实施完成后运行 typecheck + lint（前端和 BFF 分别检查）

### 3.4 验证阶段（Verify）
1. 逐条对照 checklist.md 验证
2. **使用子 Agent 并行验证**
3. 通过的检查点标记为 `[x]`
4. 失败的检查点新建修复任务

## 4. Supabase 集成指南（通过 BFF）

### 4.1 架构概览

```
[Vue 前端] ←→ fetch('/api/*') ←→ [Next.js BFF] ←→ Supabase
   (浏览器)          HTTP              (服务器)       PostgreSQL
                    cookie 传递                         Auth
                                     Infisical 密钥     Realtime
```

**核心原则**：前端不直接持有 Supabase 密钥，所有数据库操作通过 BFF API 代理。

### 4.2 BFF 中创建 Supabase 客户端

```typescript
// apps/server/src/lib/supabase/server.ts — 服务端客户端（API Route 使用）
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSecret } from '@/lib/infisical';

export async function createClient() {
  const cookieStore = await cookies();
  const [url, anonKey] = await Promise.all([
    getSecret('SUPABASE_URL'),
    getSecret('SUPABASE_ANON_KEY'),
  ]);
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}

// apps/server/src/lib/supabase/admin.ts — Admin 客户端（绕过 RLS）
export async function createAdminClient() {
  const [url, serviceRoleKey] = await Promise.all([
    getSecret('SUPABASE_URL'),
    getSecret('SUPABASE_SERVICE_ROLE_KEY'),
  ]);
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```

### 4.3 认证 API 示例（登录）

```typescript
// apps/server/src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email, password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ user: data.user });
}
```

### 4.4 联机对战数据流示例

```typescript
// 1. 前端创建房间
const res = await fetch('/api/rooms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // 传递 auth cookie
  body: JSON.stringify({ board_size: 19 }),
});

// 2. BFF API Route
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { board_size } = await request.json();
  const { data, error } = await supabase
    .from('rooms')
    .insert({ host_id: user.id, board_size, status: 'waiting' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ room: data });
}

// 3. 前端落子
await fetch(`/api/rooms/${roomId}/moves`, {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({ x: 3, y: 15 }),
});

// 4. Realtime 订阅（前端可直连 Supabase 仅用于接收）
const channel = supabaseClient
  .channel(`room-${roomId}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'moves',
    filter: `room_id=eq.${roomId}` },
    (payload) => { /* 渲染对手落子 */ })
  .subscribe();
```

### 4.5 Realtime 生命周期管理
```typescript
// 组件挂载时订阅
onMounted(() => {
  channel.subscribe();
});

// 组件卸载时必须取消订阅
onUnmounted(() => {
  supabase.removeChannel(channel);
  // 或 channel.unsubscribe();
});
```

## 5. 常见问题排查

### 5.1 Canvas 坐标偏移
- **根因**：DPR 缩放未正确处理，`canvas.width = boardPixelSize * dpr`
- **修复**：使用 `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` 统一缩放坐标系

### 5.2 页面高度异常增长
- **根因**：每次 `draw()` 重新设置 canvas.width/height 引发重排
- **修复**：追踪上次尺寸（`lastCanvasSize` / `lastDpr`），仅在变化时更新

### 5.3 弹窗内子元素被裁剪
- **根因**：父容器 `overflow-y-auto` 裁剪了 `position: absolute` 子元素
- **修复**：使用 `position: fixed` + `getBoundingClientRect()` 动态坐标定位，提升 z-index 到 z-[60]

### 5.4 组件 Props 传递
- 新增 prop 时确保在组件定义、父组件传递两处同步修改
- Props 使用 kebab-case（模板）/ camelCase（TypeScript）

### 5.5 落子预览双方无颜色区分
- **根因**：`drawHoverPreview` 使用平涂 fill，白方 `#fff` 在 burlywood 背景几乎不可见
- **修复**：改用 `createRadialGradient` 径向渐变（与 `drawStones` 相同绘制方式）

### 5.6 BFF API 401 未授权
- 检查是否在 `fetch()` 中设置了 `credentials: 'include'`
- 检查 BFF CORS 是否允许 credentials
- 检查 `createServerClient()` 是否正确读取了 auth cookie

### 5.7 Infisical 密钥获取失败
- 确认 `INFISICAL_TOKEN` 和 `INFISICAL_PROJECT_ID` 已正确配置在 `.env.local`
- 确认 Infisical 项目中 `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` 三个密钥已创建
- 确认密钥所在的 environment（dev/prod）与 `NODE_ENV` 匹配

### 5.8 Supabase RLS 拒绝问题
- 检查 `auth.uid()` 是否与 `player_id` 匹配
- 检查是否在 `is_room_participant` 返回 true 的房间中
- 检查 `board_size` 是否在允许值范围（9/13/19）
- 如需绕过 RLS，在 BFF 中使用 `createAdminClient()`

### 5.9 Realtime 不推送
- 确认 `moves` 表在 `supabase_realtime` publication 中
- 确认 channel 订阅的 event 类型正确（`INSERT`）
- 确认 RLS SELECT 策略允许该用户读取
- 确认 `room_id` filter 正确匹配

### 5.10 端口冲突（前端 + BFF 均为 3000）
- 修改 `apps/server/package.json` 中 `"dev": "next dev --port 3001"`
- 同步更新 `apps/server/next.config.mjs` 中 CORS `Access-Control-Allow-Origin` 为 `http://localhost:3000`
