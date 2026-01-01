# 进程间通信接口设计文档（IPC）

## 1. 概述

本项目使用Electron的IPC（Inter-Process Communication）机制实现主进程和渲染进程之间的通信。主进程负责处理数据库操作、加密解密等核心逻辑，渲染进程负责UI展示和用户交互。

## 2. IPC接口设计

### 2.1 用户管理IPC接口

#### 2.1.1 用户注册

- **渲染进程→主进程**：`user:register`
- **参数**：
  ```json
  {
    "username": "string", // 用户名
    "password": "string", // 口令
    "name": "string", // 姓名
    "email": "string", // 邮箱
    "phone": "string", // 手机
    "remark": "string" // 留存信息
  }
  ```
- **主进程→渲染进程**：`user:register:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": {
      "user_id": number, // 用户ID
      "username": "string" // 用户名
    } | null
  }
  ```

#### 2.1.2 用户登录

- **渲染进程→主进程**：`user:login`
- **参数**：
  ```json
  {
    "username": "string", // 用户名
    "password": "string" // 口令
  }
  ```
- **主进程→渲染进程**：`user:login:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": {
      "user_id": number, // 用户ID
      "username": "string", // 用户名
      "name": "string" // 姓名
    } | null
  }
  ```

#### 2.1.3 用户信息查看

- **渲染进程→主进程**：`user:info:get`
- **参数**：
  ```json
  {
    "user_id": number // 用户ID
  }
  ```
- **主进程→渲染进程**：`user:info:get:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": {
      "user_id": number, // 用户ID
      "username": "string", // 用户名
      "name": "string", // 姓名
      "email": "string", // 邮箱
      "phone": "string", // 手机
      "remark": "string", // 留存信息
      "root_password_status": number, // 根口令状态（0：未设置，1：已设置）
      "platform_password_count": number, // 平台口令数量
      "created_at": "string" // 注册时间
    } | null
  }
  ```

#### 2.1.4 用户信息修改

- **渲染进程→主进程**：`user:info:update`
- **参数**：
  ```json
  {
    "user_id": number, // 用户ID
    "name": "string", // 姓名
    "email": "string", // 邮箱
    "phone": "string", // 手机
    "remark": "string" // 留存信息
  }
  ```
- **主进程→渲染进程**：`user:info:update:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string" // 消息
  }
  ```

#### 2.1.5 用户口令修改

- **渲染进程→主进程**：`user:password:update`
- **参数**：
  ```json
  {
    "user_id": number, // 用户ID
    "old_password": "string", // 旧口令
    "new_password": "string" // 新口令
  }
  ```
- **主进程→渲染进程**：`user:password:update:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string" // 消息
  }
  ```

### 2.2 根口令管理IPC接口

#### 2.2.1 根口令设置

- **渲染进程→主进程**：`root:password:set`
- **参数**：
  ```json
  {
    "user_id": number, // 用户ID
    "root_password": "string", // 根口令
    "root_password_hint": "string" // 根口令提示
  }
  ```
- **主进程→渲染进程**：`root:password:set:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string" // 消息
  }
  ```

#### 2.2.2 根口令修改

- **渲染进程→主进程**：`root:password:update`
- **参数**：
  ```json
  {
    "user_id": number, // 用户ID
    "old_root_password": "string", // 旧根口令
    "new_root_password": "string" // 新根口令
  }
  ```
- **主进程→渲染进程**：`root:password:update:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string" // 消息
  }
  ```

#### 2.2.3 根口令状态查看

- **渲染进程→主进程**：`root:password:status:get`
- **参数**：
  ```json
  {
    "user_id": number // 用户ID
  }
  ```
- **主进程→渲染进程**：`root:password:status:get:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": {
      "user_id": number, // 用户ID
      "root_password_status": number // 根口令状态（0：未设置，1：已设置）
    } | null
  }
  ```

### 2.3 平台分类管理IPC接口

#### 2.3.1 平台分类创建

- **渲染进程→主进程**：`platform:category:create`
- **参数**：
  ```json
  {
    "code": "string", // 分类代码
    "name": "string", // 分类名称
    "description": "string" // 分类描述
  }
  ```
- **主进程→渲染进程**：`platform:category:create:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": {
      "category_id": number, // 分类ID
      "code": "string", // 分类代码
      "name": "string" // 分类名称
    } | null
  }
  ```

#### 2.3.2 平台分类列表

- **渲染进程→主进程**：`platform:category:list`
- **参数**：
  ```json
  {
    "sort_order": "asc" | "desc" // 排序顺序
  }
  ```
