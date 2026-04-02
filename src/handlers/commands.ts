import { MyContext } from "../types";
import { adminMenu } from "./menu/adminMenu";
import { getOrCreate, processReferral } from "../services/userService";
import { getUserActiveSubscriptionsCount } from "../services/subscriptionService";
import { mainMenu } from "./menu/mainMenu";

export const start = async (ctx: MyContext) => {
  try {
    if (!ctx.from?.id) {
      throw new Error("Didn't get an id of user");
    }

    const isNewUser = !(await import("../database/client").then((m) =>
      m.default.user.findUnique({ where: { telegramId: BigInt(ctx.from!.id) } }),
    ));

    const user = await getOrCreate(ctx.from.id, ctx.from.username);
    const vpnCount = await getUserActiveSubscriptionsCount(user.id);

    // Process referral only for brand-new users that arrived via an invite link
    const referralCode = ctx.match as string | undefined;
    if (isNewUser && referralCode) {
      const registered = await processReferral(ctx.from.id, referralCode);
      if (registered) {
        await ctx.reply(
          "🎉 <b>Добро пожаловать!</b>\n\nВы перешли по реферальной ссылке — вам начислено <b>+5 дней</b> VPN в подарок! 🎁",
          { parse_mode: "HTML" },
        );
      }
    }

    await ctx.reply(
      `👨‍💻 Ваш личный кабинет | ID: ${ctx.from.id}\n\n⚡️ Мои VPN: ${vpnCount}\n\n🔻 Выберите действие ниже:`,
      { reply_markup: mainMenu },
    );
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