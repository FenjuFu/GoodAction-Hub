#!/bin/bash

# 华为云 OBS + CDN 部署脚本
# 使用前请确保已安装并配置华为云 CLI 工具

set -e

# 配置变量
OBS_BUCKET_NAME="${OBS_BUCKET_NAME:-your-bucket-name}"
CDN_DOMAIN_ID="${CDN_DOMAIN_ID:-your-cdn-domain-id}"
REGION="${REGION:-cn-north-4}"

echo "🚀 开始华为云部署流程..."

# 1. 构建静态文件
echo "📦 构建静态文件..."
npm run build:huawei

# 2. 检查构建输出
if [ ! -d "out" ]; then
    echo "❌ 构建失败：未找到 out 目录"
    exit 1
fi

echo "✅ 构建完成"

# 3. 上传到 OBS
echo "☁️ 上传文件到华为云 OBS..."
./hcloud.exe obs sync ./out obs://${OBS_BUCKET_NAME}/ --region=${REGION} --delete

if [ $? -eq 0 ]; then
    echo "✅ 文件上传成功"
else
    echo "❌ 文件上传失败"
    exit 1
fi

# 4. 刷新 CDN 缓存（可选）
if [ ! -z "$CDN_DOMAIN_ID" ] && [ "$CDN_DOMAIN_ID" != "your-cdn-domain-id" ]; then
    echo "🔄 刷新 CDN 缓存..."
    hcloud cdn refresh-cache --domain-id=${CDN_DOMAIN_ID} --type=file --urls="/*"
    
    if [ $? -eq 0 ]; then
        echo "✅ CDN 缓存刷新成功"
    else
        echo "⚠️ CDN 缓存刷新失败，但不影响部署"
    fi
fi

echo "🎉 部署完成！"
echo "📝 请访问您的域名查看部署结果"