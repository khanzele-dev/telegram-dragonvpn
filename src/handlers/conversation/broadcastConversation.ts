import { InlineKeyboard } from "grammy";
import { MyConversation, MyConversationContext } from "../../types";
import { getUsersForBroadcast } from "../../services/userService";

const MailingKeyboard = new InlineKeyboard()
  .text("✅ Начать рассылку", "mailing:yes")
  .text("❌ Отменить", "mailing:cancel");

const ImageKeyboard = new InlineKeyboard().text("❌ Нет", "image:no");

export async function broadcastConversation(
  conversation: MyConversation,
  ctx: MyConversationContext
) {
  await ctx.reply("<b>✏️ Шаг 1/3:</b> Введите текст для рассылки:", {
    parse_mode: "HTML",
  });
  const { message } = await conversation.waitFor(":text");
  if (!message?.text) {
    await ctx.reply("❌ Нужно ввести текст");
    return;
  }
  const photoMessage = await ctx.reply(
    "🖼 <b>Шаг 2/3:</b> Пришлите изображение",
    {
      parse_mode: "HTML",
      reply_markup: ImageKeyboard,
    }
  );
  const response = await conversation.wait();
  let photo: string | null = null;

  if (response.callbackQuery?.data === "image:no") {
    await ctx.api.answerCallbackQuery(response.callbackQuery.id, {
      text: "Продолжаем без изображения",
    });
    await ctx.api.editMessageReplyMarkup(
      ctx.chat!.id,
      photoMessage.message_id,
      {
        reply_markup: undefined,
      }
    );
  } else if (response.message?.photo) {
    photo = response.message.photo[response.message.photo.length - 1].file_id;
    await ctx.api.editMessageReplyMarkup(
      ctx.chat!.id,
      photoMessage.message_id,
      {
        reply_markup: undefined,
      }
    );
  }
  await ctx.reply("<b>📋 Шаг 3/3:</b> Подтвердите рассылку", {
    parse_mode: "HTML",
  });
  let confirmMessage;
  try {
    if (photo) {
      confirmMessage = await ctx.replyWithPhoto(photo, {
        caption: `${message.text}\n\n<b>Начать рассылку?</b>`,
        caption_entities: message.entities,
        parse_mode: "HTML",
        reply_markup: MailingKeyboard,
      });
    } else {
      confirmMessage = await ctx.reply(
        `${message.text}\n\n<b>Начать рассылку?</b>`,
        {
          reply_markup: MailingKeyboard,
          entities: message.entities,
          parse_mode: "HTML",
        }
      );
    }
  } catch (err) {
    await ctx.reply("❌ Ошибка при обработке сообщения для рассылки");
    return;
  }
  const { callbackQuery } = await conversation.waitFor("callback_query");
  if (callbackQuery?.data === "mailing:cancel") {
    await ctx.api.answerCallbackQuery(callbackQuery.id, {
      text: "❌ Рассылка отменена",
    });
    try {
      if (photo) {
        await ctx.api.editMessageCaption(
          ctx.chat!.id,
          confirmMessage.message_id,
          {
            caption: "❌ Рассылка отменена",
            reply_markup: undefined,
          }
        );
      } else {
        await ctx.api.editMessageText(
          ctx.chat!.id,
          confirmMessage.message_id,
          "❌ Рассылка отменена",
          { reply_markup: undefined }
        );
      }
    } catch (err) {}
    return;
  }

  if (callbackQuery?.data === "mailing:yes") {
    await ctx.api.answerCallbackQuery(callbackQuery.id, {
      text: "📤 Начинаем рассылку...",
    });

    try {
      if (photo) {
        await ctx.api.editMessageCaption(
          ctx.chat!.id,
          confirmMessage.message_id,
          {
            caption: "📤 Начинаем рассылку...",
            reply_markup: undefined,
          }
        );
      } else {
        await ctx.api.editMessageText(
          ctx.chat!.id,
          confirmMessage.message_id,
          "📤 Начинаем рассылку...",
          { reply_markup: undefined }
        );
      }
    } catch (err) {}

    const users = await getUsersForBroadcast();
    let success = 0;
    let failed = 0;

    for (const user of users) {
      try {
        if (user.didBlock == true) failed++;
        if (photo) {
          await ctx.api.sendPhoto(Number(user.telegramId), photo, {
            caption: message.text,
            caption_entities: message.entities,
          });
        } else {
          await ctx.api.sendMessage(Number(user.telegramId), message.text, {
            entities: message.entities,
          });
        }
        success++;
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (err) {
        failed++;
      }
    }

    await ctx.reply(
      `✅ <b>Рассылка завершена</b>\n\n` +
        `📊 Статистика:\n` +
        `✅ Успешно: ${success}\n` +
        `❌ Ошибок: ${failed}\n` +
        `👥 Всего: ${users.length}`,
      { parse_mode: "HTML" }
    );
  }
}