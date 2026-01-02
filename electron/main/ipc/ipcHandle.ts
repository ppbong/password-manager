import { ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { db, dbPath } from '../service/dbService'
import { bcrypt, crypto } from '../service/algService'

// 用户注册
ipcMain.handle('user:register', async (_, data) => {
  try {
    // 检查用户名是否已存在
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(data.username)
    if (existingUser) {
      return { success: false, message: '用户名已存在' }
    }

    // 加密密码
    const hashedPassword = bcrypt.hashSync(data.password, 10)

    // 插入用户
    const insertStmt = db.prepare(`
      INSERT INTO users (username, password, name, email, phone, remark)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const result = insertStmt.run(
      data.username,
      hashedPassword,
      data.name,
      data.email,
      data.phone,
      data.remark || ''
    )

    return {
      success: true,
      message: '注册成功',
      data: {
        user_id: result.lastInsertRowid,
        username: data.username
      }
    }
  } catch (error) {
    console.error('注册失败:', error)
    return { success: false, message: '注册失败，请稍后重试' }
  }
})

// 用户登录
ipcMain.handle('user:login', async (_, data) => {
  try {
    // 查找用户
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(data.username) as any
    if (!user) {
      return { success: false, message: '用户名或密码错误' }
    }

    // 验证密码
    const isPasswordValid = bcrypt.compareSync(data.password, user.password)
    if (!isPasswordValid) {
      return { success: false, message: '用户名或密码错误' }
    }

    return {
      success: true,
      message: '登录成功',
      data: {
        user_id: user.id,
        username: user.username,
        name: user.name
      }
    }
  } catch (error) {
    console.error('登录失败:', error)
    return { success: false, message: '登录失败，请稍后重试' }
  }
})

// 用户信息查看
ipcMain.handle('user:info:get', async (_, data) => {
  try {
    // 查找用户
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(data.user_id) as any
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    // 检查根口令状态
    const rootPassword = db.prepare('SELECT * FROM root_passwords WHERE user_id = ?').get(data.user_id) as any
    const rootPasswordStatus = rootPassword ? 1 : 0

    // 统计平台口令数量
    const passwordCount = (db.prepare('SELECT COUNT(*) as count FROM platform_passwords WHERE user_id = ?').get(data.user_id) as any).count as number

    return {
      success: true,
      message: '获取用户信息成功',
      data: {
        user_id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        remark: user.remark,
        root_password_status: rootPasswordStatus,
        platform_password_count: passwordCount,
        created_at: user.created_at
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return { success: false, message: '获取用户信息失败，请稍后重试' }
  }
})

// 用户信息修改
ipcMain.handle('user:info:update', async (_, data) => {
  try {
    // 更新用户信息
    const updateStmt = db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, phone = ?, remark = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    const result = updateStmt.run(
      data.name,
      data.email,
      data.phone,
      data.remark || '',
      data.user_id
    )

    if (result.changes === 0) {
      return { success: false, message: '用户不存在或信息未变化' }
    }

    return { success: true, message: '用户信息更新成功' }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return { success: false, message: '更新用户信息失败，请稍后重试' }
  }
})

// 用户口令修改
ipcMain.handle('user:password:update', async (_, data) => {
  try {
    // 查找用户
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(data.user_id) as any
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    // 验证旧密码
    const isPasswordValid = bcrypt.compareSync(data.old_password, user.password)
    if (!isPasswordValid) {
      return { success: false, message: '旧密码错误' }
    }

    // 加密新密码
    const hashedPassword = bcrypt.hashSync(data.new_password, 10)

    // 更新密码
    const updateStmt = db.prepare(`
      UPDATE users 
      SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    updateStmt.run(hashedPassword, data.user_id)

    return { success: true, message: '密码更新成功' }
  } catch (error) {
    console.error('更新密码失败:', error)
    return { success: false, message: '更新密码失败，请稍后重试' }
  }
})

// 根口令设置
ipcMain.handle('root:password:set', async (_, data) => {
  try {
    // 检查根口令是否已设置
    const existingRootPassword = db.prepare('SELECT * FROM root_passwords WHERE user_id = ?').get(data.user_id) as any
    if (existingRootPassword) {
      return { success: false, message: '根口令已设置' }
    }

    // 加密根口令
    const hashedRootPassword = bcrypt.hashSync(data.root_password, 10)

    // 生成AES盐值
    const aesSalt = crypto.randomBytes(16).toString('hex')

    // 生成RSA密钥对
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    })

    // 生成AES密钥
    const aesKey = crypto.scryptSync(data.root_password, aesSalt, 32)

    // 加密RSA私钥
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv)
    let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex')
    encryptedPrivateKey += cipher.final('hex')

    // 插入根口令记录
    const insertStmt = db.prepare(`
      INSERT INTO root_passwords (user_id, root_password, root_password_hint, aes_salt, rsa_public_key, rsa_private_key)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    insertStmt.run(
      data.user_id,
      hashedRootPassword,
      data.root_password_hint || '',
      aesSalt,
      publicKey,
      `${iv.toString('hex')}:${encryptedPrivateKey}`
    )

    return { success: true, message: '根口令设置成功' }
  } catch (error) {
    console.error('设置根口令失败:', error)
    return { success: false, message: '设置根口令失败，请稍后重试' }
  }
})

// 根口令修改
ipcMain.handle('root:password:update', async (_, data) => {
  try {
    // 查找根口令记录
    const rootPasswordRecord = db.prepare('SELECT * FROM root_passwords WHERE user_id = ?').get(data.user_id) as any
    if (!rootPasswordRecord) {
      return { success: false, message: '根口令未设置' }
    }

    // 验证旧根口令
    const isPasswordValid = bcrypt.compareSync(data.old_root_password, rootPasswordRecord.root_password)
    if (!isPasswordValid) {
      return { success: false, message: '旧根口令错误' }
    }

    // 解密RSA私钥
    const oldAesKey = crypto.scryptSync(data.old_root_password, rootPasswordRecord.aes_salt, 32)
    const [ivHex, encryptedPrivateKeyHex] = rootPasswordRecord.rsa_private_key.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const encryptedPrivateKey = Buffer.from(encryptedPrivateKeyHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', oldAesKey, iv)
    let privateKeyBuffer = decipher.update(encryptedPrivateKey)
    privateKeyBuffer = Buffer.concat([privateKeyBuffer, decipher.final()])
    const privateKey = privateKeyBuffer.toString('utf8')

    // 加密新根口令
    const hashedRootPassword = bcrypt.hashSync(data.new_root_password, 10)

    // 生成新的AES密钥
    const newAesKey = crypto.scryptSync(data.new_root_password, rootPasswordRecord.aes_salt, 32)

    // 用新AES密钥加密RSA私钥
    const newIv = crypto.randomBytes(16)
    const newCipher = crypto.createCipheriv('aes-256-cbc', newAesKey, newIv)
    let newEncryptedPrivateKeyBuffer = newCipher.update(privateKey, 'utf8')
    newEncryptedPrivateKeyBuffer = Buffer.concat([newEncryptedPrivateKeyBuffer, newCipher.final()])
    const newEncryptedPrivateKey = newEncryptedPrivateKeyBuffer.toString('hex')

    // 更新根口令记录
    const updateStmt = db.prepare(`
      UPDATE root_passwords 
      SET root_password = ?, root_password_hint = ?, rsa_private_key = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `)
    updateStmt.run(
      hashedRootPassword,
      data.new_root_password_hint || '',
      `${newIv.toString('hex')}:${newEncryptedPrivateKey}`,
      data.user_id
    )

    return { success: true, message: '根口令修改成功' }
  } catch (error) {
    console.error('修改根口令失败:', error)
    return { success: false, message: '修改根口令失败，请稍后重试' }
  }
})

// 根口令状态查看
ipcMain.handle('root:password:status', async (_, data) => {
  try {
    // 查找根口令记录
    const rootPasswordRecord = db.prepare('SELECT * FROM root_passwords WHERE user_id = ?').get(data.user_id) as any
    if (!rootPasswordRecord) {
      return { success: false, message: '根口令未设置' }
    }

    return { success: true, message: '根口令已设置', data: { user_id: data.user_id, root_password_status: 1 } }
  } catch (error) {
    console.error('查询根口令状态失败:', error)
    return { success: false, message: '查询根口令状态失败，请稍后重试' }
  }
})

// 平台分类创建
ipcMain.handle('platform:category:create', async (_, data) => {
  try {
    // 检查代码和名称是否已存在
    const existingCode = db.prepare('SELECT * FROM platform_categories WHERE code = ?').get(data.code)
    if (existingCode) {
      return { success: false, message: '分类代码已存在' }
    }

    const existingName = db.prepare('SELECT * FROM platform_categories WHERE name = ?').get(data.name)
    if (existingName) {
      return { success: false, message: '分类名称已存在' }
    }

    const maxSortOrder = (db.prepare('SELECT MAX(sort_order) as max_order FROM platform_categories').get() as any).max_order as number
    const sortOrder = maxSortOrder ? maxSortOrder + 1 : 1

    // 插入分类
    const insertStmt = db.prepare(`
      INSERT INTO platform_categories (code, name, description, sort_order)
      VALUES (?, ?, ?, ?)
    `)
    const result = insertStmt.run(
      data.code,
      data.name,
      data.description || '',
      sortOrder
    )

    return {
      success: true,
      message: '分类创建成功',
      data: {
        category_id: result.lastInsertRowid,
        code: data.code,
        name: data.name
      }
    }
  } catch (error) {
    console.error('创建分类失败:', error)
    return { success: false, message: '创建分类失败，请稍后重试' }
  }
})

// 平台分类列表
ipcMain.handle('platform:category:list', async (_, data) => {
  try {
    // 获取分类列表
    const sortOrder = data.sort_order || 'asc'
    const categories = db.prepare(
      `SELECT id as category_id, code, name, description, sort_order FROM platform_categories ORDER BY sort_order ${sortOrder}`
    ).all()

    return {
      success: true,
      message: '获取分类列表成功',
      data: categories
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    return { success: false, message: '获取分类列表失败，请稍后重试' }
  }
})

// 平台分类修改
ipcMain.handle('platform:category:update', async (_, data) => {
  try {
    // 检查代码和名称是否已被其他分类使用
    const existingCode = db.prepare('SELECT * FROM platform_categories WHERE code = ? AND id != ?').get(data.code, data.category_id)
    if (existingCode) {
      return { success: false, message: '分类代码已存在' }
    }

    const existingName = db.prepare('SELECT * FROM platform_categories WHERE name = ? AND id != ?').get(data.name, data.category_id)
    if (existingName) {
      return { success: false, message: '分类名称已存在' }
    }

    // 更新分类
    const updateStmt = db.prepare(`
      UPDATE platform_categories 
      SET code = ?, name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    const result = updateStmt.run(
      data.code,
      data.name,
      data.description || '',
      data.category_id
    )

    if (result.changes === 0) {
      return { success: false, message: '分类不存在或信息未变化' }
    }

    return { success: true, message: '分类修改成功' }
  } catch (error) {
    console.error('修改分类失败:', error)
    return { success: false, message: '修改分类失败，请稍后重试' }
  }
})

