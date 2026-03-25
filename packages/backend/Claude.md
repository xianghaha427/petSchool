# Claude.md - 宠物校园登记网站后端项目

## 项目概述

**项目名称**：PawCampus - 宠物校园登记系统后端
**目标**：为前端提供完整的 RESTful API 服务，管理宠物信息、用户认证、校园地图点位等数据。采用 Spring Boot + Spring MVC + MyBatis 架构，MySQL 作为数据库。

**核心功能模块**：

1. **宠物管理**：宠物信息的增删改查，包括列表分页、详情查询
2. **轮播图管理**：首页轮播图片的管理（可选，可静态配置）
3. **用户认证**：用户登录、注册、权限控制（后续扩展）
4. **校园地图**：宠物活动点位管理（后续扩展）
5. **宠物登记**：用户提交宠物登记申请（后续扩展）

------

## 技术栈

| 类别     | 技术选型                | 说明             |
| :------- | :---------------------- | :--------------- |
| 核心框架 | Spring Boot 2.7.x / 3.x | 快速构建微服务   |
| Web 层   | Spring MVC              | RESTful API 支持 |
| 数据访问 | MyBatis                 | 简化 CRUD 操作   |
| 数据库   | MySQL 8.0               | 数据持久化       |
| 连接池   | HikariCP                | Spring Boot 默认 |
| 接口文档 | Swagger / Knife4j       | API 文档自动生成 |
| 工具库   | Lombok、Hutool          | 简化代码         |
| 校验框架 | Jakarta Validation      | 请求参数校验     |
| 安全框架 | Spring Security（可选） | 认证与授权       |
| 缓存     | Redis（可选）           | 热点数据缓存     |

------

## 数据库设计

### 1. 宠物表 `pet`

sql

