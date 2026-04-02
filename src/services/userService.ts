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

export const getReferralStats = async (userId: string) => {
  const referrals = await prisma.referral.findMany({
    where: { inviterId: userId },
    select: { rewardDays: true },
  });
  return {
    count: referrals.length,
    totalDays: referrals.reduce((sum, r) => sum + r.rewardDays, 0),
  };
};

/**
 * Process a referral after a new user joins via an invite link.
 * - Looks up inviter by referral code
 * - Ensures the invited user hasn't already used a referral
 * - Creates the Referral record (rewardDays = 10 for inviter; invited gets +5 noted separately)
 * Returns true if the referral was successfully registered.
 */
export const processReferral = async (
  invitedTelegramId: number,
  inviterReferralCode: string,
): Promise<boolean> => {
  const invitedUser = await prisma.user.findUnique({
    where: { telegramId: BigInt(invitedTelegramId) },
    include: { usedReferral: true },
  });
  if (!invitedUser) return false;
  // Already used a referral link before
  if (invitedUser.usedReferral) return false;

  const inviter = await prisma.user.findUnique({
    where: { referralCode: inviterReferralCode },
  });
  if (!inviter) return false;
  // Can't refer yourself
  if (inviter.id === invitedUser.id) return false;

  await prisma.referral.create({
    data: {
      inviterId: inviter.id,
      invitedId: invitedUser.id,
      rewardDays: 10,
    },
  });
  return true;
};