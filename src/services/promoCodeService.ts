import prisma from "../database/client";

export const redeemPromoCode = async (code: string, telegramId: number) => {
  const promoCode = await prisma.promoCode.findUnique({
    where: { code },
    include: { plan: true },
  });

  if (!promoCode) {
    return { success: false, error: "Промокод не найден" } as const;
  }

  if (promoCode.status === "used") {
    return { success: false, error: "Промокод уже использован" } as const;
  }

  if (
    promoCode.status === "expired" ||
    (promoCode.expiresAt && promoCode.expiresAt < new Date())
  ) {
    return { success: false, error: "Срок действия промокода истёк" } as const;
  }

  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  });

  if (!user) {
    return { success: false, error: "Пользователь не найден" } as const;
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + promoCode.plan.durationDays);

  const subscription = await prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.create({
      data: {
        userId: user.id,
        planId: promoCode.planId,
        startDate,
        endDate,
      },
    });

    await tx.promoCode.update({
      where: { id: promoCode.id },
      data: {
        status: "used",
        redeemedById: user.id,
        subscriptionId: sub.id,
        redeemedAt: new Date(),
      },
    });

    return sub;
  });

  return { success: true, plan: promoCode.plan, endDate: subscription.endDate } as const;
};
