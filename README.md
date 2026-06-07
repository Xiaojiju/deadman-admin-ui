# Deadman Admin

基于 [shadcn-admin](https://github.com/satnaing/shadcn-admin) 模板演进的管理后台前端，对接 **Deadman** 后端 API。提供 RBAC 权限、组织与用户管理、站内信、文件上传等能力，UI 采用 shadcn/ui（New York）+ Tailwind CSS v4。

## 功能概览

| 模块 | 说明 |
| --- | --- |
| **认证** | 用户名密码登录，JWT 存 Cookie；登录后拉取用户资料、权限码、角色 |
| **权限（RBAC）** | 路由守卫 + 侧栏/按钮级 `PermissionGate`；权限码与后端保持一致 |
| **仪表盘** | 登录后默认首页 |
| **站内信** | 收件箱 / 发件箱、未读角标、WebSocket 实时推送与 Toast 提醒 |
| **组织** | 部门树、职位管理 |
| **系统** | 管理端用户、角色、权限列表 |
| **用户端** | 客户端用户管理（依赖服务端装配 `client` 组件） |
| **设置** | 账户资料、头像上传、修改密码、外观、通知位置 |
| **文件** | 头像等文件上传（`multipart/form-data`），公开直链 `/files/**` |
| **国际化** | 简体中文（默认）、English |
| **主题** | 浅色 / 深色、字体、RTL 布局支持 |

## 技术栈

- **框架**：React 19、TypeScript、Vite 8
- **路由**：TanStack Router（文件路由，`src/routes/`）
- **数据**：TanStack Query、Axios
- **表格**：TanStack Table + 自研 `data-table` 封装
- **表单**：React Hook Form + Zod
- **状态**：Zustand（认证会话）
- **UI**：shadcn/ui、Radix UI、Tailwind CSS v4、Lucide Icons
- **i18n**：i18next + react-i18next
- **测试**：Vitest（Browser Mode + Playwright）

## 环境要求

- Node.js 20+
- pnpm 9+
- 运行中的 Deadman 后端（默认 `http://localhost:8080`）

## 快速开始

```bash
# 安装依赖
pnpm install

# 复制环境变量（按需修改代理目标）
cp .env.example .env.local

# 启动开发服务器（默认 http://localhost:5173）
pnpm dev
```

### 环境变量

| 变量 | 说明 |
| --- | --- |
| `VITE_API_BASE_URL` | Axios `baseURL`。开发环境留空即可，走 Vite 代理 |
| `VITE_API_PROXY_TARGET` | 开发代理目标，默认 `http://localhost:8080` |

开发模式下，Vite 会将以下路径代理到后端：

- `/api` — REST API
- `/ws` — WebSocket（站内信实时推送）
- `/files` — 文件公开访问

生产构建时，将 `VITE_API_BASE_URL` 设为后端地址，或确保网关将上述路径转发到同一服务。

## 常用脚本

```bash
pnpm dev          # 开发
pnpm build        # 类型检查 + 生产构建
pnpm preview      # 预览构建产物
pnpm lint         # ESLint
pnpm format       # Prettier 格式化
pnpm test         # Vitest（无头浏览器）
pnpm knip         # 检测未使用文件/导出
```

## 路由与页面

| 路径 | 功能 |
| --- | --- |
| `/sign-in` | 登录 |
| `/` | 仪表盘 |
| `/notifications/inbox` | 站内信 |
| `/organization/departments` | 部门管理 |
| `/organization/positions` | 职位管理 |
| `/system/users` | 管理端用户 |
| `/system/roles` | 角色管理 |
| `/system/permissions` | 权限列表 |
| `/client/users` | 客户端用户（需 `client` 组件） |
| `/settings/account` | 账户与头像 |
| `/settings/password` | 修改密码 |
| `/settings/appearance` | 外观 |
| `/settings/notifications` | 通知位置 |
| `/401` `/403` `/404` `/500` `/503` | 错误页 |

路由定义在 `src/routes/`，页面实现放在 `src/features/<name>/`。

## 项目结构

```
src/
├── api/              # 后端 API 封装（auth、users、files、notifications…）
├── components/       # 通用组件（layout、data-table、permission、ui）
├── constants/        # 权限码、组件编码等常量
├── context/          # Theme、Font、Direction 等 Provider
├── features/         # 业务功能模块（页面入口 + 子组件）
├── hooks/            # 通用 Hooks
├── i18n/             # 国际化配置
├── lib/              # HTTP 客户端、守卫、工具函数
├── locales/          # 翻译文件（zh-CN、en）
├── routes/           # TanStack Router 文件路由（薄层）
├── stores/           # Zustand 状态（auth-store）
└── types/            # 共享 TypeScript 类型
```

路径别名：`@/*` → `src/*`。

## 核心机制

### 认证与会话

1. 登录成功后保存 JWT 到 Cookie（`deadman_access_token`）。
2. `loadSession()` 并行请求用户资料、权限、已装配组件列表。
3. Axios 拦截器自动附加 `Authorization: Bearer <token>`；401 时清空会话并跳转登录。

### 权限控制

- **路由级**：`src/lib/route-permissions.ts` 映射路径 → 权限码。
- **UI 级**：`<PermissionGate permission={PERMISSIONS.XXX}>` 控制菜单、按钮可见性。
- 权限码定义在 `src/constants/permissions.ts`，需与后端 RBAC 保持一致。

### 服务端组件

部分菜单依赖后端已装配的插件组件（如 `client`）。登录后从 `/api/components` 获取列表，未装配时对应路由访问会跳转 404，侧栏项自动隐藏。

### 文件上传

头像等场景使用 `POST /api/files/upload`（`bizType=avatar`），上传成功后用返回的 `accessUrl`（如 `/files/avatar/...`）保存到用户资料。展示时通过 `resolveFileAccessUrl()` 解析为可访问 URL。

### 站内信 WebSocket

连接地址：`ws(s)://<host>/ws/inbox?token=<jwt>`。收到 `INBOX_NOTIFICATION` 消息后刷新未读数并弹出 Toast。Hook 位于 `src/hooks/use-inbox-websocket.ts`。

## 开发约定

- 新功能：在 `src/features/<feature>/` 实现，在 `src/routes/` 注册路由。
- 列表页筛选优先同步到 URL search params（Zod `validateSearch`）。
- 复杂对话框：feature 级 `*Provider` + `useDialogState`。
- **不要**手动修改 `src/routeTree.gen.ts`（由 Router 插件生成）。
- 提交前建议：`pnpm lint && pnpm format && pnpm build`。

### shadcn/ui 定制组件

以下组件含 RTL 或项目定制，CLI 更新前需手动合并：

- **Modified**：`scroll-area`、`sonner`、`separator`
- **RTL**：`alert-dialog`、`calendar`、`command`、`dialog`、`dropdown-menu`、`select`、`table`、`sheet`、`sidebar`、`switch`

添加新组件：

```bash
npx shadcn@latest add <component>
```

## 基于模板

本项目源自 [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin)，已移除 Clerk 登录、Tasks/Apps 等演示模块，并接入 Deadman 后端。原模板中的部分 feature 目录（如 `tasks/`、`chats/`）仍保留在仓库中但无对应路由，可用 `pnpm knip` 查看。

## License

[MIT](./LICENSE)
