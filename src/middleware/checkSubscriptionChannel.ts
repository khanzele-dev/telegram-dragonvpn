// middleware/checkSubscriptionChannel.ts
import "dotenv/config";
import { MyContext } from "../types";
import { InlineKeyboard, NextFunction } from "grammy";
import { start } from "../handlers/commands";

const keyboard = new InlineKeyboard()
  .url("📢 Подписаться на канал", "https://t.me/DragonVPNBlog")
  .row()
  .text("✅ Подписался", "middleware:already_subscribed");

export async function checkSubscriptionChannel(
  ctx: MyContext,
  next: NextFunction,
) {
  try {
    if (!ctx.from?.id) return;

    const member = await ctx.api.getChatMember(
      process.env.CHANNEL_ID as string,
      ctx.from.id,
    );

    if (member.status === "left" || member.status === "kicked") {
      await ctx.reply(
        "⚠️ Для использования бота необходимо подписаться на наш канал.\n\nПосле подписки нажмите кнопку ниже ⬇️",
        { reply_markup: keyboard },
      );
      return;
    }
    await next();
  } catch (err) {
    console.error(err);
  }
}