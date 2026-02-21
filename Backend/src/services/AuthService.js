import bcryptjs from 'bcryptjs'
import { generateToken } from '../utils/jwt.js'
import { AuthenticationError, ConflictError, NotFoundError } from '../utils/errors.js'
import UserRepository from '../repositories/UserRepository.js'

export class AuthService {
  async hashPassword(password) {
    return bcryptjs.hash(password, 10)
  }

  async comparePassword(password, hash) {
    return bcryptjs.compare(password, hash)
  }

  async generateAuthToken(userId, role) {
    return generateToken(userId, role)
  }

  async authenticateUser(email, password) {
    const user = await UserRepository.findByEmail(email)
    if (!user) {
      throw new AuthenticationError('Invalid email or password')
    }

    const isPasswordValid = await this.comparePassword(password, user.password)
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password')
    }

    const token = this.generateAuthToken(user.id, user.role)
    return { user, token }
  }

  async registerUser(userData) {
    const existingUser = await UserRepository.findByEmail(userData.email)
    if (existingUser) {
      throw new ConflictError('Email already registered')
    }

    const hashedPassword = await this.hashPassword(userData.password)
    const newUser = await UserRepository.create({
      ...userData,
      password: hashedPassword,
    })

    const token = this.generateAuthToken(newUser.id, newUser.role)
    return { user: newUser, token }
  }

  async getUserById(userId) {
    const user = await UserRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User')
    }
    return user
  }

  async updateUserProfile(userId, updates) {
    return UserRepository.update(userId, updates)
  }
}

export default new AuthService()

