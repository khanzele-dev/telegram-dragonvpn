import { MyConversation, MyConversationContext } from "../../types";
import { redeemPromoCode } from "../../services/promoCodeService";

export async function promoCodeConversation(
  conversation: MyConversation,
  ctx: MyConversationContext,
) {
  await ctx.reply("🎫 Введите ваш промокод:");

  const msg = await conversation.waitFor("message:text");
  const code = msg.message.text.trim();

  if (!code) {
    await ctx.reply("❌ Промокод не может быть пустым.");
    return;
  }

  const telegramId = msg.from?.id;
  if (!telegramId) {
    await ctx.reply("❌ Не удалось определить пользователя.");
    return;
  }

  const result = await redeemPromoCode(code, telegramId);

  if (!result.success) {
    await ctx.reply(`❌ ${result.error}`);
    return;
  }

  const endDateStr = result.endDate.toLocaleDateString("ru-RU");
  await ctx.reply(
    `✅ <b>Промокод активирован!</b>\n\n` +
      `📦 Тариф: <b>${result.plan.name}</b>\n` +
      `📅 Подписка активна до: <b>${endDateStr}</b>\n\n` +
      `🌍 Ваш VPN готов к использованию!`,
    { parse_mode: "HTML" },
  );
}
