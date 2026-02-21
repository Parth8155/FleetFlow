import prisma from './prisma.js'

// Export Prisma client and helper methods
export const query = async (sql, params) => {
  return prisma.$queryRawUnsafe(sql, ...params)
}

export const getClient = async () => {
  return prisma
}

export const closePool = async () => {
  await prisma.$disconnect()
}

export default prisma

