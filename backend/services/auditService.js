import prisma from '../models/prisma.js';

async function recordAudit({ actorId, action, entity, entityId, metadata }) {
  return prisma.auditLog.create({
    data: {
      actorId,
      action,
      entity,
      entityId,
      metadata
    }
  });
}

export { recordAudit };
