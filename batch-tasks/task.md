# PetSchool 后端开发任务清单 - 进度跟踪

> 本文档用于跟踪 PetSchool 后端开发任务的完成状态
> 最后更新：2026-03-24

------

## 任务清单

### 任务组 A：基础设施搭建 ✅ 已完成

#### A-1：项目初始化 ✅ 已完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | Spring Boot 项目创建与基础配置                               |
| **输出**     | 可运行的 Spring Boot 应用                                    |
| **完成内容** | 1. 创建 pom.xml（Spring Boot 3.2.0 + MyBatis Plus + MySQL + Lombok + Knife4j） 2. 配置 application.yml 3. 创建 PetSchoolApplication.java 启动类 4. 配置项目目录结构 |
| **文件路径** | `packages/backend/pom.xml`, `packages/backend/src/main/java/com/petschool/PetSchoolApplication.java` |

------

#### A-2：数据库建表脚本 ✅ 已完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 编写数据库建表 SQL 脚本                                      |
| **输出**     | `schema.sql` 文件                                            |
| **完成内容** | 1. 创建 pet 表 2. 创建 carousel 表 3. 创建 user 表 4. 插入测试数据 |
| **文件路径** | `packages/backend/src/main/resources/db/schema.sql` |

------

#### A-3：实体类生成 ✅ 已完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 创建数据库对应的实体类                                       |
| **输出**     | `entity/Pet.java`、`entity/Carousel.java`、`entity/User.java` |
| **完成内容** | 1. 创建 Pet 实体 2. 创建 Carousel 实体 3. 创建 User 实体 4. 使用 Lombok @Data 注解 |
| **文件路径** | `packages/backend/src/main/java/com/petschool/entity/` |

------

### 任务组 B：核心功能 - 宠物管理 ✅ 已完成

#### B-1：Mapper 层开发 ✅ 已完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 实现宠物数据访问层（Mapper）                                 |
| **输出**     | `mapper/PetMapper.java` + `resources/mapper/PetMapper.xml`   |
| **完成内容** | 1. 创建 PetMapper 接口 2. 创建 CarouselMapper 接口 3. 编写对应的 XML 文件 4. 实现分页查询、条件筛选 |
| **文件路径** | `packages/backend/src/main/java/com/petschool/mapper/` `packages/backend/src/main/resources/mapper/` |

------

#### B-2：Service 层开发 ✅ 已完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 实现宠物业务逻辑层（Service）                                |
| **输出**     | `service/PetService.java` + `service/impl/PetServiceImpl.java` |
| **完成内容** | 1. 创建 PetService 接口 2. 创建 PetServiceImpl 实现类 3. 实现 CRUD 方法 4. 创建 CarouselService |
| **文件路径** | `packages/backend/src/main/java/com/petschool/service/` |

------

#### B-3：DTO 定义 ✅ 已完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 创建请求和响应 DTO                                           |
| **输出**     | `dto/request/PetCreateRequest.java`、`dto/request/PetUpdateRequest.java`、`dto/request/PetPageRequest.java`、`dto/response/PetResponse.java`、`dto/response/PageResponse.java` |
| **完成内容** | 1. 创建请求 DTO（带校验注解） 2. 创建响应 DTO 3. 实现分页封装类 |
| **文件路径** | `packages/backend/src/main/java/com/petschool/dto/` |

------

#### B-4：Controller 层开发 ✅ 已完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 实现宠物管理 RESTful API                                     |
| **输出**     | `controller/PetController.java`                              |
| **完成内容** | 1. 创建 PetController 2. 实现 GET/POST/PUT/DELETE接口 3. 使用@Valid 参数校验 4. 统一返回 Result<T>格式 5. 创建 CarouselController |
| **文件路径** | `packages/backend/src/main/java/com/petschool/controller/` |

------

### 任务组 C：通用组件 ✅ 已完成

#### C-1：统一响应封装 ✅ 已完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 实现统一响应结果类                                           |
| **输出**     | `common/Result.java`、`common/ResultCode.java`               |
| **完成内容** | 1. 创建 Result<T>泛型类 2. 创建 ResultCode 枚举 3. 提供工厂方法 |
| **文件路径** | `packages/backend/src/main/java/com/petschool/common/` |

------

