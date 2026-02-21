import { BaseRepository } from './BaseRepository.js'

export class StatusHistoryRepository extends BaseRepository {
  constructor() {
    super('statusHistory')
  }

  async recordStatusChange(entityType, entityId, previousStatus, newStatus, reason = null) {
    return this.create({
      entityType,
      entityId,
      previousStatus,
      newStatus,
      reason,
    })
  }

  async getEntityHistory(entityType, entityId, limit = 100, offset = 0) {
    return this.findMany(
      { entityType, entityId },
      limit,
      offset
    )
  }

  async getStatusHistoryByType(entityType, limit = 100, offset = 0) {
    return this.findMany({ entityType }, limit, offset)
  }

  async getRecentStatusChanges(entityType, minutes = 60, limit = 100) {
    const since = new Date(Date.now() - minutes * 60000)
    
    return this.prisma.statusHistory.findMany({
      where: {
        entityType,
        createdAt: {
          gte: since,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async getStatusChangesByDateRange(entityType, entityId, startDate, endDate, limit = 1000) {
    return this.prisma.statusHistory.findMany({
      where: {
        entityType,
        entityId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async getLatestStatus(entityType, entityId) {
    const latest = await this.prisma.statusHistory.findFirst({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    })
    return latest ? latest.newStatus : null
  }

  async getStatusChangeCount(entityType, entityId, startDate, endDate) {
    return this.prisma.statusHistory.count({
      where: {
        entityType,
        entityId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })
  }

  async getAverageStatusDuration(entityType, entityId, startDate, endDate) {
    const changes = await this.getStatusChangesByDateRange(
      entityType,
      entityId,
      startDate,
      endDate
    )

    if (changes.length < 2) return 0

    let totalDuration = 0
    for (let i = 0; i < changes.length - 1; i++) {
      const duration = changes[i].createdAt - changes[i + 1].createdAt
      totalDuration += duration
    }

    return (totalDuration / (changes.length - 1) / 1000 / 60).toFixed(2) // in minutes
  }

  async clearOldStatusHistory(daysOld = 90) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
    
    return this.prisma.statusHistory.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })
  }
}

export default new StatusHistoryRepository()
