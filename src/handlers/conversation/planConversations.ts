import { MyConversation, MyConversationContext } from "../../types";
import { createPlan, updatePlan } from "../../services/planService";

export async function createPlanConversation(
  conversation: MyConversation,
  ctx: MyConversationContext,
) {
  await ctx.reply("Введите название тарифа:");
  const nameMsg = await conversation.waitFor("message:text");
  const name = nameMsg.message.text;

  await ctx.reply("Введите количество дней:");
  const daysMsg = await conversation.waitFor("message:text");
  const durationDays = parseInt(daysMsg.message.text);

  if (isNaN(durationDays)) {
    await ctx.reply("❌ Неверный формат дней. Отмена.");
    return;
  }

  await ctx.reply("Введите цену (в рублях):");
  const priceMsg = await conversation.waitFor("message:text");
  const price = parseInt(priceMsg.message.text);

  if (isNaN(price)) {
    await ctx.reply("❌ Неверный формат цены. Отмена.");
    return;
  }

  await createPlan(name, durationDays, price);
  await ctx.reply(
    `✅ Тариф <b>${name}</b> создан!\n\n📅 ${durationDays} дней — ${price}₽`,
    {
      parse_mode: "HTML",
    },
  );
}

export async function editPlanConversation(
  conversation: MyConversation,
  ctx: MyConversationContext,
) {
  const planId = await conversation.external((ctx) => ctx.session.editingPlanId)
  if (!planId) return;

  await ctx.reply("Что хотите изменить?\n\n1 — Название\n2 — Дни\n3 — Цену");
  const choiceMsg = await conversation.waitFor("message:text");

  switch (choiceMsg.message.text) {
    case "1": {
      await ctx.reply("Введите новое название:");
      const msg = await conversation.waitFor("message:text");
      await updatePlan(planId, { name: msg.message.text });
      await ctx.reply("✅ Название обновлено!");
      break;
    }
    case "2": {
      await ctx.reply("Введите новое количество дней:");
      const msg = await conversation.waitFor("message:text");
      const days = parseInt(msg.message.text);
      if (isNaN(days)) {
        await ctx.reply("❌ Неверный формат.");
        return;
      }
      await updatePlan(planId, { durationDays: days });
      await ctx.reply("✅ Дни обновлены!");
      break;
    }
    case "3": {
      await ctx.reply("Введите новую цену:");
      const msg = await conversation.waitFor("message:text");
      const price = parseInt(msg.message.text);
      if (isNaN(price)) {
        await ctx.reply("❌ Неверный формат.");
        return;
      }
      await updatePlan(planId, { price });
      await ctx.reply("✅ Цена обновлена!");
      break;
    }
    default:
      await ctx.reply("❌ Неверный выбор. Отмена.");
  }
}