```
CREATE TABLE `pet` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `student_id` VARCHAR(32) NOT NULL COMMENT '学号（格式：P20240001）',
  `name` VARCHAR(64) NOT NULL COMMENT '宠物姓名',
  `species` VARCHAR(32) NOT NULL COMMENT '种类（狗、猫等）',
  `breed` VARCHAR(64) DEFAULT NULL COMMENT '品种',
  `age` INT NOT NULL COMMENT '年龄（月）',
  `weight` DECIMAL(5,2) NOT NULL COMMENT '体重（kg）',
  `gender` TINYINT NOT NULL COMMENT '性别：1-公，2-母',
  `photo_url` VARCHAR(512) NOT NULL COMMENT '照片URL',
  `description` VARCHAR(512) DEFAULT NULL COMMENT '简介',
  `owner_name` VARCHAR(64) DEFAULT NULL COMMENT '主人姓名',
  `owner_contact` VARCHAR(128) DEFAULT NULL COMMENT '主人联系方式',
  `vaccination_date` DATE DEFAULT NULL COMMENT '最近疫苗接种日期',
  `is_vaccinated` TINYINT DEFAULT 0 COMMENT '是否已接种疫苗：0-否，1-是',
  `is_neutered` TINYINT DEFAULT 0 COMMENT '是否已绝育：0-否，1-是',
  `health_status` VARCHAR(128) DEFAULT NULL COMMENT '健康状态备注',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_id` (`student_id`),
  KEY `idx_name` (`name`),
  KEY `idx_species` (`species`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物信息表';
```



### 2. 轮播图表 `carousel`（可选）

sql

```
CREATE TABLE `carousel` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `image_url` VARCHAR(512) NOT NULL COMMENT '图片URL',
  `title` VARCHAR(128) DEFAULT NULL COMMENT '标题',
  `link_url` VARCHAR(512) DEFAULT NULL COMMENT '跳转链接',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表';
```



### 3. 用户表 `user`（后续扩展）

sql

```
CREATE TABLE `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL COMMENT '用户名',
  `password` VARCHAR(128) NOT NULL COMMENT '密码（加密存储）',
  `email` VARCHAR(128) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(32) DEFAULT NULL COMMENT '手机号',
  `avatar_url` VARCHAR(512) DEFAULT NULL COMMENT '头像URL',
  `role` TINYINT DEFAULT 0 COMMENT '角色：0-普通用户，1-管理员',
  `status` TINYINT DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```



------

## 项目目录结构

text

```
src/main/java/com/pawcampus/
├── PawCampusApplication.java          # 启动类
├── controller/                         # 控制器层
│   ├── PetController.java              # 宠物相关接口
│   ├── CarouselController.java         # 轮播图接口（可选）
│   └── UserController.java             # 用户接口（后续）
├── service/                            # 服务层
│   ├── PetService.java                 # 宠物服务接口
│   ├── PetServiceImpl.java             # 宠物服务实现
│   ├── CarouselService.java            # 轮播图服务接口
│   └── CarouselServiceImpl.java
├── mapper/                             # MyBatis Mapper 接口
│   ├── PetMapper.java                  # 宠物数据访问
│   └── CarouselMapper.java             # 轮播图数据访问
├── entity/                             # 实体类（对应数据库表）
│   ├── Pet.java
│   ├── Carousel.java
│   └── User.java
├── dto/                                # 数据传输对象
│   ├── request/                        # 请求 DTO
│   │   ├── PetCreateRequest.java       # 创建宠物请求
│   │   ├── PetUpdateRequest.java       # 更新宠物请求
│   │   └── PetPageRequest.java         # 分页查询请求
│   └── response/                       # 响应 DTO
│       ├── PetResponse.java            # 宠物响应
│       └── PageResponse.java           # 分页响应封装
├── vo/                                 # 视图对象（可选）
├── config/                             # 配置类
│   ├── CorsConfig.java                 # 跨域配置
│   ├── SwaggerConfig.java              # Swagger 配置
│   └── WebMvcConfig.java               # Web MVC 配置
├── common/                             # 通用组件
│   ├── Result.java                     # 统一响应结果封装
│   ├── ResultCode.java                 # 响应状态码枚举
│   └── exception/                      # 异常处理
│       ├── BusinessException.java      # 业务异常
│       └── GlobalExceptionHandler.java # 全局异常处理器
├── enums/                              # 枚举类
│   ├── GenderEnum.java                 # 性别枚举
│   └── PetStatusEnum.java              # 宠物状态枚举
└── utils/                              # 工具类
    └── IdGenerator.java                # ID 生成器（雪花算法等）
```



### 资源文件结构

text

```
src/main/resources/
├── application.yml                     # 主配置文件
├── application-dev.yml                 # 开发环境配置
├── application-prod.yml                # 生产环境配置
├── mapper/                             # MyBatis XML 映射文件
│   ├── PetMapper.xml
│   └── CarouselMapper.xml
├── db/                                 # 数据库脚本
│   └── schema.sql                      # 建表脚本
└── static/                             # 静态资源（可选）
```



------

## 实体类定义（关键）

### Pet.java

java

```
package com.pawcampus.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
public class Pet {
    private Long id;
    private String studentId;
    private String name;
    private String species;
    private String breed;
    private Integer age;          // 年龄（月）
    private java.math.BigDecimal weight;
    private Integer gender;       // 1-公，2-母
    private String photoUrl;
    private String description;
    private String ownerName;
    private String ownerContact;
    private LocalDate vaccinationDate;
    private Integer isVaccinated; // 0-否，1-是
    private Integer isNeutered;   // 0-否，1-是
    private String healthStatus;
    private Integer status;       // 0-禁用，1-正常
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```



------

## API 接口规范

### 统一响应格式

json

```
{
  "code": 200,
  "message": "success",
  "data": {}
}
```



### 宠物管理接口

| 方法   | 路径             | 描述             | 请求参数                                            |
| :----- | :--------------- | :--------------- | :-------------------------------------------------- |
| GET    | `/api/pets`      | 分页获取宠物列表 | `page`(默认1), `size`(默认12), `species`, `keyword` |
| GET    | `/api/pets/{id}` | 获取宠物详情     | 路径参数 id                                         |
| POST   | `/api/pets`      | 创建宠物         | 请求体 PetCreateRequest                             |
| PUT    | `/api/pets/{id}` | 更新宠物         | 路径参数 id，请求体 PetUpdateRequest                |
| DELETE | `/api/pets/{id}` | 删除宠物         | 路径参数 id                                         |

### 轮播图接口（可选）

| 方法 | 路径            | 描述                 |
| :--- | :-------------- | :------------------- |
| GET  | `/api/carousel` | 获取启用的轮播图列表 |

### 分页请求 DTO

java

```
package com.pawcampus.dto.request;

import lombok.Data;
import javax.validation.constraints.Min;

@Data
public class PetPageRequest {
    @Min(value = 1, message = "页码最小为1")
    private Integer page = 1;
    
    @Min(value = 1, message = "每页大小最小为1")
    private Integer size = 12;
    
    private String species;      // 筛选种类
    private String keyword;      // 关键词搜索（姓名/学号）
}
```



### 分页响应 DTO

java

```
package com.pawcampus.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class PageResponse<T> {
    private List<T> data;
    private Long total;
    private Integer page;
    private Integer size;
    private Integer totalPages;
    
    public PageResponse(List<T> data, Long total, Integer page, Integer size) {
        this.data = data;
        this.total = total;
        this.page = page;
        this.size = size;
        this.totalPages = (int) Math.ceil((double) total / size);
    }
}
```



------

## MyBatis Mapper 示例

### PetMapper.java

java

```
package com.pawcampus.mapper;

import com.pawcampus.entity.Pet;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface PetMapper {
    
    /**
     * 分页查询宠物列表
     */
    List<Pet> selectPage(@Param("offset") int offset, 
                         @Param("size") int size,
                         @Param("species") String species,
                         @Param("keyword") String keyword);
    
    /**
     * 统计总数
     */
    long count(@Param("species") String species,
               @Param("keyword") String keyword);
    
    /**
     * 根据ID查询
     */
    Pet selectById(@Param("id") Long id);
    
    /**
     * 根据学号查询
     */
    Pet selectByStudentId(@Param("studentId") String studentId);
    
    /**
     * 插入
     */
    int insert(Pet pet);
    
    /**
     * 更新
     */
    int update(Pet pet);
    
    /**
     * 删除
     */
    int deleteById(@Param("id") Long id);
}
```



### PetMapper.xml

xml

```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.pawcampus.mapper.PetMapper">
    
    <resultMap id="BaseResultMap" type="com.pawcampus.entity.Pet">
        <id column="id" property="id"/>
        <result column="student_id" property="studentId"/>
        <result column="name" property="name"/>
        <result column="species" property="species"/>
        <result column="breed" property="breed"/>
        <result column="age" property="age"/>
        <result column="weight" property="weight"/>
        <result column="gender" property="gender"/>
        <result column="photo_url" property="photoUrl"/>
        <result column="description" property="description"/>
        <result column="owner_name" property="ownerName"/>
        <result column="owner_contact" property="ownerContact"/>
        <result column="vaccination_date" property="vaccinationDate"/>
        <result column="is_vaccinated" property="isVaccinated"/>
        <result column="is_neutered" property="isNeutered"/>
        <result column="health_status" property="healthStatus"/>
        <result column="status" property="status"/>
        <result column="create_time" property="createTime"/>
        <result column="update_time" property="updateTime"/>
    </resultMap>
    
    <sql id="Base_Column_List">
        id, student_id, name, species, breed, age, weight, gender, photo_url,
        description, owner_name, owner_contact, vaccination_date,
        is_vaccinated, is_neutered, health_status, status, create_time, update_time
    </sql>
    
    <select id="selectPage" resultMap="BaseResultMap">
        SELECT <include refid="Base_Column_List"/>
        FROM pet
        WHERE status = 1
        <if test="species != null and species != ''">
            AND species = #{species}
        </if>
        <if test="keyword != null and keyword != ''">
            AND (name LIKE CONCAT('%', #{keyword}, '%') 
                 OR student_id LIKE CONCAT('%', #{keyword}, '%'))
        </if>
        ORDER BY create_time DESC
        LIMIT #{offset}, #{size}
    </select>
    
    <select id="count" resultType="long">
        SELECT COUNT(*)
        FROM pet
        WHERE status = 1
        <if test="species != null and species != ''">
            AND species = #{species}
        </if>
        <if test="keyword != null and keyword != ''">
            AND (name LIKE CONCAT('%', #{keyword}, '%') 
                 OR student_id LIKE CONCAT('%', #{keyword}, '%'))
        </if>
    </select>
    
    <select id="selectById" resultMap="BaseResultMap">
        SELECT <include refid="Base_Column_List"/>
        FROM pet WHERE id = #{id}
    </select>
    
    <select id="selectByStudentId" resultMap="BaseResultMap">
        SELECT <include refid="Base_Column_List"/>
        FROM pet WHERE student_id = #{studentId}
    </select>
    
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO pet (
            student_id, name, species, breed, age, weight, gender,
            photo_url, description, owner_name, owner_contact,
            vaccination_date, is_vaccinated, is_neutered, health_status, status
        ) VALUES (
            #{studentId}, #{name}, #{species}, #{breed}, #{age}, #{weight}, #{gender},
            #{photoUrl}, #{description}, #{ownerName}, #{ownerContact},
            #{vaccinationDate}, #{isVaccinated}, #{isNeutered}, #{healthStatus}, #{status}
        )
    </insert>
    
    <update id="update">
        UPDATE pet
        SET
            student_id = #{studentId},
            name = #{name},
            species = #{species},
            breed = #{breed},
            age = #{age},
            weight = #{weight},
            gender = #{gender},
            photo_url = #{photoUrl},
            description = #{description},
            owner_name = #{ownerName},
            owner_contact = #{ownerContact},
            vaccination_date = #{vaccinationDate},
            is_vaccinated = #{isVaccinated},
            is_neutered = #{isNeutered},
            health_status = #{healthStatus},
            status = #{status}
        WHERE id = #{id}
    </update>
    
    <delete id="deleteById">
        DELETE FROM pet WHERE id = #{id}
    </delete>
    
</mapper>
```



------

## 统一响应封装

### Result.java

java

```
package com.pawcampus.common;

import lombok.Data;

@Data
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
    
    private Result(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
    
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }
    
    public static <T> Result<T> success() {
        return success(null);
    }
    
    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message, null);
    }
    
    public static <T> Result<T> error(String message) {
        return error(500, message);
    }
}
```



### 全局异常处理器

java

```
package com.pawcampus.common.exception;

import com.pawcampus.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }
    
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.error("系统内部错误");
    }
}
```



------

## 配置文件示例

### application.yml

yaml

```
spring:
  profiles:
    active: dev
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

# MyBatis 配置
mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.pawcampus.entity
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

# 日志配置
logging:
  level:
    com.pawcampus: debug
```



### application-dev.yml

yaml

```
server:
  port: 8080

spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/pawcampus?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=utf8
    username: root
    password: 123456
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
```



### 跨域配置

java

```
package com.pawcampus.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")  // 前端开发地址
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```



------

## 开发状态

### 已完成（待实现）

- 项目初始化（Spring Boot 项目创建）
- 数据库建表（执行 schema.sql）
- 实体类定义
- Mapper 接口及 XML 配置
- Service 层实现
- Controller 层实现
- 统一响应封装
- 全局异常处理
- 跨域配置
- Swagger 接口文档配置

### 后续扩展

1. 用户认证模块（Spring Security + JWT）
2. 文件上传服务（宠物照片）
3. Redis 缓存热点数据
4. 校园地图点位管理
5. 宠物登记审核流程

------

## 注意事项

1. **学号唯一性**：`student_id` 字段需唯一，插入前需校验
2. **分页参数校验**：使用 `@Valid` 注解校验请求参数
3. **软删除设计**：推荐使用 `status` 字段实现逻辑删除，避免数据丢失
4. **SQL 注入防护**：使用 MyBatis 参数化查询（`#{}`）
5. **接口文档**：配置 Knife4j 方便前端调试