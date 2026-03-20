import { MyContext } from "../../types";
import { Menu } from "@grammyjs/menu";
import { deletePlan, getPlanById, togglePlan } from "../../services/planService";
import { plansAdminMenu } from "./plansAdminMenu";

export const planActionsMenu = new Menu<MyContext>("plan_actions_menu");

planActionsMenu.dynamic(async (ctx, range) => {
  const planId = ctx.session.editingPlanId;
  const plan = ctx.session.editingPlan;
  if (!planId || !plan) return;

  range
    .text("✏️ Редактировать", async (ctx) => {
      ctx.session.editingPlanId = plan.id;
      await ctx.conversation.enter("editPlanConversation");
    })
    .row()
    .text(
      plan.isActive ? "🔴 Деактивировать" : "🟢 Активировать",
      async (ctx) => {
        await togglePlan(planId, !plan.isActive);
        ctx.session.editingPlan = (await getPlanById(planId)) ?? undefined;
        await ctx.editMessageText(
          `✅ Тариф <b>${plan.name}</b> ${plan.isActive ? "деактивирован" : "активирован"}`,
          { parse_mode: "HTML", reply_markup: planActionsMenu },
        );
      },
    )
    .row()
    .text("🗑 Удалить", async (ctx) => {
      await deletePlan(planId);
      ctx.session.editingPlanId = undefined;
      ctx.session.editingPlan = undefined;
      await ctx.editMessageText("🗑 Тариф удалён.", {
        reply_markup: plansAdminMenu,
      });
    })
    .row()
    .text("⬅️ Назад", async (ctx) => {
      await ctx.editMessageText("✨ Тарифы:", { reply_markup: plansAdminMenu });
    });
});