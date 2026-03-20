import { MyContext } from "../types";
import { adminMenu } from "./menu/adminMenu";
import { getOrCreate } from "../services/userService";
import { mainMenu } from "./menu/mainMenu";

export const start = async (ctx: MyContext) => {
  try {
    if (!ctx.from?.id) {
      throw new Error("Didn't get an id of user");
    }
    const user = await getOrCreate(ctx.from.id, ctx.from.username);
    await ctx.reply(`👨‍💻 Ваш личный кабинет | ID: ${ctx.from.id}\n\n⚡️ Мои VPN: ${0}\n\n🔻 Выберите действие ниже:`, {
      reply_markup: mainMenu,
    });
  } catch (err) {
    console.error(err);
  }
};

export const admin = async (ctx: MyContext) => {
  try {
    if (!ctx.from?.id) {
      throw new Error("Didn't get an id of user");
    }
    await ctx.reply("📂 Админ-панель", { reply_markup: adminMenu });
  } catch (err) {
    console.log(err);
  }
};