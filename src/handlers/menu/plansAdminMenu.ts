import { MyContext } from "../../types";
import { Menu } from "@grammyjs/menu";
import { getPlans } from "../../services/planService";
import { planActionsMenu } from "./planActionsMenu";
import { adminMenu } from "./adminMenu";

export const plansAdminMenu = new Menu<MyContext>("plans_admin_menu");

plansAdminMenu.dynamic(async (ctx, range) => {
  const plans = await getPlans();

  for (const plan of plans) {
    const status = plan.isActive ? "🟢" : "🔴";
    range
      .text(`${status} ${plan.name} — ${plan.price}₽`, async (ctx) => {
        ctx.session.editingPlanId = plan.id;
        ctx.session.editingPlan = plan;
        await ctx.editMessageText(
          `📦 <b>${plan.name}</b>\n💰 ${plan.price}₽\n📅 ${plan.durationDays} дней\n${plan.isActive ? "🟢 Активен" : "🔴 Неактивен"}`,
          { parse_mode: "HTML", reply_markup: planActionsMenu },
        );
      })
      .row();
  }

  range
    .text("➕ Создать тариф", async (ctx) => {
      await ctx.conversation.enter("createPlanConversation");
    })
    .row();

  range.text("⬅️ Назад", async (ctx) => {
    await ctx.editMessageText("Админ панель:", { reply_markup: adminMenu });
  });
});

plansAdminMenu.register(planActionsMenu);