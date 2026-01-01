/**
 * 基础响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {T} data - 数据
 */
export declare interface BaseResponse<T> {
  success: boolean
  message: string
  data?: T
}

/**
 * 用户注册请求参数
 * @property {string} username - 用户名
 * @property {string} password - 口令
 * @property {string} name - 姓名
 * @property {string} email - 邮箱
 * @property {string} phone - 手机
 * @property {string} remark - 留存信息
 */
export declare interface UserRegisterRequest {
  username: string
  password: string
  name: string
  email: string
  phone: string
  remark: string
}

/**
 * 用户注册响应数据
 * @property {number} user_id - 用户ID
 * @property {string} username - 用户名
 */
export declare interface UserRegisterResponseData {
  user_id: number
  username: string
}

/**
 * 用户注册响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {UserRegisterResponseData} data - 数据
 */
export declare interface UserRegisterResponse extends BaseResponse<UserRegisterResponseData> {}

/**
 * 用户登录请求参数
 * @property {string} username - 用户名
 * @property {string} password - 口令
 */
export declare interface UserLoginRequest {
  username: string
  password: string
}

/**
 * 用户登录响应数据
 * @property {number} user_id - 用户ID
 * @property {string} username - 用户名
 * @property {string} name - 姓名
 */
export declare interface UserLoginResponseData {
  user_id: number
  username: string
  name: string
}

/**
 * 用户登录响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {UserLoginResponseData} data - 数据
 */
export declare interface UserLoginResponse extends BaseResponse<UserLoginResponseData> {}

/**
 * 用户信息请求参数
 * @property {number} user_id - 用户ID
 */
export declare interface UserInfoRequest {
  user_id: number
}

/**
 * 用户信息响应数据
 * @property {number} user_id - 用户ID
 * @property {string} username - 用户名
 * @property {string} name - 姓名
 * @property {string} email - 邮箱
 * @property {string} phone - 手机
 * @property {string} remark - 留存信息
 * @property {number} root_password_status - 根口令状态（0：未设置，1：已设置）
 * @property {number} platform_password_count - 平台口令数量
 * @property {string} created_at - 注册时间
 */
export declare interface UserInfoResponseData {
  user_id: number
  username: string
  name: string
  email: string
  phone: string
  remark: string
  root_password_status: number // 根口令状态（0：未设置，1：已设置）
  platform_password_count: number // 平台口令数量
  created_at: string // 注册时间
}

/**
 * 用户信息响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {UserInfoResponseData} data - 数据
 */
export declare interface UserInfoResponse extends BaseResponse<UserInfoResponseData> {}

/**
 * 用户信息更新请求参数
 * @property {number} user_id - 用户ID
 * @property {string} name - 姓名
 * @property {string} email - 邮箱
 * @property {string} phone - 手机
 * @property {string} remark - 留存信息
 */
export declare interface UserInfoUpdateRequest {
  user_id: number
  name: string
  email: string
  phone: string
  remark: string
}

/**
 * 用户信息更新响应数据
 */
export declare interface UserInfoUpdateResponseData {}

/**
 * 用户信息更新响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {UserInfoUpdateResponseData} data - 数据
 */
export declare interface UserInfoUpdateResponse extends BaseResponse<UserInfoUpdateResponseData> {}

/**
 * 用户密码更新请求参数
 * @property {number} user_id - 用户ID
 * @property {string} old_password - 旧口令
 * @property {string} new_password - 新口令
 */
export declare interface UserPasswordUpdateRequest {
  user_id: number
  old_password: string
  new_password: string
}

/**
 * 用户密码更新响应数据
 */
export declare interface UserPasswordUpdateResponseData {}

/**
 * 用户密码更新响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {UserPasswordUpdateResponseData} data - 数据
 */
export declare interface UserPasswordUpdateResponse extends BaseResponse<UserPasswordUpdateResponseData> {}

