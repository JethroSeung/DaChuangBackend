-- UAV Docking Management System Init SQL

-- 删除并创建 region 表
DROP TABLE IF EXISTS `region`;
CREATE TABLE `region` (
  `id` int NOT NULL AUTO_INCREMENT,
  `region_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入 region 数据
INSERT INTO `region` VALUES (1,'North'),(2,'South'),(3,'East'),(4,'West');

-- 删除并创建 regions 表
DROP TABLE IF EXISTS `regions`;
CREATE TABLE `regions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `region_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入 regions 数据
INSERT INTO `regions` VALUES (1,'Region A'),(2,'Region B'),(3,'Region C'),(4,'Region D');

-- 删除并创建 uav 表，增加 in_hibernate_pod 字段
DROP TABLE IF EXISTS `uav`;
CREATE TABLE `uav` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `rfid_tag` varchar(255) DEFAULT NULL,
  `status` enum('AUTHORIZED','UNAUTHORIZED') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `in_hibernate_pod` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入 uav 数据
INSERT INTO `uav` VALUES
(11,'2025-05-01 01:42:41.040567','ST32',' meituan','D9858A4F','AUTHORIZED','2025-05-14 10:27:19.647923',FALSE),
(12,'2025-05-01 03:44:09.634659','ST11',' meituan','136E7035','AUTHORIZED','2025-05-01 03:44:09.634659',FALSE),
(13,'2025-05-01 03:46:20.209470','ST99','taobao','7B363F0B','AUTHORIZED','2025-05-14 10:27:22.485683',FALSE);

-- 删除并创建 uav_regions 表
DROP TABLE IF EXISTS `uav_regions`;
CREATE TABLE `uav_regions` (
  `uav_id` int NOT NULL,
  `region_id` int NOT NULL,
  PRIMARY KEY (`uav_id`,`region_id`),
  KEY `region_id` (`region_id`),
  CONSTRAINT `uav_regions_ibfk_1` FOREIGN KEY (`uav_id`) REFERENCES `uav` (`id`),
  CONSTRAINT `uav_regions_ibfk_2` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入 uav_regions 数据
INSERT INTO `uav_regions` VALUES (12,1),(13,1),(13,2),(11,3),(12,3),(13,4);
