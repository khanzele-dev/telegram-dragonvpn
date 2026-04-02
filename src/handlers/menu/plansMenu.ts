import { MyContext } from "../../types";
import { Menu } from "@grammyjs/menu";
import { getActivePlans } from "../../services/planService";
import { mainMenu } from "./mainMenu";
import { InlineKeyboard } from "grammy";

export const plansMenu = new Menu<MyContext>("plans_menu");

plansMenu.dynamic(async (ctx, range) => {
  const plans = await getActivePlans();

  for (const plan of plans) {
    range
      .text(`${plan.name}`, async (ctx) => {
        await ctx.editMessageText(
          `📋 <b>Подтверждение заказа</b>\n\n🌍 Сервер: Основной VPN 🐉\n📦 Тариф: <b>${plan.name}</b>\n💰 Стоимость: <b>${plan.price}₽</b>\n📅 Срок действия: <b>${plan.durationDays} дней</b>\n\nДля оплаты нажмите кнопку ниже 👇`,
          {
            parse_mode: "HTML",
            reply_markup: new InlineKeyboard()
              .text("💳 Оплатить", `pay:${plan.id}`)
              .row()
              .text("⬅️ Назад к тарифам", "back_to_plans"),
          },
        );
      })
      .row();
  }

  range.text("⬅️ Назад", async (ctx) => {
    await ctx.editMessageText(
      `👨‍💻 Ваш личный кабинет | ID: ${ctx.from!.id}\n\n⚡️ Мои VPN: 0\n\n🔻 Выберите действие ниже:`,
      { reply_markup: mainMenu },
    );
  });
});