/**
 * 根口令设置请求参数
 * @property {number} user_id - 用户ID
 * @property {string} root_password - 根口令
 * @property {string} root_password_hint - 根口令提示
 */
export declare interface RootPasswordSetRequest {
  user_id: number
  root_password: string
  root_password_hint: string
}

/**
 * 根口令设置响应数据
 */
export declare interface RootPasswordSetResponseData {}

/**
 * 根口令设置响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {RootPasswordSetResponseData} data - 数据
 */
export declare interface RootPasswordSetResponse extends BaseResponse<RootPasswordSetResponseData> {}

/**
 * 根口令更新请求参数
 * @property {number} user_id - 用户ID
 * @property {string} old_root_password - 旧根口令
 * @property {string} new_root_password - 新根口令
 * @property {string} new_root_password_hint - 新根口令提示
 */
export declare interface RootPasswordUpdateRequest {
  user_id: number
  old_root_password: string
  new_root_password: string
  new_root_password_hint: string
}

/**
 * 根口令更新响应数据
 */
export declare interface RootPasswordUpdateResponseData {}

/**
 * 根口令更新响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {RootPasswordUpdateResponseData} data - 数据
 */
export declare interface RootPasswordUpdateResponse extends BaseResponse<RootPasswordUpdateResponseData> {}

/**
 * 根口令状态查看请求参数
 * @property {number} user_id - 用户ID
 */
export declare interface RootPasswordStatusRequest {
  user_id: number
}

/**
 * 根口令状态查看响应数据
 * @property {number} user_id - 用户ID
 * @property {number} root_password_status - 根口令状态（0：未设置，1：已设置）
 */
export declare interface RootPasswordStatusResponseData {
  user_id: number
  root_password_status: number // 根口令状态（0：未设置，1：已设置）
}

/**
 * 根口令状态查看响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {RootPasswordStatusResponseData} data - 数据
 */
export declare interface RootPasswordStatusResponse extends BaseResponse<RootPasswordStatusResponseData> {}

/**
 * 平台分类创建请求参数
 * @property {number} user_id - 用户ID
 * @property {string} code - 分类编码
 * @property {string} name - 分类名称
 * @property {string} description - 分类描述
 */
export declare interface PlatformCategoryCreateRequest {
  user_id: number
  code: string
  name: string
  description: string
}

/**
 * 平台分类创建响应数据
 * @property {number} category_id - 分类ID
 * @property {string} code - 分类编码
 * @property {string} name - 分类名称
 */
export declare interface PlatformCategoryCreateResponseData {
  category_id: number
  code: string
  name: string
}

/**
 * 平台分类创建响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {PlatformCategoryCreateResponseData} data - 数据
 */
export declare interface PlatformCategoryCreateResponse extends BaseResponse<PlatformCategoryCreateResponseData> {}

/**
 * 平台分类列表查看请求参数
 * @property {string} sort_order - 排序顺序（asc：升序，desc：降序）
 */
export declare interface PlatformCategoryListRequest {
  sort_order: string
}

export declare interface PlatformCategoryListResponseData {
  category_id: number
  code: string
  name: string
  description: string
  sort_order: string
}

/**
 * 平台分类列表查看响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {PlatformCategoryListResponseData[]} data - 数据
 */
export declare interface PlatformCategoryListResponse extends BaseResponse<PlatformCategoryListResponseData[]> {}

/**
 * 平台分类更新请求参数
 * @property {number} category_id - 分类ID
 * @property {string} code - 分类编码
 * @property {string} name - 分类名称
 * @property {string} description - 分类描述
 */
export declare interface PlatformCategoryUpdateRequest {
  category_id: number
  code: string
  name: string
  description: string
}

/**
 * 平台分类更新响应数据
 */
export declare interface PlatformCategoryUpdateResponseData {}

/**
 * 平台分类更新响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {PlatformCategoryUpdateResponseData} data - 数据
 */
export declare interface PlatformCategoryUpdateResponse extends BaseResponse<PlatformCategoryUpdateResponseData> {}

