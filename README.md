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

先启动数据库：`docker compose up -d db`。然后把本机 `.env` 中的 `DATABASE_URL` 主机改为 `localhost`，端口为 `5433`，执行：

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

开发分支已接入内容管理、互动、通知、用户与内容管理后台、媒体上传、站点外观配置和主题切换。仍需完成 Windows Docker Desktop 与 Ubuntu 虚拟机的实机部署回归，并验证 SMTP、Google/GitHub OAuth 的真实凭据配置；这些环境验收未完成前，不视为最终交付。


## 已接入的功能（开发分支）

- 邮箱验证码注册、密码登录、Google / GitHub OAuth 登录与已登录账号绑定；用户公开 ID 使用小写字母、数字和下划线。
- 学习笔记、资源、生活、文章四类内容；草稿、发布、归档，作者/管理员编辑与删除。
- Markdown / GFM 渲染、代码高亮、文章封面与正文图片上传（单张最大 20MB，限制为常见图片格式，正文可一次批量上传最多 20 张并自动排成响应式图片墙）；头像/Logo 正方形裁剪、封面/背景 16:9 裁剪并可调整裁剪位置，正文图片支持放大与原图下载。
- 点赞、收藏、个人主页置顶、评论与回复、分享链接、阅读量。
- 个人资料编辑、公开个人主页、账户 UID 查看/复制、成员搜索目录、我的收藏、通知中心、需二次确认与密码校验的自助账户删除。
- 管理后台：用户角色、封禁与删除，内容审核/状态管理/删除，公告发布/隐藏/删除，站点标题、简介、关于页面文案、双图斜向分割背景、Logo、背景透明度、全站默认主题与强调色设置；用户可独立选择深浅色和个人强调色。
- 深浅色切换与个人强调色；居中悬浮导航、双图斜向分割背景；原项目完整 SakuraPetals 粒子效果保留。
- 上传图片存放在 Docker named volume `media_uploads`；数据库存放在 `postgres_data`。两者都不会因普通容器重建而自动清空。

## 图片上传与持久化

图片上传需要已登录账号。API 会校验 MIME 类型与文件签名，限制 20MB，并使用随机文件名。Docker Compose 会将 `/app/public/uploads` 挂载到 `media_uploads` 持久卷。线上部署请把 `APP_URL` 设置为真实 HTTPS 域名，避免生成错误的绝对图片地址。

## 当前验收边界

GitHub Actions 会检查 Prisma schema / migration、ESLint、TypeScript、Next.js production build 和 Docker image build。CI 通过不等于已在你的 Windows Docker Desktop 或 Ubuntu 虚拟机上完成实机部署；这两步仍需在你的机器上按上面的步骤运行并回归。开发期间不要把 `v1.0.1-dev` 合并到 `master`，直到本地部署、OAuth/SMTP 配置和主要功能验收完成。
