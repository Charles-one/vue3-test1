# Vue 3 商品采购系统

这是一个基于 Vue 3 + Element Plus 的商品采购后台管理系统，采用最新的 Vue 3 组合式 API 和 Vite 构建工具。

## 功能特性

- 🚀 采用 Vue 3 + Vite + Element Plus 最新技术栈
- 📦 Pinia 状态管理，支持持久化
- 🔐 基于 Token 的权限管理
- 📝 商品管理（商品列表、分类管理）
- 📋 订单管理（订单列表、订单详情）
- 👥 用户管理（用户列表、状态管理）
- 🔑 权限管理（管理员账户管理）
- 📊 数据分析（图表统计展示）
- 🎨 自定义主题配置
- 📱 响应式布局设计

## 技术栈

- Vue 3.5.13
- Vite 6.0.11
- Element Plus 2.9.3
- Pinia 2.0.0
- Vue Router 4.5.0
- Axios 1.7.9
- ECharts 5.6.0
- dayjs 1.11.13

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 7

### 安装依赖

```sh
npm install
```

### 开发环境运行

```sh
# 启动 mock 服务和开发服务器
npm run start

# 仅启动开发服务器
npm run dev
```

### 生产环境构建

```sh
npm run build
```

## 项目结构

```
├── mock                     # Mock 数据
├── public                   # 静态资源
├── src
│   ├── api                 # API 接口
│   │   ├── admin.js       # 管理员相关接口
│   │   ├── goods.js       # 商品相关接口
│   │   ├── order.js       # 订单相关接口
│   │   └── user.js        # 用户相关接口
│   ├── components          # 公共组件
│   │   └── LazyImage.vue  # 图片懒加载组件
│   ├── router              # 路由配置
│   ├── stores              # Pinia 状态管理
│   │   ├── goods.js       # 商品状态
│   │   ├── order.js       # 订单状态
│   │   └── user.js        # 用户状态
│   ├── utils               # 工具函数
│   │   ├── request.js     # axios 封装
│   │   └── upload.js      # 上传工具
│   ├── views               # 页面组件
│   │   ├── Analysis       # 数据分析
│   │   ├── Goods          # 商品管理
│   │   ├── Layout         # 布局组件
│   │   ├── Login          # 登录页面
│   │   ├── Order          # 订单管理
│   │   └── Users          # 用户管理
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── .env.development        # 开发环境配置
├── .prettierrc             # Prettier 配置
├── index.html              # HTML 模板
├── jsconfig.json           # JavaScript 配置
├── package.json            # 项目依赖
└── vite.config.js          # Vite 配置
```

## 功能模块

### 1. 商品管理

- 商品列表：支持商品的增删改查
- 商品分类：支持分类的层级管理
- 图片上传：支持商品图片的上传和预览
- 库存管理：支持商品库存的实时更新

### 2. 订单管理

- 订单列表：展示所有订单信息
- 订单详情：查看订单详细信息
- 订单状态：支持订单状态流转（待支付、已支付、配货完成、出库成功、已关闭）
- 批量操作：支持批量处理订单状态

### 3. 用户管理

- 用户列表：展示用户信息
- 状态管理：支持启用/禁用用户
- 批量操作：支持批量处理用户状态

### 4. 权限管理

- 管理员账户：支持管理员的增删改查
- 角色管理：支持超级管理员和普通管理员角色
- 权限控制：基于角色的权限控制

### 5. 数据分析

- 数据概览：展示今日订单数、活跃用户数、转化率等核心指标
- 趋势图表：展示各项数据的历史趋势
- 商品分析：展示商品销售占比和排行

## 开发规范

- 组件命名：使用 PascalCase 命名法
- 文件组织：按功能模块划分目录结构
- 状态管理：使用 Pinia 进行集中式状态管理
- 接口请求：统一使用封装的 request 工具
- 代码格式：使用 Prettier 进行代码格式化

## 登录信息

- 账号：admin
- 密码：123456

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 13
- Edge >= 88

## 作者

- 作者：Charles
- Email：cwcharles0323@163.com
- GitHub：https://github.com/Charles-one

## 致谢

感谢 Element Plus 团队提供的优秀组件库！