/**
 * 平台分类删除请求参数
 * @property {number} category_id - 分类ID
 */
export declare interface PlatformCategoryDeleteRequest {
  category_id: number
}

/**
 * 平台分类删除响应数据
 */
export declare interface PlatformCategoryDeleteResponseData {}

/**
 * 平台分类删除响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {PlatformCategoryDeleteResponseData} data - 数据
 */
export declare interface PlatformCategoryDeleteResponse extends BaseResponse<PlatformCategoryDeleteResponseData> {}

/**
 * 平台分类排序请求参数数据
 * @property {number} category_id - 分类ID
 * @property {number} sort_order - 排序顺序
 */
export declare interface PlatformCategorySortRequestData {
  category_id: number
  sort_order: number
}

/**
 * 平台分类排序请求参数
 * @property {PlatformCategorySortRequestData[]} categories - 分类列表
 */
export declare interface PlatformCategorySortRequest {
  categories: PlatformCategorySortRequestData[]
}

/**
 * 平台分类排序响应数据
 */
export declare interface PlatformCategorySortResponseData {}

/**
 * 平台分类排序响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {PlatformCategorySortResponseData} data - 数据
 */
export declare interface PlatformCategorySortResponse extends BaseResponse<PlatformCategorySortResponseData> {}

/**
 * 平台口令创建请求参数
 * @property {number} user_id - 用户ID
 * @property {number} category_id - 分类ID
 * @property {string} platform_name - 平台名称
 * @property {string} platform_account - 平台账号
 * @property {string} platform_password - 平台口令
 * @property {string} related_email - 关联邮箱
 * @property {string} related_phone - 关联手机
 * @property {string} secret_info - 保密信息
 * @property {string} remark - 备注
 */
export declare interface PlatformPasswordCreateRequest {
  user_id: number
  category_id: number
  platform_name: string
  platform_account: string
  platform_password: string
  related_email: string
  related_phone: string
  secret_info: string
  remark: string
}

/**
 * 平台口令创建响应数据
 * @property {number} password_id - 口令ID
 * @property {string} platform_name - 平台名称
 */
export declare interface PlatformPasswordCreateResponseData {
    password_id: number
    platform_name: string
}

/**
 * 平台口令创建响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {PlatformPasswordCreateResponseData} data - 数据
 */
export declare interface PlatformPasswordCreateResponse extends BaseResponse<PlatformPasswordCreateResponseData> {}

/**
 * 平台口令列表查看请求参数
 * @property {number} user_id - 用户ID
 * @property {number | null} category_id - 分类ID
 * @property {string | null} platform_name - 平台名称
 */
export declare interface PlatformPasswordListRequest {
  user_id: number
  category_id: number | null
  platform_name: string | null
}

/**
 * 平台口令列表查看响应数据
 * @property {number} password_id - 口令ID
 * @property {number} category_id - 分类ID
 * @property {string} category_name - 分类名称
 * @property {string} platform_name - 平台名称
 * @property {string} platform_account - 平台账号
 * @property {string} related_email - 关联邮箱
 * @property {string} related_phone - 关联手机
 * @property {string} remark - 备注
 * @property {string} created_at - 创建时间
 * @property {string} updated_at - 更新时间
 */
export declare interface PlatformPasswordListResponseData {
    password_id: number
    category_id: number
    category_name: string
    platform_name: string
    platform_account: string
    related_email: string
    related_phone: string
    remark: string
    created_at: string
    updated_at: string
}

/**
 * 平台口令列表查看响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {PlatformPasswordListResponseData[]} data - 数据
 */
export declare interface PlatformPasswordListResponse extends BaseResponse<PlatformPasswordListResponseData[]> {}

