import { app } from 'electron'
import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import { bcrypt } from '../service/algService'

// 获取数据库文件路径
const dataDir = app.isPackaged ? path.join(process.resourcesPath, '..', 'data') : path.join(process.cwd(), 'data')
const dbPath = path.join(dataDir, 'password_manager.db')

// 确保数据目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// 创建数据库连接
const db = new Database(dbPath, { verbose: console.log })

// 初始化数据库表
function initDatabase() {
  // 创建用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `)

  // 创建根口令表
  db.exec(`
    CREATE TABLE IF NOT EXISTS root_passwords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      root_password TEXT NOT NULL,
      root_password_hint TEXT,
      aes_salt TEXT NOT NULL,
      rsa_public_key TEXT NOT NULL,
      rsa_private_key TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  // 创建平台分类表
  db.exec(`
    CREATE TABLE IF NOT EXISTS platform_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_platform_categories_code ON platform_categories(code);
    CREATE INDEX IF NOT EXISTS idx_platform_categories_name ON platform_categories(name);
    CREATE INDEX IF NOT EXISTS idx_platform_categories_sort_order ON platform_categories(sort_order);
  `)

  // 创建平台口令表
  db.exec(`
    CREATE TABLE IF NOT EXISTS platform_passwords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      platform_name TEXT NOT NULL,
      platform_account TEXT NOT NULL,
      platform_password TEXT NOT NULL,
      related_email TEXT,
      related_phone TEXT,
      secret_info TEXT,
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES platform_categories(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_platform_passwords_user_id ON platform_passwords(user_id);
    CREATE INDEX IF NOT EXISTS idx_platform_passwords_category_id ON platform_passwords(category_id);
    CREATE INDEX IF NOT EXISTS idx_platform_passwords_platform_name ON platform_passwords(platform_name);
  `)

  // 创建平台口令历史表
  db.exec(`
    CREATE TABLE IF NOT EXISTS platform_password_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      password_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      platform_name TEXT NOT NULL,
      platform_account TEXT NOT NULL,
      platform_password TEXT NOT NULL,
      related_email TEXT,
      related_phone TEXT,
      secret_info TEXT,
      remark TEXT,
      operation_type TEXT NOT NULL,
      operated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (password_id) REFERENCES platform_passwords(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES platform_categories(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_platform_password_history_password_id ON platform_password_history(password_id);
    CREATE INDEX IF NOT EXISTS idx_platform_password_history_user_id ON platform_password_history(user_id);
  `)

  // 创建数据操作日志表
  db.exec(`
    CREATE TABLE IF NOT EXISTS data_operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      operation_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      operator TEXT NOT NULL
    );
  `)

  // 初始化管理员用户
  const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin')
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10)
    db.prepare(`
      INSERT INTO users (username, password, name, email, phone, remark)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('admin', hashedPassword, '管理员', 'admin@example.com', '13800138000', '初始管理员')
  }

  // 初始化平台分类
  const categoriesCount = (db.prepare('SELECT COUNT(*) as count FROM platform_categories').get() as any).count as number
  if (categoriesCount === 0) {
    const categories = [
      { code: 'bank', name: '银行', description: '银行相关平台', sort_order: 1 },
      { code: 'email', name: '邮箱', description: '邮箱相关平台', sort_order: 2 },
      { code: 'website', name: '网站', description: '网站相关平台', sort_order: 3 },
      { code: 'app', name: '应用', description: '应用相关平台', sort_order: 4 },
      { code: 'other', name: '其他', description: '其他相关平台', sort_order: 5 }
    ]
    const insertCategory = db.prepare(`
      INSERT INTO platform_categories (code, name, description, sort_order)
      VALUES (?, ?, ?, ?)
    `)
    for (const category of categories) {
      insertCategory.run(category.code, category.name, category.description, category.sort_order)
    }
  }
}

// 执行数据库初始化
initDatabase()

// 导出数据库连接和数据库路径
export { db, dbPath }
export default db
