import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Disconnect on process termination
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  console.log('Prisma disconnected')
  process.exit(0)
})

export const getPrismaClient = () => prisma

export default prisma