- **主进程→渲染进程**：`platform:category:list:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": [
      {
        "category_id": number, // 分类ID
        "code": "string", // 分类代码
        "name": "string", // 分类名称
        "description": "string", // 分类描述
        "sort_order": number // 排序顺序
      }
    ]
  }
  ```

#### 2.3.3 平台分类修改

- **渲染进程→主进程**：`platform:category:update`
- **参数**：
  ```json
  {
    "category_id": number, // 分类ID
    "code": "string", // 分类代码
    "name": "string", // 分类名称
    "description": "string" // 分类描述
  }
  ```
- **主进程→渲染进程**：`platform:category:update:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string" // 消息
  }
  ```

#### 2.3.4 平台分类删除

- **渲染进程→主进程**：`platform:category:delete`
- **参数**：
  ```json
  {
    "category_id": number // 分类ID
  }
  ```
- **主进程→渲染进程**：`platform:category:delete:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string" // 消息
  }
  ```

#### 2.3.5 平台分类排序

- **渲染进程→主进程**：`platform:category:sort`
- **参数**：
  ```json
  {
    "categories": [
      {
        "category_id": number, // 分类ID
        "sort_order": number // 排序顺序
      }
    ]
  }
  ```
- **主进程→渲染进程**：`platform:category:sort:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string" // 消息
  }
  ```

### 2.4 平台口令管理IPC接口

#### 2.4.1 平台口令创建

- **渲染进程→主进程**：`platform:password:create`
- **参数**：
  ```json
  {
    "user_id": number, // 用户ID
    "category_id": number, // 分类ID
    "platform_name": "string", // 平台名称
    "platform_account": "string", // 平台账号
    "platform_password": "string", // 平台口令
    "related_email": "string", // 关联邮箱
    "related_phone": "string", // 关联手机
    "secret_info": "string", // 保密信息
    "remark": "string" // 备注
  }
  ```
- **主进程→渲染进程**：`platform:password:create:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": {
      "password_id": number, // 平台口令ID
      "platform_name": "string" // 平台名称
    } | null
  }
  ```

#### 2.4.2 平台口令列表

- **渲染进程→主进程**：`platform:password:list`
- **参数**：
  ```json
  {
    "user_id": number, // 用户ID
    "category_id": number | null, // 分类ID（可选）
    "platform_name": "string" | null // 平台名称（可选，用于搜索）
  }
  ```
- **主进程→渲染进程**：`platform:password:list:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": [
      {
        "password_id": number, // 平台口令ID
        "category_id": number, // 分类ID
        "category_name": "string", // 分类名称
        "platform_name": "string", // 平台名称
        "platform_account": "string", // 平台账号
        "related_email": "string", // 关联邮箱
        "related_phone": "string", // 关联手机
        "remark": "string", // 备注
        "created_at": "string", // 创建时间
        "updated_at": "string" // 更新时间
      }
    ]
  }
  ```

#### 2.4.3 平台口令修改

- **渲染进程→主进程**：`platform:password:update`
- **参数**：
  ```json
  {
    "password_id": number, // 平台口令ID
    "user_id": number, // 用户ID
    "category_id": number, // 分类ID
    "platform_name": "string", // 平台名称
    "platform_account": "string", // 平台账号
    "platform_password": "string", // 平台口令
    "related_email": "string", // 关联邮箱
    "related_phone": "string", // 关联手机
    "secret_info": "string", // 保密信息
    "remark": "string", // 备注
    "root_password": "string" // 根口令（用于验证）
  }
  ```
- **主进程→渲染进程**：`platform:password:update:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string" // 消息
  }
  ```

#### 2.4.4 平台口令删除

- **渲染进程→主进程**：`platform:password:delete`
- **参数**：
  ```json
  {
    "password_id": number, // 平台口令ID
    "user_id": number, // 用户ID
    "root_password": "string" // 根口令（用于验证）
  }
  ```
- **主进程→渲染进程**：`platform:password:delete:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string" // 消息
  }
  ```

#### 2.4.5 平台口令详情

- **渲染进程→主进程**：`platform:password:detail`
- **参数**：
  ```json
  {
    "password_id": number, // 平台口令ID
    "user_id": number, // 用户ID
    "root_password": "string" // 根口令（用于验证和解密）
  }
  ```
