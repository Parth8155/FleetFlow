import prisma from '../config/prisma.js'

export class BaseRepository {
  constructor(model) {
    this.model = model
    this.prisma = prisma
  }

  async findById(id) {
    return this.prisma[this.model].findUnique({
      where: { id },
    })
  }

  async findAll(limit = 100, offset = 0) {
    return this.prisma[this.model].findMany({
      take: limit,
      skip: offset,
    })
  }

  async findOne(where) {
    return this.prisma[this.model].findFirst({
      where,
    })
  }

  async findMany(where = {}, limit = 100, offset = 0) {
    return this.prisma[this.model].findMany({
      where,
      take: limit,
      skip: offset,
    })
  }

  async count(where = {}) {
    return this.prisma[this.model].count({
      where,
    })
  }

  async create(data) {
    return this.prisma[this.model].create({
      data,
    })
  }

  async update(id, data) {
    return this.prisma[this.model].update({
      where: { id },
      data,
    })
  }

  async delete(id) {
    return this.prisma[this.model].delete({
      where: { id },
    })
  }

  async upsert(where, create, update) {
    return this.prisma[this.model].upsert({
      where,
      create,
      update,
    })
  }
}

export default BaseRepository