#### C-2：全局异常处理 ✅ 已完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 实现全局异常处理器                                           |
| **输出**     | `common/exception/GlobalExceptionHandler.java`、`common/exception/BusinessException.java` |
| **完成内容** | 1. 创建 BusinessException 2. 创建 GlobalExceptionHandler 3. 处理各类异常 |
| **文件路径** | `packages/backend/src/main/java/com/petschool/common/exception/` |

------

#### C-3：跨域配置 ✅ 已完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 配置跨域请求支持                                             |
| **输出**     | `config/CorsConfig.java`                                     |
| **完成内容** | 1. 创建 CorsConfig 2. 配置允许的源和方法 |
| **文件路径** | `packages/backend/src/main/java/com/petschool/config/` |

------

#### C-4：Swagger 接口文档配置 ✅ 已完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 集成 Knife4j 生成 API 文档                                   |
| **输出**     | pom.xml 依赖，SwaggerConfig 配置                            |
| **完成内容** | 1. 在 pom.xml 添加 Knife4j 依赖 2. 配置 application.yml 3. Controller 使用@Tag 和@Operation 注解 |
| **文件路径** | `packages/backend/pom.xml` |

------

### 任务组 D：辅助功能 ✅ 已完成

#### D-1：轮播图管理 ✅ 已完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 实现轮播图管理接口                                           |
| **输出**     | CarouselController、CarouselService、CarouselMapper          |
| **完成内容** | 1. 创建 CarouselMapper 2. 创建 CarouselService 3. 创建 CarouselController 4. 实现查询接口 |
| **文件路径** | `packages/backend/src/main/java/com/petschool/` |

------

#### D-2：文件上传服务 ⏳ 待开发

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 实现图片上传接口                                             |
| **输出**     | `controller/FileController.java`、`config/FileUploadConfig.java` |
| **状态**     | 待开发                                                       |

------

### 任务组 E：测试与优化 ⏳ 待完成

#### E-1：接口测试 ⏳ 待完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 使用 Postman 或 Knife4j 测试所有接口                         |
| **状态**     | 待完成 - 需要启动应用后测试                                  |

------

#### E-2：数据初始化 ✅ 已完成

| 项目         | 内容                                                         |
| :----------- | :----------------------------------------------------------- |
| **任务名称** | 插入 Mock 测试数据                                           |
| **输出**     | `db/data.sql` 测试数据脚本                                   |
| **完成内容** | 已在 schema.sql 中包含测试数据插入语句                        |
| **文件路径** | `packages/backend/src/main/resources/db/schema.sql` |

------

## 任务依赖关系图

```
✅ A-1 项目初始化
  ├── ✅ A-2 建表脚本
  ├── ✅ A-3 实体类 ──→ ✅ B-1 Mapper ──→ ✅ B-2 Service ──→ ✅ B-4 Controller
  └── ✅ C-1 响应封装 ──→ ✅ C-2 异常处理 ──→ ✅ B-4 Controller

✅ C-3 跨域配置 (已完成)
✅ C-4 Swagger 配置 (已完成)

✅ D-1 轮播图管理 (已完成)
⏳ D-2 文件上传 (待开发)

⏳ E-1 接口测试 (待完成)
✅ E-2 数据初始化 (已完成)
```

------

## 下一步

1. **配置数据库**：在 MySQL 中执行 `schema.sql` 创建数据库和表
2. **启动应用**：运行 `mvn spring-boot:run` 启动后端服务
3. **接口测试**：访问 http://localhost:8080/api/doc.html 测试接口
4. **前后端联调**：更新前端 API 地址为后端服务地址

------

## 项目结构

```
packages/backend/
├── pom.xml
├── src/main/
│   ├── java/com/petschool/
│   │   ├── PetSchoolApplication.java
│   │   ├── config/              # 配置类 (CORS, MyBatis Plus)
│   │   ├── controller/          # 控制器 (Pet, Carousel)
│   │   ├── service/             # 服务层
│   │   ├── mapper/              # 数据访问层
│   │   ├── entity/              # 实体类
│   │   ├── dto/                 # 请求/响应 DTO
│   │   └── common/              # 通用组件 (Result, 异常处理)
│   └── resources/
│       ├── application.yml
│       ├── db/schema.sql
│       └── mapper/              # MyBatis XML
└── docs/api.md                  # API 文档
```
