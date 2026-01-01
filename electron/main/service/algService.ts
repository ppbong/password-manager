import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const alg = {
  bcrypt,
  crypto
}

// 导出算法服务
export { bcrypt, crypto }
export default alg
