# CLAUDE.md

> ⚠️ 所有规则中，“数据库使用规则”为最高优先级，Claude 在处理任何数据库相关任务时必须严格遵守。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 项目概述

宠物校园 (PetSchool) 是一个 monorepo 项目，包含 Spring Boot 后端和 React 前端，为校园宠物提供信息登记与展示平台。

---

## 常用命令

### 后端 (Spring Boot)

```bash
cd packages/backend
mvn clean compile        # 编译
mvn spring-boot:run       # 启动开发服务器 (端口8080)
mvn package               # 打包
```

### 前端 (React + Vite)

```bash
cd packages/frontend
npm install               # 安装依赖
npm run dev               # 启动开发服务器 (端口5173)
npm run build             # 构建生产版本
npm run deploy            # 构建并部署到 GitHub Pages
```

---

## 架构

```
packages/
├── backend/              # Spring Boot 3.2 + MyBatis Plus + MySQL
│   └── src/main/java/com/petschool/
│       ├── controller/  # REST API 控制器
│       ├── service/     # 业务逻辑
│       ├── mapper/      # MyBatis Plus Mapper
│       ├── entity/      # 数据库实体
│       ├── dto/         # 数据传输对象
│       ├── vo/          # 视图对象
│       ├── config/      # 配置类 (CORS、JWT拦截器等)
│       ├── interceptor/ # JWT 令牌拦截器
│       └── utils/       # 工具类 (JWT)
│
└── frontend/             # React 18 + TypeScript + Vite
    └── src/
        ├── pages/        # 页面组件
        ├── components/   # 可复用组件
        ├── hooks/        # 自定义 React Hooks
        ├── services/     # API 调用封装
        ├── types/        # TypeScript 类型定义
        └── store/        # Zustand 状态管理
```

---

## 数据库

* **数据库名**: `pet_school`
* **主要表**: `user`, `pet`, `carousel`, `favorite`
* **配置文件**: `packages/backend/src/main/resources/application.yml`
* **建表脚本**: `packages/backend/src/main/resources/db/schema.sql`

---

## 数据库使用规则（Claude必须遵守）

### 🔴 数据源优先级

1. **必须优先使用真实 MySQL 数据库作为唯一可信数据源**
2. **严禁依赖 schema.sql 或任何 .sql 文件作为结构依据**
3. 所有数据库结构必须通过查询获取，而不是猜测

---

### 🔍 操作规范

在进行任何数据库相关操作前，必须执行：

1. 查询真实数据库结构（如：`SHOW TABLES;`、`DESCRIBE 表名;`）
2. 确认字段、类型、约束
3. 再进行代码生成或修改

---

### ⚠️ 禁止行为

* ❌ 不要根据 `schema.sql` 推断表结构
* ❌ 不要假设字段存在
* ❌ 不要编造数据库字段
* ❌ 不要跳过数据库验证步骤

---

### ✅ 推荐行为

* ✔ 使用实际数据库查询结果作为依据
* ✔ 若无法访问数据库，应明确提示用户
* ✔ 所有 SQL 必须基于真实结构生成

---

### 🧠 特别说明

本项目中的：
`packages/backend/src/main/resources/db/schema.sql`

**可能已过时，仅供参考，不可作为真实数据库依据**

---

## API 设计

* **Base URL**: `/api`
* **统一响应格式**: `{ "code": 200, "message": "success", "data": {...} }`
* **认证方式**: JWT (登录后获取 Token，存储在 `Authorization` 请求头)
* **JWT Secret Key**: `xiangxiangaihaha1234567890hahaaixiangxiang1234567890` (见 application.yml)

### 核心 API

| 方法     | 路径                 | 说明          |
| ------ | ------------------ | ----------- |
| POST   | /users/login       | 用户登录        |
| POST   | /users/register    | 用户注册        |
| GET    | /users/profile     | 获取当前用户资料    |
| PUT    | /users/profile     | 更新用户资料      |
| PUT    | /users/password    | 修改密码        |
| GET    | /pets              | 分页获取宠物列表    |
| GET    | /pets/{id}         | 获取宠物详情      |
| POST   | /pets              | 创建宠物登记      |
| GET    | /my-pets           | 获取当前用户的宠物列表 |
| PUT    | /my-pets/{id}      | 更新用户自己的宠物   |
| DELETE | /my-pets/{id}      | 删除用户自己的宠物   |
| GET    | /favorites         | 获取收藏列表      |
| POST   | /favorites/{petId} | 添加收藏        |
| DELETE | /favorites/{petId} | 取消收藏        |

---

## 前端路由

| 路径             | 页面   | 需要认证 |
| -------------- | ---- | ---- |
| /              | 首页   | 否    |
| /login         | 登录页  | 否    |
| /pets          | 宠物列表 | 是    |
| /pets/:id      | 宠物详情 | 是    |
| /pets/:id/edit | 编辑宠物 | 是    |
| /register      | 宠物登记 | 是    |
| /profile       | 个人中心 | 是    |
| /my-pets       | 我的萌宠 | 是    |
| /favorites     | 我的收藏 | 是    |
| /map           | 校园地图 | 是    |

---

## 技术栈

### 后端

* Spring Boot 3.2.0
* MyBatis Plus 3.5.5
* MySQL 8.0
* JWT (jjwt 0.11.5)
* Knife4j (Swagger 文档)

### 前端

* React 18 + TypeScript
* Vite 6.2
* Tailwind CSS 3.4
* Framer Motion 11
* React Router v6
* Zustand 4.5
* React Query 5.17
* Axios

---

## 注意事项

1. 前端开发服务器运行在 `http://localhost:5173`，后端 API 在 `http://localhost:8080/api`
2. JWT Token 保存在 localStorage，key 为 `token`
3. 用户ID保存在 localStorage，key 为 `userId`
4. 软删除使用 `status` 字段 (1=正常，0=禁用)
5. 性别使用数字 (1=公，2=母)
