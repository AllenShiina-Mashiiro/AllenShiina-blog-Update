# NEXUS Blog Update

独立重构版个人博客。该仓库不依赖旧项目运行时代码、Supabase、旧 JSON 文件或旧本地数据库。

## 技术栈

- React 19 / Next.js 15 App Router / TypeScript
- PostgreSQL 18 + Prisma ORM
- Docker Compose（Windows 本地与 Linux 部署共用）
- Nginx（Ubuntu / Linux 反向代理）
- SMTP 六位邮箱验证码、Google OAuth、GitHub OAuth

## Windows 本地启动（Docker Compose）

1. 安装并启动 Docker Desktop。
2. 克隆并进入仓库：
   ```powershell
   git clone https://github.com/AllenShiina-Mashiiro/AllenShiina-blog-Update.git
   cd AllenShiina-blog-Update
   git switch v1.0.1-dev
   ```
3. 创建环境文件并编辑密码：
   ```powershell
   Copy-Item .env.example .env
   ```
   将 `POSTGRES_PASSWORD` 换成强密码；`DATABASE_URL` 中的密码也要同步修改。设置至少 32 位随机 `AUTH_SECRET`。
4. 启动：
   ```powershell
   docker compose up --build -d
   docker compose logs -f app
   ```
5. 浏览器打开 http://localhost:3000 。

容器启动时会执行 `prisma migrate deploy`，数据库数据保存在 Docker named volume `postgres_data` 中。删除容器不会自动删除数据；不要执行 `docker compose down -v`，除非确定要清空数据库。

## 可选：本机 Next.js 开发模式

先启动数据库：`docker compose up -d db`。然后把本机 `.env` 中的 `DATABASE_URL` 主机改为 `localhost`，端口为 `5432`，执行：

```powershell
npm install
npx prisma migrate deploy
npm run dev
```

## 邮箱验证码

配置 `SMTP_HOST`、`SMTP_PORT`、`SMTP_USER`、`SMTP_PASSWORD`、`SMTP_FROM`。验证码有效期 10 分钟，哈希存储、单次使用，并限制发送频率与错误次数。注册使用验证码，不发送魔法登录链接。

## Google / GitHub OAuth

在各自开发者控制台创建 OAuth 应用，并设置回调地址：

- Google：`http://localhost:3000/api/auth/oauth/google/callback`
- GitHub：`http://localhost:3000/api/auth/oauth/github/callback`

将 Client ID / Secret 写入本地 `.env`。线上环境需把回调域名改成线上 `APP_URL`。OAuth 邮箱必须已由提供商验证；若邮箱已关联现有账号，需先登录再绑定，避免静默接管账号。

## 分支

- `master`：稳定版本
- `v1.0.1-dev`：重构开发分支

仅在 Windows 本地与 Ubuntu 虚拟机部署、数据库迁移、认证和主要功能回归通过后，才合并到 `master`。

## 当前开发阶段

当前提交包含基础首页与液态玻璃样式、原项目完整樱花粒子引擎、Prisma 数据模型和初始 PostgreSQL migration、Docker/Nginx 部署骨架、邮箱验证码注册、密码登录、Google/GitHub OAuth 起始与回调流程。完整内容管理、互动、通知、后台、媒体上传与跨环境验收仍在开发中；此阶段不是最终交付版本。