/**
 * 平台口令更新请求参数
 * @property {number} password_id - 口令ID
 * @property {number} user_id - 用户ID
 * @property {number} category_id - 分类ID
 * @property {string} platform_name - 平台名称
 * @property {string} platform_account - 平台账号
 * @property {string} platform_password - 平台口令
 * @property {string} related_email - 关联邮箱
 * @property {string} related_phone - 关联手机
 * @property {string} secret_info - 保密信息
 * @property {string} remark - 备注
 * @property {string} root_password - 根口令（用于验证）
 */
export declare interface PlatformPasswordUpdateRequest {
  password_id: number
  user_id: number
  category_id: number
  platform_name: string
  platform_account: string
  platform_password: string
  related_email: string
  related_phone: string
  secret_info: string
  remark: string
  root_password: string
}

/**
 * 平台口令更新响应数据
 */
export declare interface PlatformPasswordUpdateResponseData {}

/**
 * 平台口令更新响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {PlatformPasswordUpdateResponseData} data - 数据
 */
export declare interface PlatformPasswordUpdateResponse extends BaseResponse<PlatformPasswordUpdateResponseData> {}

/**
 * 平台口令删除请求参数
 * @property {number} password_id - 口令ID
 * @property {number} user_id - 用户ID
 * @property {string} root_password - 根口令（用于验证）
 */
export declare interface PlatformPasswordDeleteRequest {
  password_id: number
  user_id: number
  root_password: string
}

/**
 * 平台口令删除响应数据
 */
export declare interface PlatformPasswordDeleteResponseData {}

/**
 * 平台口令删除响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {PlatformPasswordDeleteResponseData} data - 数据
 */
export declare interface PlatformPasswordDeleteResponse extends BaseResponse<PlatformPasswordDeleteResponseData> {}

/**
 * 平台口令详情查看请求参数
 * @property {number} password_id - 口令ID
 * @property {number} user_id - 用户ID
 * @property {string} root_password - 根口令（用于验证和解密）
 */
export declare interface PlatformPasswordDetailRequest {
  password_id: number
  user_id: number
  root_password: string
}

/**
 * 平台口令详情查看响应数据
 * @property {number} password_id - 口令ID
 * @property {number} category_id - 分类ID
 * @property {string} category_name - 分类名称
 * @property {string} platform_name - 平台名称
 * @property {string} platform_account - 平台账号
 * @property {string} platform_password - 平台口令
 * @property {string} related_email - 关联邮箱
 * @property {string} related_phone - 关联手机
 * @property {string} secret_info - 保密信息
 * @property {string} remark - 备注
 * @property {string} created_at - 创建时间
 * @property {string} updated_at - 更新时间
 */
export declare interface PlatformPasswordDetailResponseData {
  password_id: number
  category_id: number
  category_name: string
  platform_name: string
  platform_account: string
  platform_password: string
  related_email: string
  related_phone: string
  secret_info: string
  remark: string
  created_at: string
  updated_at: string
}

/**
 * 平台口令详情查看响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {PlatformPasswordDetailResponseData} data - 数据
 */
export declare interface PlatformPasswordDetailResponse extends BaseResponse<PlatformPasswordDetailResponseData> {}

/**
 * 平台口令历史查看请求参数
 * @property {number} password_id - 口令ID
 * @property {number} user_id - 用户ID
 */
export declare interface PlatformPasswordHistoryRequest {
  password_id: number
  user_id: number
}

/**
 * 平台口令历史查看响应数据
 * @property {number} history_id - 历史记录ID
 * @property {number} password_id - 口令ID
 * @property {number} category_id - 分类ID
 * @property {string} category_name - 分类名称
 * @property {string} platform_name - 平台名称
 * @property {string} platform_account - 平台账号
 * @property {string} related_email - 关联邮箱
 * @property {string} related_phone - 关联手机
 * @property {string} remark - 备注
 * @property {string} operation_type - 操作类型
 * @property {string} operated_at - 操作时间
 */
export declare interface PlatformPasswordHistoryResponseData {
  history_id: number
  password_id: number
  category_id: number
  category_name: string
  platform_name: string
  platform_account: string
  related_email: string
  related_phone: string
  remark: string
  operation_type: string
  operated_at: string
}

