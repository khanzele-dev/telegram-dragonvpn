import { MyContext } from "../types";
import { mainMenu } from "./menu/mainMenu";
import { plansMenu } from "./menu/plansMenu";
import { InlineKeyboard } from "grammy";

const instructionTexts: Record<string, string> = {
  iphone:
    "📱 <b>Инструкция для iPhone</b>\n\n1. Скачайте приложение <b>Outline</b> из App Store\n2. Нажмите «+» → «Добавить сервер вручную»\n3. Вставьте ключ подключения, который придёт после оплаты\n4. Нажмите <b>«Подключиться»</b>\n\n💡 По вопросам пишите в поддержку 👇",
  android:
    "📱 <b>Инструкция для Android</b>\n\n1. Скачайте приложение <b>Outline</b> из Google Play\n2. Нажмите «+» → «Добавить сервер вручную»\n3. Вставьте ключ подключения, который придёт после оплаты\n4. Нажмите <b>«Подключиться»</b>\n\n💡 По вопросам пишите в поддержку 👇",
  macos:
    "💻 <b>Инструкция для MacOS</b>\n\n1. Скачайте приложение <b>Outline</b> из Mac App Store\n2. Нажмите «+» → «Добавить сервер вручную»\n3. Вставьте ключ подключения, который придёт после оплаты\n4. Нажмите <b>«Подключиться»</b>\n\n💡 По вопросам пишите в поддержку 👇",
  windows:
    "🖥 <b>Инструкция для Windows</b>\n\n1. Скачайте приложение <b>Outline</b> с официального сайта\n2. Запустите установщик и откройте программу\n3. Нажмите «+» → «Добавить сервер вручную»\n4. Вставьте ключ подключения, который придёт после оплаты\n5. Нажмите <b>«Подключиться»</b>\n\n💡 По вопросам пишите в поддержку 👇",
  androidtv:
    "📺 <b>Инструкция для Android TV</b>\n\n1. Скачайте приложение <b>Outline</b> из Google Play на телевизор\n2. Используйте телефон или компьютер для сканирования QR-кода сервера\n3. Подключитесь через приложение\n\n💡 По вопросам пишите в поддержку 👇",
};

const backToInstructionsKeyboard = new InlineKeyboard()
  .text("⬅️ К выбору устройства", "instructions:back")
  .row()
  .text("🏠 Главное меню", "back_to_menu");

export const callbackHandler = async (ctx: MyContext) => {
  try {
    if (!ctx.from?.id) {
      throw new Error("Didn't get chat id");
    }
    if (!ctx.callbackQuery?.data) {
      throw new Error("Didn't get any data in callback");
    }
    const data = ctx.callbackQuery.data;

    if (data.startsWith("instructions:")) {
      const platform = data.split(":")[1];

      if (platform === "back") {
        const instructionsKeyboard = new InlineKeyboard()
          .text("📱 iPhone", "instructions:iphone")
          .text("📱 Android", "instructions:android")
          .row()
          .text("💻 MacOS", "instructions:macos")
          .text("🖥 Windows", "instructions:windows")
          .row()
          .text("📺 Android TV", "instructions:androidtv")
          .row()
          .text("⬅️ Назад", "back_to_menu");
        await ctx.editMessageText("📃 Выберите устройство для просмотра инструкции:", {
          reply_markup: instructionsKeyboard,
        });
      } else {
        const text = instructionTexts[platform];
        if (text) {
          await ctx.editMessageText(text, {
            parse_mode: "HTML",
            reply_markup: backToInstructionsKeyboard,
          });
        }
      }

      await ctx.answerCallbackQuery();
      return;
    }

    if (data.startsWith("pay:")) {
      await ctx.answerCallbackQuery({
        text: "💳 Оплата временно недоступна. Свяжитесь с поддержкой.",
        show_alert: true,
      });
      return;
    }

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
      case "back_to_menu": {
        await ctx.editMessageText(
          `👨‍💻 Ваш личный кабинет | ID: ${ctx.from!.id}\n\n⚡️ Мои VPN: 0\n\n🔻 Выберите действие ниже:`,
          { reply_markup: mainMenu },
        );
        await ctx.answerCallbackQuery();
        break;
      }
      case "back_to_plans": {
        await ctx.editMessageText(
          "👇 Выбери тариф, который подходит именно тебе\n💡 чем больше срок — тем выгоднее цена",
          { reply_markup: plansMenu },
        );
        await ctx.answerCallbackQuery();
        break;
      }
      default:
        await ctx.answerCallbackQuery();
    }
  } catch (err) {
    console.error(err);
  }
};
