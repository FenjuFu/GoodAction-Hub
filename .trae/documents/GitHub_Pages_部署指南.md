# GitHub Pages 部署指南 - GoodAction-Hub

## 📋 概述

本指南将帮助您将 GoodAction-Hub（开源项目截止日期网站）部署到 GitHub Pages。该项目基于 Next.js 14、TypeScript 和 Tailwind CSS 构建，已配置为静态导出模式。

## 🚀 部署准备工作

### 1. 前置条件
- ✅ GitHub 账户
- ✅ Git 已安装并配置
- ✅ Node.js 环境（项目已配置）
- ✅ 项目代码已准备就绪

### 2. 项目配置检查
项目已经配置了静态导出所需的设置：
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',           // 静态导出模式
  trailingSlash: true,        // URL 末尾添加斜杠
  skipTrailingSlashRedirect: true,
  distDir: 'out',            // 输出目录
  images: {
    unoptimized: true        // 图片不优化（GitHub Pages 要求）
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.ASSET_PREFIX || '' : '',
  basePath: process.env.NODE_ENV === 'production' ? process.env.BASE_PATH || '' : '',
};
```

## 📁 GitHub 仓库设置

### 1. 创建 GitHub 仓库
1. 登录 GitHub
2. 点击 "New repository"
3. 仓库名称：`GoodAction-Hub`（或您喜欢的名称）
4. 设置为 Public（GitHub Pages 免费版要求）
5. 不要初始化 README、.gitignore 或 license（项目已有）

### 2. 推送代码到 GitHub
```bash
# 在项目根目录执行
git init
git add .
git commit -m "Initial commit: GoodAction-Hub project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/GoodAction-Hub.git
git push -u origin main
```

## ⚙️ GitHub Actions 自动部署配置

### 1. 创建 GitHub Actions 工作流
在项目根目录创建 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          static_site_generator: next

      - name: Restore cache
        uses: actions/cache@v4
        with:
          path: |
            .next/cache
          key: ${{ runner.os }}-nextjs-${{ hashFiles('**/bun.lockb', '**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-nextjs-

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build with Next.js
        run: bun run build
        env:
          NODE_ENV: production

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2. 启用 GitHub Pages
1. 进入 GitHub 仓库
2. 点击 "Settings" 标签
3. 在左侧菜单找到 "Pages"
4. 在 "Source" 下选择 "GitHub Actions"
5. 保存设置

## 🔧 项目配置优化

### 1. 更新 package.json 脚本
确保构建脚本正确：
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "env COREPACK_ENABLE_AUTO_PIN=0 next build",
    "build:github": "next build",
    "start": "next start",
    "lint": "env COREPACK_ENABLE_AUTO_PIN=0 next lint"
  }
}
```

### 2. 创建 .nojekyll 文件
在 `public` 目录下创建 `.nojekyll` 文件（空文件），防止 Jekyll 处理：
```bash
# 在 public 目录下
touch .nojekyll
```

### 3. 配置基础路径（如果需要）
如果您的仓库名不是您的用户名，需要配置 basePath：

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // ... 其他配置
  basePath: process.env.NODE_ENV === 'production' ? '/GoodAction-Hub' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/GoodAction-Hub/' : '',
};
```

## 🌐 自定义域名配置（可选）

### 1. 购买域名
- 推荐：Namecheap、GoDaddy、阿里云等

### 2. 配置 DNS
在域名提供商处添加 CNAME 记录：
```
Type: CNAME
Name: www (或 @)
Value: YOUR_USERNAME.github.io
```

### 3. 在 GitHub 设置自定义域名
1. 在仓库 Settings > Pages
2. 在 "Custom domain" 输入您的域名
3. 勾选 "Enforce HTTPS"
4. 在 `public` 目录创建 `CNAME` 文件，内容为您的域名

## 📋 部署流程

### 1. 自动部署流程
1. 推送代码到 main 分支
2. GitHub Actions 自动触发
3. 构建项目并生成静态文件
4. 部署到 GitHub Pages

### 2. 手动触发部署
1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Deploy to GitHub Pages" 工作流
4. 点击 "Run workflow"

## ✅ 验证部署

### 1. 检查构建状态
- 在 GitHub Actions 中查看构建日志
- 确保所有步骤都成功完成

### 2. 访问网站
- 默认地址：`https://YOUR_USERNAME.github.io/GoodAction-Hub`
- 自定义域名：`https://your-domain.com`

### 3. 功能测试
- ✅ 页面加载正常
- ✅ 多语言切换功能
- ✅ 时区选择功能
- ✅ 筛选和搜索功能
- ✅ 响应式设计

## 🔍 常见问题解决

### 1. 构建失败
**问题**：GitHub Actions 构建失败
**解决**：
- 检查 Node.js 版本兼容性
- 确保所有依赖都在 package.json 中
- 查看构建日志中的具体错误信息

### 2. 页面 404 错误
**问题**：访问页面显示 404
**解决**：
- 确保 basePath 配置正确
- 检查 .nojekyll 文件是否存在
- 确认 GitHub Pages 设置正确

### 3. 静态资源加载失败
**问题**：CSS、JS 或图片无法加载
**解决**：
- 检查 assetPrefix 配置
- 确保 images.unoptimized 设置为 true
- 验证文件路径是否正确

### 4. 多语言功能异常
**问题**：语言切换不工作
**解决**：
- 确保 public/locales 目录结构正确
- 检查 i18n 配置
- 验证语言文件是否正确导出

## 📈 性能优化建议

### 1. 启用压缩
GitHub Pages 自动启用 gzip 压缩

### 2. 缓存策略
- 静态资源自动缓存
- 可通过 headers 配置进一步优化

### 3. CDN 加速
- GitHub Pages 使用 Fastly CDN
- 全球访问速度较快

## 🔄 更新和维护

### 1. 代码更新
```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

### 2. 依赖更新
```bash
bun update
```

### 3. 监控和分析
- 使用 GitHub Insights 查看访问统计
- 可集成 Google Analytics（需要修改代码）

## 📞 技术支持

如果遇到问题，可以：
1. 查看 GitHub Actions 构建日志
2. 检查 GitHub Pages 设置
3. 参考 Next.js 静态导出文档
4. 在项目 Issues 中提问

---

**部署完成后，您的 GoodAction-Hub 网站将在 `https://YOUR_USERNAME.github.io/GoodAction-Hub` 上线！** 🎉