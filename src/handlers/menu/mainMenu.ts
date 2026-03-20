import { MyContext } from "../../types";
import { Menu } from "@grammyjs/menu";
import { getOrCreate } from "../../services/userService";
import { plansMenu } from "./plansMenu";
import { InlineKeyboard } from "grammy";

const shareKeyboard = (referralCode: string) =>
  new InlineKeyboard()
    .switchInline(
      "🖇 Поделиться ссылкой",
      `Попробуй этот VPN — работает стабильно, без глюков. По моей ссылке получишь +5 дней бесплатно 👉 https://t.me/DragonPNBot?start=${referralCode}`,
    )
    .row()
    .copyText(
      "📋 Скопировать текст",
      `Попробуй этот VPN — работает стабильно, без глюков. По моей ссылке получишь +5 дней бесплатно 👉 https://t.me/DragonPNBot?start=${referralCode}`,
    )
    .row()
    .text("⬅️ Назад", "back_to_menu");

const instructionsKeyboard = new InlineKeyboard().text("📱 iPhone", "instructions:iphone").text("📱 Android", "instructions:android").row().text("💻 MacOS", "instructions:macos").text("🖥 Windows", "instructions:windows").row().text("📺 Android TV", "instructions:androidtv").row().text("⬅️ Назад", "back_to_menu")

export const mainMenu = new Menu<MyContext>("main_menu")
  .text("Приобрести VPN 🐉", async (ctx) => {
    await ctx.editMessageText(
      "👇 Выбери тариф, который подходит именно тебе\n💡 чем больше срок — тем выгоднее цена",
      { reply_markup: plansMenu },
    );
    await ctx.answerCallbackQuery("Приобрести VPN 🐉")
  })
  .row()
  .text("⚡️ Мои VPN")
  .text("⏳ Продлить VPN")
  .row()
  .text("📃 Инструкция", async (ctx) => {
    await ctx.editMessageText('Выберите устройство для просмотра инструкции:', { reply_markup: instructionsKeyboard})
  })
  .text("👥 Пригласить", async (ctx) => {
    const user = await getOrCreate(ctx.from.id);
    await ctx.editMessageText(
      `👥 <b>Позови друга — получи подарок!</b>\n\nПоделись ссылкой с другом, и вы оба получите бонус:\n— тебе +10 дней VPN бесплатно 🎁\n— другу +5 дней в подарок 🎉\n\n📊 Твои результаты:\n├ Приглашено друзей: <b>}</b>\n└ Бонусных дней получено: <b>}</b>\n\n🔗 Твоя ссылка — просто отправь другу:\n<code>https://t.me/DragonPNBot?start=${user.referralCode}</code>\n\n✍️ Или скопируй готовое сообщение:\n<code>Попробуй этот VPN — работает стабильно, без глюков. По моей ссылке получишь +5 дней бесплатно 👉 https://t.me/DragonPNBot?start=${user.referralCode}</code>\n\n💡 Больше друзей = больше бесплатных дней. Всё честно!`,
      {
        reply_markup: shareKeyboard(user.referralCode),
        link_preview_options: { is_disabled: true },
        parse_mode: "HTML",
      },
    );
    await ctx.answerCallbackQuery("👥 Пригласить")
  })
  .row()
  .text("🎁 Подарить промокод")
  .row()
  .text("🖊 Ввести промокод", async (ctx) => {
    await ctx.editMessageText("Введите промокод:");
    await ctx.answerCallbackQuery("🖊 Ввести промокод")
  })
  .row()
  .url("Техподдержка 💬", "t.me/DragonVPNSupport");

mainMenu.register(plansMenu);
