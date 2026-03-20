import { MyContext } from "../../types";
import { Menu } from "@grammyjs/menu";
import { getUsersCount } from "../../services/userService";
import { plansAdminMenu } from "./plansAdminMenu";

export const adminMenu = new Menu<MyContext>("admin_menu")
  .text("📊 Статистика", async (ctx) => {
    const users = await getUsersCount();
    await ctx.editMessageText(`👥 Всего пользователей: ${users}`, {
      reply_markup: statsMenu,
    });
  })
  .row()
  .text("🔄 Рассылка", async (ctx) => {
    await ctx.conversation.enter("broadcastConversation");
    ctx.menu.close();
  })
  .row()
  .text("✨ Тарифы", async (ctx) => {
    await ctx.editMessageText("✨ Тарифы:", { reply_markup: plansAdminMenu });
  })
  .row()
  .text("💬 Промокоды");

const statsMenu = new Menu<MyContext>("stats_menu").text(
  "⬅️ Назад",
  async (ctx) => {
    await ctx.editMessageText("📂 Админ-панель:", { reply_markup: adminMenu });
  },
);

adminMenu.register(plansAdminMenu);
adminMenu.register(statsMenu);