// 平台分类删除
ipcMain.handle('platform:category:delete', async (_, data) => {
  try {
    const passwordCount = (db.prepare('SELECT COUNT(*) as count FROM platform_passwords WHERE category_id = ?').get(data.category_id) as any).count as number
    if (passwordCount > 0) {
      return { success: false, message: '该分类下存在平台口令，无法删除' }
    }

    // 删除分类
    const deleteStmt = db.prepare('DELETE FROM platform_categories WHERE id = ?')
    const result = deleteStmt.run(data.category_id)

    if (result.changes === 0) {
      return { success: false, message: '分类不存在' }
    }

    return { success: true, message: '分类删除成功' }
  } catch (error) {
    console.error('删除分类失败:', error)
    return { success: false, message: '删除分类失败，请稍后重试' }
  }
})

// 平台分类排序
ipcMain.handle('platform:category:sort', async (_, data) => {
  try {
    // 更新排序顺序
    const updateStmt = db.prepare('UPDATE platform_categories SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    for (const category of data.categories) {
      updateStmt.run(category.sort_order, category.category_id)
    }

    return { success: true, message: '分类排序成功' }
  } catch (error) {
    console.error('分类排序失败:', error)
    return { success: false, message: '分类排序失败，请稍后重试' }
  }
})

// 平台口令创建
ipcMain.handle('platform:password:create', async (_, data) => {
  try {
    // 检查根口令是否已设置
    const rootPassword = db.prepare('SELECT * FROM root_passwords WHERE user_id = ?').get(data.user_id) as any
    if (!rootPassword) {
      return { success: false, message: '请先设置根口令' }
    }

    // 使用RSA公钥加密平台口令和保密信息
    const platformPasswordEncrypted = crypto.publicEncrypt(
      { key: rootPassword.rsa_public_key, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(data.platform_password)
    ).toString('base64')

    let secretInfoEncrypted = ''
    if (data.secret_info) {
      secretInfoEncrypted = crypto.publicEncrypt(
        { key: rootPassword.rsa_public_key, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
        Buffer.from(data.secret_info)
      ).toString('base64')
    }

    // 插入平台口令
    const insertStmt = db.prepare(`
      INSERT INTO platform_passwords (user_id, category_id, platform_name, platform_account, platform_password, related_email, related_phone, secret_info, remark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const result = insertStmt.run(
      data.user_id,
      data.category_id,
      data.platform_name,
      data.platform_account,
      platformPasswordEncrypted,
      data.related_email || '',
      data.related_phone || '',
      secretInfoEncrypted,
      data.remark || ''
    )

    // 记录历史
    const insertHistoryStmt = db.prepare(`
      INSERT INTO platform_password_history (password_id, user_id, category_id, platform_name, platform_account, platform_password, related_email, related_phone, secret_info, remark, operation_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    insertHistoryStmt.run(
      result.lastInsertRowid,
      data.user_id,
      data.category_id,
      data.platform_name,
      data.platform_account,
      platformPasswordEncrypted,
      data.related_email || '',
      data.related_phone || '',
      secretInfoEncrypted,
      data.remark || '',
      '新增'
    )

    return {
      success: true,
      message: '平台口令创建成功',
      data: {
        password_id: result.lastInsertRowid,
        platform_name: data.platform_name
      }
    }
  } catch (error) {
    console.error('创建平台口令失败:', error)
    return { success: false, message: '创建平台口令失败，请稍后重试' }
  }
})

// 平台口令列表
ipcMain.handle('platform:password:list', async (_, data) => {
  try {
    // 构建查询条件
    let query = `
      SELECT 
        p.id as password_id, 
        p.category_id, 
        c.name as category_name, 
        p.platform_name, 
        p.platform_account, 
        p.related_email, 
        p.related_phone, 
        p.remark, 
        p.created_at, 
        p.updated_at 
      FROM platform_passwords p
      JOIN platform_categories c ON p.category_id = c.id
      WHERE p.user_id = ?
    `
    const params: any[] = [data.user_id]

    if (data.category_id) {
      query += ' AND p.category_id = ?'
      params.push(data.category_id)
    }

    if (data.platform_name) {
      query += ' AND p.platform_name LIKE ?'
      params.push(`%${data.platform_name}%`)
    }

    query += ' ORDER BY p.updated_at DESC'

    // 执行查询
    const passwords = db.prepare(query).all(...params)

    return {
      success: true,
      message: '获取平台口令列表成功',
      data: passwords
    }
  } catch (error) {
    console.error('获取平台口令列表失败:', error)
    return { success: false, message: '获取平台口令列表失败，请稍后重试' }
  }
})

// 平台口令修改
ipcMain.handle('platform:password:update', async (_, data) => {
  try {
    // 检查根口令是否正确
    const rootPassword = db.prepare('SELECT * FROM root_passwords WHERE user_id = ?').get(data.user_id) as any
    if (!rootPassword) {
      return { success: false, message: '请先设置根口令' }
    }

    const isRootPasswordValid = bcrypt.compareSync(data.root_password, rootPassword.root_password)
    if (!isRootPasswordValid) {
      return { success: false, message: '根口令错误' }
    }

    // 使用RSA公钥加密平台口令和保密信息
    const platformPasswordEncrypted = crypto.publicEncrypt(
      { key: rootPassword.rsa_public_key, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(data.platform_password)
    ).toString('base64')

    let secretInfoEncrypted = ''
    if (data.secret_info) {
      secretInfoEncrypted = crypto.publicEncrypt(
        { key: rootPassword.rsa_public_key, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
        Buffer.from(data.secret_info)
      ).toString('base64')
    }

    // 更新平台口令
    const updateStmt = db.prepare(`
      UPDATE platform_passwords 
      SET category_id = ?, platform_name = ?, platform_account = ?, platform_password = ?, related_email = ?, related_phone = ?, secret_info = ?, remark = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `)
    const result = updateStmt.run(
      data.category_id,
      data.platform_name,
      data.platform_account,
      platformPasswordEncrypted,
      data.related_email || '',
      data.related_phone || '',
      secretInfoEncrypted,
      data.remark || '',
      data.password_id,
      data.user_id
    )

    if (result.changes === 0) {
      return { success: false, message: '平台口令不存在或信息未变化' }
    }

    // 记录历史
    const insertHistoryStmt = db.prepare(`
      INSERT INTO platform_password_history (password_id, user_id, category_id, platform_name, platform_account, platform_password, related_email, related_phone, secret_info, remark, operation_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    insertHistoryStmt.run(
      data.password_id,
      data.user_id,
      data.category_id,
      data.platform_name,
      data.platform_account,
      platformPasswordEncrypted,
      data.related_email || '',
      data.related_phone || '',
      secretInfoEncrypted,
      data.remark || '',
      '修改'
    )

    return { success: true, message: '平台口令修改成功' }
  } catch (error) {
    console.error('修改平台口令失败:', error)
    return { success: false, message: '修改平台口令失败，请稍后重试' }
  }
})

// 平台口令删除
ipcMain.handle('platform:password:delete', async (_, data) => {
  try {
    // 检查根口令是否正确
    const rootPassword = db.prepare('SELECT * FROM root_passwords WHERE user_id = ?').get(data.user_id) as any
    if (!rootPassword) {
      return { success: false, message: '请先设置根口令' }
    }

    const isRootPasswordValid = bcrypt.compareSync(data.root_password, rootPassword.root_password)
    if (!isRootPasswordValid) {
      return { success: false, message: '根口令错误' }
    }

    // 记录删除前的信息到历史表
    const password = db.prepare('SELECT * FROM platform_passwords WHERE id = ? AND user_id = ?').get(data.password_id, data.user_id) as any
    if (password) {
      const insertHistoryStmt = db.prepare(`
        INSERT INTO platform_password_history (password_id, user_id, category_id, platform_name, platform_account, platform_password, related_email, related_phone, secret_info, remark, operation_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      insertHistoryStmt.run(
        data.password_id,
        data.user_id,
        password.category_id,
        password.platform_name,
        password.platform_account,
        password.platform_password,
        password.related_email,
        password.related_phone,
        password.secret_info,
        password.remark,
        '删除'
      )
    }

    // 删除平台口令
    const deleteStmt = db.prepare('DELETE FROM platform_passwords WHERE id = ? AND user_id = ?')
    const result = deleteStmt.run(data.password_id, data.user_id)

    if (result.changes === 0) {
      return { success: false, message: '平台口令不存在' }
    }

    return { success: true, message: '平台口令删除成功' }
  } catch (error) {
    console.error('删除平台口令失败:', error)
    return { success: false, message: '删除平台口令失败，请稍后重试' }
  }
})

// 平台口令详情
ipcMain.handle('platform:password:detail', async (_, data) => {
  try {
    // 检查根口令是否正确
    const rootPassword = db.prepare('SELECT * FROM root_passwords WHERE user_id = ?').get(data.user_id) as any
    if (!rootPassword) {
      return { success: false, message: '请先设置根口令' }
    }

    const isRootPasswordValid = bcrypt.compareSync(data.root_password, rootPassword.root_password)
    if (!isRootPasswordValid) {
      return { success: false, message: '根口令错误' }
    }

    // 获取平台口令详情
    const password = db.prepare(`
      SELECT 
        p.id as password_id, 
        p.category_id, 
        c.name as category_name, 
        p.platform_name, 
        p.platform_account, 
        p.platform_password, 
        p.related_email, 
        p.related_phone, 
        p.secret_info, 
        p.remark, 
        p.created_at, 
        p.updated_at 
      FROM platform_passwords p
      JOIN platform_categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.user_id = ?
    `).get(data.password_id, data.user_id) as any
    if (!password) {
      return { success: false, message: '平台口令不存在' }
    }

    // 解密RSA私钥
    const aesKey = crypto.scryptSync(data.root_password, rootPassword.aes_salt, 32)
    const [ivHex, encryptedPrivateKeyHex] = rootPassword.rsa_private_key.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const encryptedPrivateKey = Buffer.from(encryptedPrivateKeyHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv)
    let privateKeyBuffer = decipher.update(encryptedPrivateKey)
    privateKeyBuffer = Buffer.concat([privateKeyBuffer, decipher.final()])
    const privateKey = privateKeyBuffer.toString('utf8')

    // 解密平台口令
    const platformPasswordDecrypted = crypto.privateDecrypt(
      { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(password.platform_password, 'base64')
    ).toString('utf8')

    // 解密保密信息
    let secretInfoDecrypted = ''
    if (password.secret_info) {
      secretInfoDecrypted = crypto.privateDecrypt(
        { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
        Buffer.from(password.secret_info, 'base64')
      ).toString('utf8')
    }

    return {
      success: true,
      message: '获取平台口令详情成功',
      data: {
        ...password,
        platform_password: platformPasswordDecrypted,
        secret_info: secretInfoDecrypted
      }
    }
  } catch (error) {
    console.error('获取平台口令详情失败:', error)
    return { success: false, message: '获取平台口令详情失败，请稍后重试' }
  }
})

// 平台口令历史
ipcMain.handle('platform:password:history', async (_, data) => {
  try {
    // 获取平台口令历史
    const history = db.prepare(`
      SELECT 
        pph.id as history_id, 
        pph.password_id, 
        pph.category_id, 
        c.name as category_name, 
        pph.platform_name, 
        pph.platform_account, 
        pph.related_email, 
        pph.related_phone, 
        pph.remark, 
        pph.operation_type, 
        pph.operated_at 
      FROM platform_password_history pph
      JOIN platform_categories c ON pph.category_id = c.id
      WHERE pph.password_id = ? AND pph.user_id = ?
      ORDER BY pph.operated_at DESC
    `).all(data.password_id, data.user_id)

    return {
      success: true,
      message: '获取平台口令历史成功',
      data: history
    }
  } catch (error) {
    console.error('获取平台口令历史失败:', error)
    return { success: false, message: '获取平台口令历史失败，请稍后重试' }
  }
})

// 平台口令历史详情
ipcMain.handle('platform:password:history:detail', async (_, data) => {
  try {
    // 检查根口令是否正确
    const rootPassword = db.prepare('SELECT * FROM root_passwords WHERE user_id = ?').get(data.user_id) as any
    if (!rootPassword) {
      return { success: false, message: '请先设置根口令' }
    }

    const isRootPasswordValid = bcrypt.compareSync(data.root_password, rootPassword.root_password)
    if (!isRootPasswordValid) {
      return { success: false, message: '根口令错误' }
    }

    // 获取历史详情
    const history = db.prepare(`
      SELECT 
        pph.id as history_id, 
        pph.password_id, 
        pph.category_id, 
        c.name as category_name, 
        pph.platform_name, 
        pph.platform_account, 
        pph.platform_password, 
        pph.related_email, 
        pph.related_phone, 
        pph.secret_info, 
        pph.remark, 
        pph.operation_type, 
        pph.operated_at 
      FROM platform_password_history pph
      JOIN platform_categories c ON pph.category_id = c.id
      WHERE pph.id = ? AND pph.user_id = ?
    `).get(data.history_id, data.user_id) as any
    if (!history) {
      return { success: false, message: '历史记录不存在' }
    }

    // 解密RSA私钥
    const aesKey = crypto.scryptSync(data.root_password, rootPassword.aes_salt, 32)
    const [ivHex, encryptedPrivateKeyHex] = rootPassword.rsa_private_key.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const encryptedPrivateKey = Buffer.from(encryptedPrivateKeyHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv)
    let privateKeyBuffer = decipher.update(encryptedPrivateKey)
    privateKeyBuffer = Buffer.concat([privateKeyBuffer, decipher.final()])
    const privateKey = privateKeyBuffer.toString('utf8')

    // 解密平台口令
    const platformPasswordDecrypted = crypto.privateDecrypt(
      { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(history.platform_password, 'base64')
    ).toString('utf8')

    // 解密保密信息
    let secretInfoDecrypted = ''
    if (history.secret_info) {
      secretInfoDecrypted = crypto.privateDecrypt(
        { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
        Buffer.from(history.secret_info, 'base64')
      ).toString('utf8')
    }

    return {
      success: true,
      message: '获取历史详情成功',
      data: {
        ...history,
        platform_password: platformPasswordDecrypted,
        secret_info: secretInfoDecrypted
      }
    }
  } catch (error) {
    console.error('获取历史详情失败:', error)
    return { success: false, message: '获取历史详情失败，请稍后重试' }
  }
})

// 平台口令自动生成
ipcMain.handle('platform:password:generate', async (_, data) => {
  try {
    const { include_number, include_lowercase, include_uppercase, include_special, length } = data

    // 定义字符集
    let charset = ''
    if (include_number) charset += '0123456789'
    if (include_lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
    if (include_uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (include_special) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (!charset) {
      return { success: false, message: '请至少选择一种字符类型' }
    }

    // 生成随机密码
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    // 计算密码强度
    let strength = '弱'
    if (length >= 8 && include_number && include_lowercase && include_uppercase && include_special) {
      strength = '强'
    } else if (length >= 6 && (include_number || include_lowercase || include_uppercase || include_special)) {
      strength = '中'
    }

    return {
      success: true,
      message: '密码生成成功',
      data: { password, strength }
    }
  } catch (error) {
    console.error('生成密码失败:', error)
    return { success: false, message: '生成密码失败，请稍后重试' }
  }
})

// 数据操作日志
ipcMain.handle('data:operation:logs', async (_, data) => {
  try {
    // 检查是否为admin用户
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(data.username) as any
    if (!user || user.username !== 'admin') {
      return { success: false, message: '权限不足' }
    }

    // 获取操作日志
    const logs = db.prepare('SELECT * FROM data_operation_logs ORDER BY operation_time DESC').all()

    return {
      success: true,
      message: '获取操作日志成功',
      data: logs.map((log: any) => ({
        operation_id: log.id,
        operation_time: log.operation_time,
        operation_type: log.operation_type,
        file_name: log.file_name,
        operator: log.operator
      }))
    }
  } catch (error) {
    console.error('获取操作日志失败:', error)
    return { success: false, message: '获取操作日志失败，请稍后重试' }
  }
})

// 数据备份
ipcMain.handle('data:backup', async (_, data) => {
  try {
    // 检查是否为admin用户
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(data.username) as any
    if (!user || user.username !== 'admin') {
      return { success: false, message: '权限不足' }
    }

    // 执行备份（简化实现，复制数据库文件）
    const backupPath = path.join(path.dirname(dbPath), `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`)
    fs.copyFileSync(dbPath, backupPath)

    // 记录备份日志
    const insertLogStmt = db.prepare(`
      INSERT INTO data_operation_logs (operation_type, file_name, operator)
      VALUES (?, ?, ?)
    `)
    insertLogStmt.run('备份', path.basename(backupPath), data.username)

    return {
      success: true,
      message: '数据备份成功',
      data: { file_name: path.basename(backupPath) }
    }
  } catch (error) {
    console.error('备份数据失败:', error)
    return { success: false, message: '备份数据失败，请稍后重试' }
  }
})

// 数据恢复
ipcMain.handle('data:restore', async (_, data) => {
  try {
    // 检查是否为admin用户
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(data.username) as any
    if (!user || user.username !== 'admin') {
      return { success: false, message: '权限不足' }
    }

    // 执行恢复（简化实现，复制备份文件到数据库文件）
    const backupPath = path.join(path.dirname(dbPath), data.file_name)
    if (!fs.existsSync(backupPath)) {
      return { success: false, message: '备份文件不存在' }
    }

    // 复制备份文件（better-sqlite3会自动处理数据库连接）
    fs.copyFileSync(backupPath, dbPath)

    // 记录恢复日志
    const insertLogStmt = db.prepare(`
      INSERT INTO data_operation_logs (operation_type, file_name, operator)
      VALUES (?, ?, ?)
    `)
    insertLogStmt.run('恢复', data.file_name, data.username)

    return { success: true, message: '数据恢复成功' }
  } catch (error) {
    console.error('恢复数据失败:', error)
    return { success: false, message: '恢复数据失败，请稍后重试' }
  }
})

// 简单的IPC示例
ipcMain.on('ping', (event) => {
  event.reply('pong', 'Hello from Electron main process!')
})