/**
 * 平台口令历史查看响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {PlatformPasswordHistoryResponseData[]} data - 数据
 */
export declare interface PlatformPasswordHistoryResponse extends BaseResponse<PlatformPasswordHistoryResponseData[]> {}

/**
 * 平台口令历史详情查看请求参数
 * @property {number} history_id - 历史记录ID
 * @property {number} user_id - 用户ID
 * @property {string} root_password - 根口令（用于验证和解密）
 */
export declare interface PlatformPasswordHistoryDetailRequest {
  history_id: number
  user_id: number
  root_password: string
}

/**
 * 平台口令历史详情查看响应数据
 * @property {number} history_id - 历史记录ID
 * @property {number} password_id - 口令ID
 * @property {number} category_id - 分类ID
 * @property {string} category_name - 分类名称
 * @property {string} platform_name - 平台名称
 * @property {string} platform_account - 平台账号
 * @property {string} platform_password - 平台口令
 * @property {string} related_email - 关联邮箱
 * @property {string} related_phone - 关联手机
 * @property {string} secret_info - 保密信息
 * @property {string} remark - 备注
 * @property {string} operation_type - 操作类型
 * @property {string} operated_at - 操作时间
 */
export declare interface PlatformPasswordHistoryDetailResponseData {
  history_id: number
  password_id: number
  category_id: number
  category_name: string
  platform_name: string
  platform_account: string
  platform_password: string
  related_email: string
  related_phone: string
  secret_info: string
  remark: string
  operation_type: string
  operated_at: string
}

/**
 * 平台口令历史详情查看响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {PlatformPasswordHistoryDetailResponseData} data - 数据
 */
export declare interface PlatformPasswordHistoryDetailResponse extends BaseResponse<PlatformPasswordHistoryDetailResponseData> {}

/**
 * 平台口令生成请求参数
 * @property {boolean} include_number - 是否包含数字
 * @property {boolean} include_lowercase - 是否包含小写字母
 * @property {boolean} include_uppercase - 是否包含大写字母
 * @property {boolean} include_special - 是否包含特殊字符
 * @property {number} length - 口令长度
 */
export declare interface PlatformPasswordGenerateRequest {
  include_number: boolean
  include_lowercase: boolean
  include_uppercase: boolean
  include_special: boolean
  length: number
}

/**
 * 平台口令生成响应数据
 * @property {string} password - 口令
 * @property {string} strength - 口令强度（弱、中、强）
 */
export declare interface PlatformPasswordGenerateResponseData {
  password: string
  strength: string
}

/**
 * 平台口令生成响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {PlatformPasswordGenerateResponseData} data - 数据
 */
export declare interface PlatformPasswordGenerateResponse extends BaseResponse<PlatformPasswordGenerateResponseData> {}

/**
 * 数据操作日志查询请求参数
 * @property {string} username - 用户名
 */
export declare interface DataOperationLogsRequest {
  username: string
}

/**
 * 数据操作日志查询响应数据
 * @property {number} operation_id - 操作ID
 * @property {string} operation_time - 操作时间
 * @property {string} operation_type - 操作类型
 * @property {string} file_name - 文件名
 * @property {string} operator - 操作人
 */
export declare interface DataOperationLogsResponseData {
  operation_id: number
  operation_time: string
  operation_type: string
  file_name: string
  operator: string
}

/**
 * 数据操作日志查询响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {DataOperationLogsResponseData[]} data - 数据
 */
export declare interface DataOperationLogsResponse extends BaseResponse<DataOperationLogsResponseData[]> {}

/**
 * 数据备份请求参数
 * @property {string} username - 用户名
 */
export declare interface DataBackupRequest {
  username: string
}

/**
 * 数据备份响应数据
 * @property {string} file_name - 文件名
 */
export declare interface DataBackupResponseData {
  file_name: string
}

/**
 * 数据备份响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {string} data - 数据
 */
