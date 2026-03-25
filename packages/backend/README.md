# PetSchool Backend

PetSchool 后端 API 服务 - 宠物学校管理系统

## 技术栈

- **Java**: 17
- **框架**: Spring Boot 3.2.0
- **ORM**: MyBatis Plus 3.5.5
- **数据库**: MySQL 8.0
- **API 文档**: Knife4j (Swagger UI)
- **工具库**: Lombok

## 快速开始

### 1. 环境要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0+

### 2. 数据库初始化

```bash
# 登录 MySQL
mysql -u root -p

# 执行建表脚本
source src/main/resources/db/schema.sql
```

### 3. 配置数据库连接

编辑 `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/pet_school?...
    username: root
    password: your_password
```

### 4. 启动项目

```bash
cd packages/backend
mvn spring-boot:run
```

### 5. 访问应用

- **健康检查**: http://localhost:8080/api/health
- **API 文档**: http://localhost:8080/api/doc.html
- **首页**: http://localhost:8080/api/

## 项目结构

```
backend/
├── src/main/java/com/petschool/
│   ├── PetSchoolApplication.java    # 启动类
│   ├── config/                       # 配置类
│   │   ├── CorsConfig.java          # 跨域配置
│   │   └── MybatisPlusConfig.java   # MyBatis Plus 配置
│   ├── controller/                   # 控制器层
│   │   ├── PetController.java       # 宠物管理接口
│   │   └── CarouselController.java  # 轮播图管理接口
│   ├── service/                      # 服务层
│   │   ├── PetService.java
│   │   ├── CarouselService.java
│   │   └── impl/
│   ├── mapper/                       # 数据访问层
│   │   ├── PetMapper.java
│   │   └── CarouselMapper.java
│   ├── entity/                       # 实体类
│   │   ├── Pet.java
│   │   ├── Carousel.java
│   │   └── User.java
│   ├── dto/                          # 数据传输对象
│   │   ├── request/                  # 请求 DTO
│   │   └── response/                 # 响应 DTO
│   └── common/                       # 通用组件
│       ├── Result.java              # 统一响应
│       ├── ResultCode.java          # 响应状态码
│       └── exception/               # 异常处理
├── src/main/resources/
│   ├── application.yml              # 配置文件
│   ├── db/
│   │   └── schema.sql               # 建表脚本
│   └── mapper/                      # MyBatis XML
│       ├── PetMapper.xml
│       └── CarouselMapper.xml
└── pom.xml                          # Maven 配置
```

## API 接口

| 模块 | 路径 | 说明 |
| :--- | :--- | :--- |
| 宠物管理 | /api/pets | CRUD 接口 |
| 轮播图 | /api/carousel | 查询接口 |

详细接口文档请访问：http://localhost:8080/api/doc.html

## 开发计划

- [x] 项目初始化
- [x] 数据库建表
- [x] 实体类创建
- [x] Mapper 层开发
- [x] Service 层开发
- [x] Controller 层开发
- [x] 统一响应封装
- [x] 全局异常处理
- [x] 跨域配置
- [ ] 文件上传服务
- [ ] 用户认证（JWT）
- [ ] 单元测试

## 许可证

MIT
