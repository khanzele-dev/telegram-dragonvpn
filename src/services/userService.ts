import prisma from "../database/client";

export const getUsersForBroadcast = async () => {
  return prisma.user.findMany({
    where: { didBlock: false },
    select: {
      telegramId: true,
      didBlock: true,
    },
  });
};

export const getOrCreate = async (telegramId: number, username?: string) => {
  return prisma.user.upsert({
    where: { telegramId: BigInt(telegramId) },
    update: { username },
    create: {
      telegramId: BigInt(telegramId),
      username,
      referralCode: crypto.randomUUID().slice(0, 8),
    },
  });
};

export const getUsersCount = async () => {
  return prisma.user.count();
};

export const setDidBlock = async (telegramId: number, didBlock: boolean) => {
  return prisma.user.update({
    where: { telegramId: BigInt(telegramId) },
    data: { didBlock },
  });
};