export declare interface DataBackupResponse extends BaseResponse<DataBackupResponseData> {}

/**
 * 数据恢复请求参数
 * @property {string} username - 用户名
 * @property {string} file_name - 文件名
 */
export declare interface DataRestoreRequest {
  username: string
  file_name: string
}

/**
 * 数据恢复响应数据
 */
export declare interface DataRestoreResponseData {}

/**
 * 数据恢复响应体
 * @property {boolean} success - 是否成功
 * @property {string} message - 状态描述
 * @property {DataRestoreResponseData} data - 数据
 */
export declare interface DataRestoreResponse extends BaseResponse<DataRestoreResponseData> {}

export declare interface ElectronApi {
  // 示例API
  ping: () => void,
  onPong: (callback: (message: string) => void) => void,
  
  // 用户管理API
  userRegister: (data: UserRegisterRequest) => Promise<UserRegisterResponse>,
  userLogin: (data: UserLoginRequest) => Promise<UserLoginResponse>,
  userInfoGet: (data: UserInfoRequest) => Promise<UserInfoResponse>,
  userInfoUpdate: (data: UserInfoUpdateRequest) => Promise<UserInfoUpdateResponse>,
  userPasswordUpdate: (data: UserPasswordUpdateRequest) => Promise<UserPasswordUpdateResponse>,
  
  // 根口令管理API
  rootPasswordSet: (data: RootPasswordSetRequest) => Promise<RootPasswordSetResponse>,
  rootPasswordUpdate: (data: RootPasswordUpdateRequest) => Promise<RootPasswordUpdateResponse>,
  rootPasswordStatus: (data: RootPasswordStatusRequest) => Promise<RootPasswordStatusResponse>,
  
  // 平台分类管理API
  platformCategoryCreate: (data: PlatformCategoryCreateRequest) => Promise<PlatformCategoryCreateResponse>,
  platformCategoryList: (data: PlatformCategoryListRequest) => Promise<PlatformCategoryListResponse>,
  platformCategoryUpdate: (data: PlatformCategoryUpdateRequest) => Promise<PlatformCategoryUpdateResponse>,
  platformCategoryDelete: (data: PlatformCategoryDeleteRequest) => Promise<PlatformCategoryDeleteResponse>,
  platformCategorySort: (data: PlatformCategorySortRequest) => Promise<PlatformCategorySortResponse>,
  
  // 平台口令管理API
  platformPasswordCreate: (data: PlatformPasswordCreateRequest) => Promise<PlatformPasswordCreateResponse>,
  platformPasswordList: (data: PlatformPasswordListRequest) => Promise<PlatformPasswordListResponse>,
  platformPasswordUpdate: (data: PlatformPasswordUpdateRequest) => Promise<PlatformPasswordUpdateResponse>,
  platformPasswordDelete: (data: PlatformPasswordDeleteRequest) => Promise<PlatformPasswordDeleteResponse>,
  platformPasswordDetail: (data: PlatformPasswordDetailRequest) => Promise<PlatformPasswordDetailResponse>,
  platformPasswordHistory: (data: PlatformPasswordHistoryRequest) => Promise<PlatformPasswordHistoryResponse>,
  platformPasswordHistoryDetail: (data: PlatformPasswordHistoryDetailRequest) => Promise<PlatformPasswordHistoryDetailResponse>,
  platformPasswordGenerate: (data: PlatformPasswordGenerateRequest) => Promise<PlatformPasswordGenerateResponse>,
  
  // 数据管理API
  dataOperationLogs: (data: DataOperationLogsRequest) => Promise<DataOperationLogsResponse>,
  dataBackup: (data: DataBackupRequest) => Promise<DataBackupResponse>,
  dataRestore: (data: DataRestoreRequest) => Promise<DataRestoreResponse>,
}

// 扩展全局 Window 接口，添加 electronAPI 属性
declare global {
  interface Window {
    electronAPI: ElectronApi
  }
}
