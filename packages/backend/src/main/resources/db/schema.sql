-- PetSchool 数据库建表脚本
-- 数据库名：pet_school

CREATE DATABASE IF NOT EXISTS `pet_school` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `pet_school`;

-- 宠物信息表
DROP TABLE IF EXISTS `pet`;
CREATE TABLE `pet` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建用户ID',
  `student_id` VARCHAR(32) NOT NULL COMMENT '学号（格式：P20240001）',
  `name` VARCHAR(64) NOT NULL COMMENT '宠物姓名',
  `species` VARCHAR(32) NOT NULL COMMENT '种类（狗、猫等）',
  `breed` VARCHAR(64) DEFAULT NULL COMMENT '品种',
  `age` INT NOT NULL COMMENT '年龄（月）',
  `weight` DECIMAL(5,2) NOT NULL COMMENT '体重（kg）',
  `gender` TINYINT NOT NULL COMMENT '性别：1-公，2-母',
  `photo_url` VARCHAR(512) NOT NULL COMMENT '照片 URL',
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
  KEY `idx_species` (`species`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_pet_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COMMENT='宠物信息表';

-- 轮播图表
DROP TABLE IF EXISTS `carousel`;
CREATE TABLE `carousel` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `image_url` VARCHAR(512) NOT NULL COMMENT '图片 URL',
  `title` VARCHAR(128) DEFAULT NULL COMMENT '标题',
  `link_url` VARCHAR(512) DEFAULT NULL COMMENT '跳转链接',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表';

-- 用户表
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL COMMENT '用户名',
  `password` VARCHAR(128) NOT NULL COMMENT '密码（加密存储）',
  `nickname` VARCHAR(64) DEFAULT NULL COMMENT '昵称',
  `email` VARCHAR(128) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(32) DEFAULT NULL COMMENT '手机号',
  `avatar_url` VARCHAR(512) DEFAULT NULL COMMENT '头像 URL',
  `role` TINYINT DEFAULT 0 COMMENT '角色：0-普通用户，1-管理员',
  `status` TINYINT DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 收藏表
DROP TABLE IF EXISTS `favorite`;
CREATE TABLE `favorite` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `pet_id` BIGINT UNSIGNED NOT NULL COMMENT '宠物ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_pet` (`user_id`, `pet_id`),
  KEY `idx_pet_id` (`pet_id`),
  CONSTRAINT `fk_favorite_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorite_pet` FOREIGN KEY (`pet_id`) REFERENCES `pet` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- 插入测试数据
-- 轮播图测试数据
INSERT INTO `carousel` (`image_url`, `title`, `link_url`, `sort_order`, `status`) VALUES
('/images/carousel/banner1.jpg', '欢迎加入宠物学校', 'https://yl-pet-school.xyz', 1, 1),
('/images/carousel/banner2.jpg', '专业宠物训练课程', '', 2, 1),
('/images/carousel/banner3.jpg', '宠物健康讲座', '', 3, 1);

-- 宠物测试数据
INSERT INTO `pet` (`student_id`, `name`, `species`, `breed`, `age`, `weight`, `gender`, `photo_url`, `description`, `owner_name`, `owner_contact`, `is_vaccinated`, `vaccination_date`, `is_neutered`, `health_status`, `status`) VALUES
('P20240001', '旺财', '狗', '金毛', 24, 25.5, 1, '/images/pets/wangcai.jpg', '活泼可爱的金毛', '张三', '13800138001', 1, '2024-01-15', 0, '健康', 1),
('P20240002', '咪咪', '猫', '布偶猫', 12, 4.2, 2, '/images/pets/mimi.jpg', '温顺的布偶猫公主', '李四', '13800138002', 1, '2024-02-20', 1, '健康', 1),
('P20240003', '小黑', '狗', '拉布拉多', 36, 28.0, 1, '/images/pets/xiaohei.jpg', '忠诚的拉布拉多', '王五', '13800138003', 1, '2023-12-10', 0, '健康', 1),
('P20240004', '小白', '猫', '英短', 24, 5.0, 1, '/images/pets/xiaobai.jpg', '高冷的英短少爷', '赵六', '13800138004', 0, NULL, 0, '需要补种疫苗', 1),
('P20240005', '豆豆', '狗', '泰迪', 12, 3.5, 2, '/images/pets/doudou.jpg', '聪明的泰迪宝宝', '钱七', '13800138005', 1, '2024-03-01', 0, '健康', 1);

-- ============================================================
-- 校园活动（2026-09 新增）
--
-- ⚠️ 再次提醒：本文件**只是文档，不是数据源**。按项目规则，数据库结构一律以
-- 直连真实库的 SHOW TABLES / DESCRIBE 结果为准——本文件已经和真实库脱节过
-- （pet_pending 表真实存在却从未写进这里）。以下 DDL 与真实库一致，
-- 是为了让下一个读代码的人不必再去连库确认，不代表可以直接执行本文件重建库。
-- ============================================================

CREATE TABLE `activity` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title`          VARCHAR(128)    NOT NULL                COMMENT '活动标题',
  `description`    VARCHAR(512)    DEFAULT NULL            COMMENT '活动简介',
  `location`       VARCHAR(128)    NOT NULL                COMMENT '活动地点',
  `start_time`     DATETIME        NOT NULL                COMMENT '开始时间',
  `end_time`       DATETIME        NOT NULL                COMMENT '结束时间',
  `cover_url`      VARCHAR(512)    DEFAULT NULL            COMMENT '封面图URL，为空时前端用主题渐变兜底',
  `theme`          VARCHAR(16)     NOT NULL DEFAULT 'teal' COMMENT '卡片配色主题键（teal/orange/pink/blue/red/purple），注意不是 Tailwind 类名',
  `status`         TINYINT         NOT NULL DEFAULT 1      COMMENT '0-已下架,1-正常',
  `create_user_id` BIGINT UNSIGNED DEFAULT NULL            COMMENT '创建人（管理员）ID',
  `create_time`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='校园活动表';
-- 注意：本表刻意没有 `deleted` 列。application.yml 全局配了
-- logic-delete-field: deleted，实体里一旦出现同名字段，MyBatis-Plus 会立刻
-- 开启逻辑删除，所有查询会被悄悄加上 deleted=0。软删除沿用 `status` 手写。

CREATE TABLE `activity_signup` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `activity_id` BIGINT UNSIGNED NOT NULL                COMMENT '活动ID',
  `user_id`     BIGINT UNSIGNED NOT NULL                COMMENT '报名用户ID',
  `pet_name`    VARCHAR(64)     NOT NULL                COMMENT '宠物姓名',
  `owner_name`  VARCHAR(64)     NOT NULL                COMMENT '主人姓名',
  `phone`       VARCHAR(32)     NOT NULL                COMMENT '手机号',
  `email`       VARCHAR(128)    DEFAULT NULL            COMMENT '邮箱',
  `note`        VARCHAR(256)    DEFAULT NULL            COMMENT '备注',
  `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_activity_user` (`activity_id`, `user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='活动报名表';
-- uk_activity_user 是防重复报名的**真正防线**：service 层的前置查重只为给出
-- 友好文案，并发下两个请求可能同时通过，唯一键才拦得住（冲突翻译成业务码 1010）。
-- 取消报名是物理删除（与 favorite 取消收藏一致），不保留历史报名记录。
