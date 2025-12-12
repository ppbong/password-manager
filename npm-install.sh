#!/bin/bash
#################################################################
# npm create vite@latest password-manager -- --template vue-ts
#################################################################

# 配置 npm 镜像源
if [ ! -e .npmrc ]; then
    echo "registry=https://registry.npmmirror.com" > .npmrc
fi

# 配置 Electron 镜像源
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/

# 安装项目依赖
npm install

# 安装 Element Plus 组件库
npm install element-plus @element-plus/icons-vue

# 安装 Vue Router 4 路由库
npm install vue-router@4

# 安装 Pinia 状态管理库
npm install pinia

# 安装 Bcryptjs 密码加密库
npm install bcryptjs

# 安装 Crypto-js 加密库
npm install crypto-js

# 安装 Zxcvbn 密码强度库
npm install zxcvbn

# 安装 SQLite3 数据库库
npm install sqlite3

# 安装 Electron 开发依赖
npm install electron --save-dev

# 安装 Vite 插件 Electron
npm install vite-plugin-electron --save-dev

# 安装 Electron Builder 打包工具
npm install electron-builder --save-dev
