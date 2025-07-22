-- 用户表
drop table if exists user;

CREATE TABLE IF NOT EXISTS `user`
(
    `id`              BIGINT PRIMARY KEY                 NOT NULL COMMENT '主键ID（雪花算法生成）',
    `account`         varchar(50)                        NOT NULL COMMENT '账号',
    `password`        varchar(100)                       NOT NULL COMMENT '密码（加密后）',
    `nickname`        varchar(50)                                 DEFAULT NULL COMMENT '昵称',
    `avatar_url`      varchar(255)                                DEFAULT NULL COMMENT '头像URL',
    `phone`           varchar(20)                                 DEFAULT NULL COMMENT '手机号',
    `email`           varchar(50)                                 DEFAULT NULL COMMENT '邮箱',
    `user_type`       enum ('user', 'admin', 'operator') NOT NULL DEFAULT 'user' COMMENT '用户类型（admin=管理员，operator=操作员，user=普通用户）',
    `create_time`     datetime                           NOT NULL COMMENT '创建时间',
    `update_time`     datetime                           NOT NULL COMMENT '更新时间',
    `is_delete`       tinyint(1)                         NOT NULL DEFAULT '0' COMMENT '是否删除（0=未删除，1=已删除）',
    `last_login_time` datetime                                    DEFAULT NULL COMMENT '最后登录时间',
    `last_login_ip`   varchar(50)                                 DEFAULT NULL COMMENT '最后登录IP',
    UNIQUE KEY `idx_account` (`account`),
    KEY `idx_phone` (`phone`),
    KEY `idx_email` (`email`),
    KEY `idx_user_type` (`user_type`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='用户表';