# 华为云部署指南

本指南将帮助您将 GoodAction-Hub 项目部署到华为云，使用 OBS（对象存储服务）+ CDN 的方式实现静态网站托管。

## 🚀 部署方案

- **静态托管**：使用 Next.js 静态导出功能
- **存储服务**：华为云 OBS（对象存储服务）
- **CDN 加速**：华为云 CDN 全球加速
- **自动化部署**：提供部署脚本和 CI/CD 配置

## 📋 前置要求

### 1. 华为云账号和服务
- 华为云账号
- 开通 OBS 服务
- 开通 CDN 服务（可选，用于加速）
- 创建 IAM 用户并配置访问密钥

### 2. 本地环境
- Node.js 16+ 
- npm 或 yarn
- 华为云 CLI 工具（hcloud）

## 🛠️ 安装华为云 CLI

### Windows
```bash
# 下载并安装华为云 CLI
# 访问：https://support.huaweicloud.com/cli-obs/obs_03_0004.html
```

### macOS/Linux
```bash
# 使用 pip 安装
pip install huaweicloudcli

# 或下载二进制文件
curl -O https://hcli-download.obs.cn-north-1.myhuaweicloud.com/hcloud/latest/hcloud
chmod +x hcloud
sudo mv hcloud /usr/local/bin/
```

## ⚙️ 配置华为云 CLI

```bash
# 配置访问密钥
hcloud configure set --cli-access-key-id=YOUR_ACCESS_KEY_ID
hcloud configure set --cli-secret-access-key=YOUR_SECRET_ACCESS_KEY
hcloud configure set --cli-region=cn-north-4
```

## 🏗️ 项目配置

### 1. 环境变量配置

复制 `.env.example` 为 `.env.local` 并配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：
```env
# 华为云 OBS 存储桶名称
OBS_BUCKET_NAME=your-bucket-name

# 华为云 CDN 域名 ID（可选）
CDN_DOMAIN_ID=your-cdn-domain-id

# 华为云区域
REGION=cn-north-4

# 生产环境配置（可选）
ASSET_PREFIX=https://your-domain.com
BASE_PATH=
```

### 2. 创建 OBS 存储桶

1. 登录华为云控制台
2. 进入 OBS 服务
3. 创建存储桶：
   - 存储桶名称：全局唯一
   - 区域：选择合适的区域
   - 存储类别：标准存储
   - 访问权限：公共读

### 3. 配置静态网站托管

在 OBS 存储桶中：
1. 进入"基础配置" > "静态网站托管"
2. 启用静态网站托管
3. 设置首页：`index.html`
4. 设置错误页面：`404.html`

## 🚀 部署方法

### 方法一：使用部署脚本（推荐）

```bash
# 给脚本执行权限
chmod +x huawei-cloud-deploy.sh

# 执行部署
./huawei-cloud-deploy.sh
```

### 方法二：手动部署

```bash
# 1. 构建静态文件
npm run build:huawei

# 2. 上传到 OBS
hcloud obs sync ./out obs://your-bucket-name/ --region=cn-north-4 --delete

# 3. 刷新 CDN 缓存（可选）
hcloud cdn refresh-cache --domain-id=your-cdn-domain-id --type=file --urls="/*"
```

## 🌐 CDN 配置（可选但推荐）

### 1. 创建 CDN 加速域名

1. 进入华为云 CDN 控制台
2. 创建加速域名
3. 源站类型：对象存储
4. 源站地址：选择您的 OBS 存储桶

### 2. 配置缓存规则

推荐缓存配置：
- HTML 文件：缓存时间 1 小时
- CSS/JS 文件：缓存时间 1 年
- 图片文件：缓存时间 1 个月

### 3. 配置 HTTPS

1. 上传 SSL 证书或使用免费证书
2. 开启 HTTPS 重定向
3. 开启 HTTP/2

## 🔧 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 检查 Node.js 版本
   node --version
   
   # 清理依赖重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **上传失败**
   ```bash
   # 检查华为云 CLI 配置
   hcloud configure list
   
   # 检查存储桶权限
   hcloud obs ls
   ```

3. **页面无法访问**
   - 检查存储桶是否设置为公共读
   - 检查静态网站托管是否启用
   - 检查域名解析是否正确

## 🔗 相关链接

- [华为云 OBS 文档](https://support.huaweicloud.com/obs/)
- [华为云 CDN 文档](https://support.huaweicloud.com/cdn/)
- [华为云 CLI 文档](https://support.huaweicloud.com/cli/)
- [Next.js 静态导出文档](https://nextjs.org/docs/advanced-features/static-html-export)