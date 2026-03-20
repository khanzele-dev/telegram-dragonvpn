import prisma from "../database/client";

export const getPlans = async () => {
  return prisma.plan.findMany({ orderBy: { price: "asc" } });
};

export const getPlanById = async (id: string) => {
  return prisma.plan.findUnique({ where: { id } });
};

export const createPlan = async (
  name: string,
  durationDays: number,
  price: number,
) => {
  return prisma.plan.create({ data: { name, durationDays, price } });
};

export const updatePlan = async (
  id: string,
  data: Partial<{ name: string; durationDays: number; price: number }>,
) => {
  return prisma.plan.update({ where: { id }, data });
};

export const togglePlan = async (id: string, isActive: boolean) => {
  return prisma.plan.update({ where: { id }, data: { isActive } });
};

export const deletePlan = async (id: string) => {
  return prisma.plan.delete({ where: { id } });
};

export const getActivePlans = async () => {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });
};
