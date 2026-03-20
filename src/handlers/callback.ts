import { MyContext } from "../types";
import { mainMenu } from "./menu/mainMenu";

export const callbackHandler = async (ctx: MyContext) => {
  try {
    if (!ctx.from?.id) {
      throw new Error("Didn't get chat id");
    }
    if (!ctx.callbackQuery?.data) {
      throw new Error("Didn't get any data in callback");
    }
    const data = ctx.callbackQuery.data;
    switch (data) {
      case "middleware:already_subscribed": {
        const member = await ctx.api.getChatMember(
          process.env.CHANNEL_ID as string,
          ctx.from!.id,
        );

        if (member.status === "left" || member.status === "kicked") {
          await ctx.answerCallbackQuery({
            text: "❌ Вы не подписались на канал!",
            show_alert: true,
          });
        } else {
          await ctx.deleteMessage();
          await ctx.answerCallbackQuery();
        }
        break;
      }
      case "back_to_menu":
        await ctx.editMessageText("👨‍💻 Ваш личный кабинет | ID: 6146035747\n\n⚡️ Мои VPN: 0\n\n🔻 Выберите действие ниже:", { reply_markup: mainMenu })
        await ctx.answerCallbackQuery();

      default:
        await ctx.answerCallbackQuery();
    }
  } catch (err) {
    console.error(err);
  }
};
