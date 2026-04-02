import prisma from "../database/client";

export const getUserActiveSubscriptions = async (userId: string) => {
  const now = new Date();
  return prisma.subscription.findMany({
    where: { userId, endDate: { gte: now } },
    include: { plan: true },
    orderBy: { endDate: "asc" },
  });
};

export const getUserActiveSubscriptionsCount = async (userId: string) => {
  const now = new Date();
  return prisma.subscription.count({
    where: { userId, endDate: { gte: now } },
  });
};

export const createSubscription = async (
  userId: string,
  planId: string,
  durationDays: number,
) => {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return prisma.subscription.create({
    data: { userId, planId, startDate, endDate },
  });
};
