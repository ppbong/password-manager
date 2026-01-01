# 数据库设计文档（Database Design）

## 1. 数据库概述

本项目使用SQLite数据库，用于存储用户信息、根口令、平台分类、平台口令等数据。

## 2. 数据库表设计

### 2.1 用户表（users）

| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 用户ID |
| username | TEXT | UNIQUE NOT NULL | 用户名 |
| password | TEXT | NOT NULL | 加密后的登录口令 |
| name | TEXT | NOT NULL | 姓名 |
| email | TEXT | NOT NULL | 邮箱 |
| phone | TEXT | NOT NULL | 手机 |
| remark | TEXT | | 留存信息 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 注册时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 2.2 根口令表（root_passwords）

| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 根口令ID |
| user_id | INTEGER | NOT NULL | 用户ID，关联users表 |
| root_password | TEXT | NOT NULL | 加密后的根口令 |
| root_password_hint | TEXT | | 根口令提示 |
| aes_salt | TEXT | NOT NULL | AES密钥盐值 |
| rsa_public_key | TEXT | NOT NULL | RSA公钥 |
| rsa_private_key | TEXT | NOT NULL | AES密钥加密后的RSA私钥 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 2.3 平台分类表（platform_categories）

| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 分类ID |
| code | TEXT | UNIQUE NOT NULL | 分类代码 |
| name | TEXT | UNIQUE NOT NULL | 分类名称 |
| description | TEXT | | 分类描述 |
| sort_order | INTEGER | DEFAULT 0 | 排序顺序 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 2.4 平台口令表（platform_passwords）

| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 平台口令ID |
| user_id | INTEGER | NOT NULL | 用户ID，关联users表 |
| category_id | INTEGER | NOT NULL | 分类ID，关联platform_categories表 |
| platform_name | TEXT | NOT NULL | 平台名称 |
| platform_account | TEXT | NOT NULL | 平台账号 |
| platform_password | TEXT | NOT NULL | RSA公钥加密后的平台口令 |
| related_email | TEXT | | 关联邮箱 |
| related_phone | TEXT | | 关联手机 |
| secret_info | TEXT | | RSA公钥加密后的保密信息 |
| remark | TEXT | | 备注 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 2.5 平台口令历史表（platform_password_history）

| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 历史记录ID |
| password_id | INTEGER | NOT NULL | 平台口令ID，关联platform_passwords表 |
| user_id | INTEGER | NOT NULL | 用户ID，关联users表 |
| category_id | INTEGER | NOT NULL | 分类ID，关联platform_categories表 |
| platform_name | TEXT | NOT NULL | 平台名称 |
| platform_account | TEXT | NOT NULL | 平台账号 |
| platform_password | TEXT | NOT NULL | RSA公钥加密后的平台口令 |
| related_email | TEXT | | 关联邮箱 |
| related_phone | TEXT | | 关联手机 |
| secret_info | TEXT | | RSA公钥加密后的保密信息 |
| remark | TEXT | | 备注 |
| operation_type | TEXT | NOT NULL | 操作类型（新增、修改、删除） |
| operated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 操作时间 |

### 2.6 数据操作日志表（data_operation_logs）

| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 操作ID |
| operation_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 操作时间 |
| operation_type | TEXT | NOT NULL | 操作类型（备份、恢复） |
| file_name | TEXT | NOT NULL | 文件名 |
| operator | TEXT | NOT NULL | 操作人（admin） |

## 3. 数据库关系图

```
users (id) 1:N platform_passwords (user_id)
users (id) 1:1 root_passwords (user_id)
platform_categories (id) 1:N platform_passwords (category_id)
platform_passwords (id) 1:N platform_password_history (password_id)
```

## 4. 初始化数据

### 4.1 用户表初始化

| id | username | password | name | email | phone | remark | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | admin | admin123加密值 | 管理员 | admin@example.com | 13800138000 | 初始管理员 | CURRENT_TIMESTAMP | CURRENT_TIMESTAMP |

### 4.2 平台分类表初始化

| id | code | name | description | sort_order | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | bank | 银行 | 银行相关平台 | 1 | CURRENT_TIMESTAMP | CURRENT_TIMESTAMP |
| 2 | email | 邮箱 | 邮箱相关平台 | 2 | CURRENT_TIMESTAMP | CURRENT_TIMESTAMP |
| 3 | website | 网站 | 网站相关平台 | 3 | CURRENT_TIMESTAMP | CURRENT_TIMESTAMP |
| 4 | app | 应用 | 应用相关平台 | 4 | CURRENT_TIMESTAMP | CURRENT_TIMESTAMP |
| 5 | other | 其他 | 其他相关平台 | 5 | CURRENT_TIMESTAMP | CURRENT_TIMESTAMP |

## 5. 索引设计

### 5.1 用户表索引

- `idx_users_username`：用户名索引，用于快速查找用户

### 5.2 平台分类表索引

- `idx_platform_categories_code`：分类代码索引，用于快速查找分类
- `idx_platform_categories_name`：分类名称索引，用于快速查找分类
- `idx_platform_categories_sort_order`：排序顺序索引，用于快速排序分类

### 5.3 平台口令表索引

- `idx_platform_passwords_user_id`：用户ID索引，用于快速查找用户的平台口令
- `idx_platform_passwords_category_id`：分类ID索引，用于快速查找分类下的平台口令
- `idx_platform_passwords_platform_name`：平台名称索引，用于快速查找平台口令

### 5.4 平台口令历史表索引

- `idx_platform_password_history_password_id`：平台口令ID索引，用于快速查找平台口令的历史记录
- `idx_platform_password_history_user_id`：用户ID索引，用于快速查找用户的平台口令历史记录

## 6. 存储过程和触发器

### 6.1 数据缓存

- 用户登录时，检查根口令状态（root_password_status），统计用户的平台口令数量（platform_password_count），对状态和数量进行缓存。
- 当平台口令表发生插入或删除操作时，自动更新缓存的平台口令数量。
- 当根口令表发生插入或删除操作时，自动更新缓存的根口令状态。
- 前后端交互时，前端从缓存中获取用户状态和数量，避免频繁查询数据库。

## 7. 数据库安全

- 所有口令字段均加密存储
- 用户口令和根口令采用BCrypt加密存储
- RSA私钥采用AES加密存储
- 平台口令和平台保密信息采用RSA公钥加密存储
- 定期（每月）备份数据库
- 限制数据库文件访问权限
