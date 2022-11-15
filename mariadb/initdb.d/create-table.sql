CREATE TABLE IF NOT EXISTS `USERS` (
  `user_id` varchar(30) NOT NULL COMMENT '회원 ID',
  `social_id` varchar(100) DEFAULT NULL COMMENT '소셜 ID',
  `social_type` varchar(10) DEFAULT NULL COMMENT '카카오, 구글, 애플',
  `user_name` varchar(30) DEFAULT NULL COMMENT '닉네임',
  `profile_image_url` varchar(255) DEFAULT NULL COMMENT '프로필 사진 url',
  `profile_color` varchar(10) DEFAULT NULL COMMENT '프로필 색깔',
  `is_connect` tinyint(1) NOT NULL DEFAULT 0 COMMENT '현재 접속 여부',
  `last_connected_at` datetime(6) DEFAULT NULL COMMENT '마지막 접속 시간',
  `apple_refresh_token` varchar(100) DEFAULT NULL COMMENT 'apple refresh token',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성 시간',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정 시간',
  `deleted_at` datetime(6) DEFAULT NULL COMMENT '탈퇴 시간',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `SOCIAL_DATA_UNIQUE` (`social_id`, `social_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `DORMANTS_USERS` (
  `user_id` varchar(30) NOT NULL COMMENT '회원 ID',
  `social_id` varchar(100) NOT NULL COMMENT '소셜 ID',
  `social_type` varchar(10) NOT NULL COMMENT '카카오, 구글, 애플',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성 시간',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정 시간',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `SOCIAL_DATA_UNIQUE` (`social_id`, `social_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `USERS_REFRESH_TOKENS` (
  `user_id` varchar(30) NOT NULL COMMENT '회원 ID',
  `ip` varchar(30) NOT NULL COMMENT '회원 ip',
  `token` varchar(255) NOT NULL COMMENT 'refresh token',
  `expired_at` datetime(6) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성 시간',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정 시간',
  PRIMARY KEY (`user_id`, `ip`),
  UNIQUE KEY `TOKEN_UNIQUE` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `GROUPS` (
  `group_id` varchar(30) NOT NULL COMMENT '그룹 ID',
  `user_id` varchar(30) NOT NULL COMMENT '생성 회원 ID',
  `group_title` varchar(30) NOT NULL COMMENT '그룹명',
  `invite_code` varchar(6) NOT NULL COMMENT '그룹 초대 코드',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성 시간',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정 시간',
  PRIMARY KEY (`group_id`),
  UNIQUE KEY `GROUP_TITLE_UNIQUE` (`group_title`),
  UNIQUE KEY `INVITE_CODE_UNIQUE` (`invite_code`),
  INDEX `FK_USER_ID` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `GROUPS_USERS` (
  `group_id` varchar(30) NOT NULL COMMENT '그룹 ID',
  `user_id` varchar(30) NOT NULL COMMENT '회원 ID',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성 시간',
  PRIMARY KEY (`group_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `CATEGORIES` (
  `category_id` varchar(30) NOT NULL COMMENT '카테고리 ID',
  `user_id` varchar(30) NOT NULL COMMENT '생성 회원 ID',
  `group_id` varchar(30) NOT NULL COMMENT '그룹 ID',
  `category_title` varchar(30) NOT NULL COMMENT '카테고리명',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성 시간',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정 시간',
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `CATEGORY_TITLE_UNIQUE` (`category_title`, `group_id`),
  INDEX `FK_USER_ID` (`user_id`),
  INDEX `FK_GROUP_ID` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `TASKS` (
  `task_id` varchar(30) NOT NULL COMMENT '집안일 ID',
  `user_id` varchar(30) NOT NULL COMMENT '생성 회원 ID',
  `category_id` varchar(30) NOT NULL COMMENT '카테고리 ID',
  `task_title` varchar(30) NOT NULL COMMENT '집안일명',
  `repeat_cycle` varchar(10) DEFAULT NULL COMMENT '반복 주기',
  `memo` text DEFAULT NULL,
  `notice_available` tinyint(1) NOT NULL DEFAULT 1,
  `end_repeat_at` datetime(6) DEFAULT NULL,
  `excute_at` datetime(6) NOT NULL,
  `start_repeat_task_id` varchar(30) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성 시간',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정 시간',
  PRIMARY KEY (`task_id`),
  INDEX `FK_USER_ID` (`user_id`),
  INDEX `FK_CATEGORY_ID` (`category_id`),
  INDEX `START_REPEAT_TASK_ID` (`start_repeat_task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `TASKS_USERS` (
  `task_id` varchar(30) NOT NULL COMMENT '집안일 ID',
  `user_id` varchar(30) NOT NULL COMMENT '회원 ID',
  `is_end` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성 시간',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정 시간',
  PRIMARY KEY (`task_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;