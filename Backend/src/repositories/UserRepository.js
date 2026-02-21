import { BaseRepository } from './BaseRepository.js'

export class UserRepository extends BaseRepository {
  constructor() {
    super('user')
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  async createUser(data) {
    return this.create(data)
  }

  async updateUser(id, data) {
    return this.update(id, data)
  }
}

export default new UserRepository()