- **主进程→渲染进程**：`platform:password:detail:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": {
      "password_id": number, // 平台口令ID
      "category_id": number, // 分类ID
      "category_name": "string", // 分类名称
      "platform_name": "string", // 平台名称
      "platform_account": "string", // 平台账号
      "platform_password": "string", // 解密后的平台口令
      "related_email": "string", // 关联邮箱
      "related_phone": "string", // 关联手机
      "secret_info": "string", // 解密后的保密信息
      "remark": "string", // 备注
      "created_at": "string", // 创建时间
      "updated_at": "string" // 更新时间
    } | null
  }
  ```

#### 2.4.6 平台口令历史

- **渲染进程→主进程**：`platform:password:history`
- **参数**：
  ```json
  {
    "password_id": number, // 平台口令ID
    "user_id": number // 用户ID
  }
  ```
- **主进程→渲染进程**：`platform:password:history:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": [
      {
        "history_id": number, // 历史记录ID
        "password_id": number, // 平台口令ID
        "category_id": number, // 分类ID
        "category_name": "string", // 分类名称
        "platform_name": "string", // 平台名称
        "platform_account": "string", // 平台账号
        "related_email": "string", // 关联邮箱
        "related_phone": "string", // 关联手机
        "remark": "string", // 备注
        "operation_type": "string", // 操作类型（新增、修改、删除）
        "operated_at": "string" // 操作时间
      }
    ]
  }
  ```

#### 2.4.7 平台口令历史详情

- **渲染进程→主进程**：`platform:password:history:detail`
- **参数**：
  ```json
  {
    "history_id": number, // 历史记录ID
    "user_id": number, // 用户ID
    "root_password": "string" // 根口令（用于验证和解密）
  }
  ```
- **主进程→渲染进程**：`platform:password:history:detail:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": {
      "history_id": number, // 历史记录ID
      "password_id": number, // 平台口令ID
      "category_id": number, // 分类ID
      "category_name": "string", // 分类名称
      "platform_name": "string", // 平台名称
      "platform_account": "string", // 平台账号
      "platform_password": "string", // 解密后的平台口令
      "related_email": "string", // 关联邮箱
      "related_phone": "string", // 关联手机
      "secret_info": "string", // 解密后的保密信息
      "remark": "string", // 备注
      "operation_type": "string", // 操作类型（新增、修改、删除）
      "operated_at": "string" // 操作时间
    } | null
  }
  ```

#### 2.4.8 平台口令自动生成

- **渲染进程→主进程**：`platform:password:generate`
- **参数**：
  ```json
  {
    "include_number": boolean, // 是否含数字
    "include_lowercase": boolean, // 是否含小写字母
    "include_uppercase": boolean, // 是否含大写字母
    "include_special": boolean, // 是否含特殊字符
    "length": number // 口令长度
  }
  ```
- **主进程→渲染进程**：`platform:password:generate:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": {
      "password": "string", // 生成的口令
      "strength": "string" // 口令强度（弱、中、强）
    } | null
  }
  ```

### 2.5 数据管理IPC接口

#### 2.5.1 数据操作日志

- **渲染进程→主进程**：`data:operation:logs`
- **参数**：
  ```json
  {
    "username": "string" // 操作人用户名
  }
  ```
- **主进程→渲染进程**：`data:operation:logs:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": [
      {
        "operation_id": number, // 操作ID
        "operation_time": "string", // 操作时间
        "operation_type": "string", // 操作类型（备份、恢复）
        "file_name": "string", // 文件名
        "operator": "string" // 操作人
      }
    ]
  }
  ```

#### 2.5.2 数据备份

- **渲染进程→主进程**：`data:backup`
- **参数**：
  ```json
  {
    "username": "string" // 操作人用户名
  }
  ```
- **主进程→渲染进程**：`data:backup:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string", // 消息
    "data": {
      "file_name": "string" // 备份文件名
    } | null
  }
  ```

#### 2.5.3 数据恢复

- **渲染进程→主进程**：`data:restore`
- **参数**：
  ```json
  {
    "username": "string", // 操作人用户名
    "file_name": "string" // 恢复文件名
  }
  ```
- **主进程→渲染进程**：`data:restore:reply`
- **返回结果**：
  ```json
  {
    "success": boolean, // 是否成功
    "message": "string" // 消息
  }
  ```

## 3. IPC通信流程图

```
渲染进程 → IPC通道 → 主进程 → 数据库/加密解密 → 主进程 → IPC通道 → 渲染进程
```

## 4. 安全考虑

- 所有敏感数据在IPC传输前均已加密
- 主进程对所有IPC请求进行权限验证
- 渲染进程与主进程之间的通信采用双向认证
- 定期清理IPC通信缓存
