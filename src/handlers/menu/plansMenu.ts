import { MyContext } from "../../types";
import { Menu } from "@grammyjs/menu";
import { getActivePlans } from "../../services/planService";
import { mainMenu } from "./mainMenu";

export const plansMenu = new Menu<MyContext>("plans_menu");

plansMenu.dynamic(async (ctx, range) => {
  const plans = await getActivePlans();

  for (const plan of plans) {
    range
      .text(`${plan.name}`, async (ctx) => {
        await ctx.editMessageText(
          `📋 Подтверждение заказа:\n\n🌍 Сервер: Основной VPN 🐉\n📦 Тариф: ${plan.name}\n💰 Стоимость: ${plan.price}₽\n📅 Срок действия: ${plan.durationDays} дней\n\nДля оплаты нажмите кнопку ниже 👇`,
          { parse_mode: "HTML" },
        );
      })
      .row();
  }

  range.text("⬅️ Назад", async (ctx) => {
    await ctx.editMessageText(
      `👨‍💻 Ваш личный кабинет | ID: ${ctx.from!.id}\n\n⚡️ Мои VPN: ${0}\n\n🔻 Выберите действие ниже:`,
      { reply_markup: mainMenu },
    );
  });
});