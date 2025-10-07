#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
华为云OBS静态网站托管配置脚本
"""

import requests
import json
import hashlib
import hmac
import base64
from datetime import datetime
import urllib.parse

# 华为云OBS配置
ACCESS_KEY = "HPUA15QQDUNWF7XQSJ54"
SECRET_KEY = "9B7Qrpr7vnjRgJcv7Q78I77EbxwxVKCVGj8UxeRZ"
BUCKET_NAME = "goodaction-hub"
REGION = "cn-north-4"
ENDPOINT = f"obs.{REGION}.myhuaweicloud.com"

def create_signature(method, uri, headers, payload=""):
    """创建华为云OBS API签名"""
    # 构建规范请求
    canonical_uri = uri
    canonical_querystring = ""
    canonical_headers = ""
    signed_headers = ""
    
    # 排序并格式化headers
    sorted_headers = sorted(headers.items())
    for key, value in sorted_headers:
        canonical_headers += f"{key.lower()}:{value}\n"
        if signed_headers:
            signed_headers += ";"
        signed_headers += key.lower()
    
    # 计算payload hash
    payload_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()
    
    # 构建规范请求
    canonical_request = f"{method}\n{canonical_uri}\n{canonical_querystring}\n{canonical_headers}\n{signed_headers}\n{payload_hash}"
    
    # 创建签名字符串
    algorithm = "AWS4-HMAC-SHA256"
    date_stamp = headers.get('x-obs-date', '').split('T')[0]
    credential_scope = f"{date_stamp}/{REGION}/s3/aws4_request"
    string_to_sign = f"{algorithm}\n{headers.get('x-obs-date', '')}\n{credential_scope}\n{hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()}"
    
    # 计算签名
    def sign(key, msg):
        return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()
    
    def get_signature_key(key, date_stamp, region_name, service_name):
        k_date = sign(('AWS4' + key).encode('utf-8'), date_stamp)
        k_region = sign(k_date, region_name)
        k_service = sign(k_region, service_name)
        k_signing = sign(k_service, 'aws4_request')
        return k_signing
    
    signing_key = get_signature_key(SECRET_KEY, date_stamp, REGION, 's3')
    signature = hmac.new(signing_key, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()
    
    # 构建Authorization header
    authorization_header = f"{algorithm} Credential={ACCESS_KEY}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}"
    
    return authorization_header

def configure_website_hosting():
    """配置静态网站托管"""
    
    # 网站配置XML
    website_config = """<?xml version="1.0" encoding="UTF-8"?>
<WebsiteConfiguration>
    <IndexDocument>
        <Suffix>index.html</Suffix>
    </IndexDocument>
    <ErrorDocument>
        <Key>index.html</Key>
    </ErrorDocument>
</WebsiteConfiguration>"""
    
    # 准备请求
    url = f"https://{BUCKET_NAME}.{ENDPOINT}/?website"
    method = "PUT"
    
    # 准备headers
    now = datetime.utcnow()
    timestamp = now.strftime('%Y%m%dT%H%M%SZ')
    
    headers = {
        'Host': f"{BUCKET_NAME}.{ENDPOINT}",
        'x-obs-date': timestamp,
        'Content-Type': 'application/xml',
        'Content-Length': str(len(website_config))
    }
    
    # 创建签名
    authorization = create_signature(method, "/?website", headers, website_config)
    headers['Authorization'] = authorization
    
    try:
        # 发送请求
        response = requests.put(url, headers=headers, data=website_config, timeout=30)
        
        print(f"配置静态网站托管...")
        print(f"状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        
        if response.status_code in [200, 204]:
            print("✅ 静态网站托管配置成功!")
            return True
        else:
            print(f"❌ 配置失败: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 请求失败: {str(e)}")
        return False

def set_bucket_public():
    """设置存储桶为公共读取"""
    
    # 桶策略JSON
    bucket_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{BUCKET_NAME}/*"
            }
        ]
    }
    
    policy_json = json.dumps(bucket_policy)
    
    # 准备请求
    url = f"https://{BUCKET_NAME}.{ENDPOINT}/?policy"
    method = "PUT"
    
    # 准备headers
    now = datetime.utcnow()
    timestamp = now.strftime('%Y%m%dT%H%M%SZ')
    
    headers = {
        'Host': f"{BUCKET_NAME}.{ENDPOINT}",
        'x-obs-date': timestamp,
        'Content-Type': 'application/json',
        'Content-Length': str(len(policy_json))
    }
    
    # 创建签名
    authorization = create_signature(method, "/?policy", headers, policy_json)
    headers['Authorization'] = authorization
    
    try:
        # 发送请求
        response = requests.put(url, headers=headers, data=policy_json, timeout=30)
        
        print(f"设置存储桶公共访问权限...")
        print(f"状态码: {response.status_code}")
        
        if response.status_code in [200, 204]:
            print("✅ 存储桶权限设置成功!")
            return True
        else:
            print(f"❌ 权限设置失败: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 请求失败: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔧 开始配置华为云OBS静态网站托管...")
    
    # 设置存储桶公共访问权限
    if set_bucket_public():
        print()
        
        # 配置静态网站托管
        if configure_website_hosting():
            print()
            print("🎉 配置完成!")
            print()
            print("⚠️  重要提示:")
            print("   华为云OBS基于安全合规要求，禁止通过默认域名使用静态网站托管功能。")
            print("   要正常访问静态网站，您需要:")
            print("   1. 绑定自定义域名")
            print("   2. 配置域名解析")
            print("   3. 通过自定义域名访问网站")
            print()
            print(f"   当前默认访问地址: https://{BUCKET_NAME}.obs-website.{REGION}.myhuaweicloud.com")
            print("   (此地址会下载文件而非显示网页)")
        else:
            print("❌ 静态网站托管配置失败")
    else:
        print("❌ 存储桶权限设置失败")