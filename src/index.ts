import "dotenv/config";
import { commands } from "./config";
import { hydrate } from "@grammyjs/hydrate";
import { initialSession } from "./shared/session";
import { mainMenu } from "./handlers/menu/mainMenu";
import { setDidBlock } from "./services/userService";
import { freeStorage } from "@grammyjs/storage-free";
import { callbackHandler } from "./handlers/callback";
import { adminMenu } from "./handlers/menu/adminMenu";
import { initializeDatabase } from "./database/client";
import { MyContext, MyConversationContext, SessionData } from "./types";
import { conversations, createConversation } from "@grammyjs/conversations";
import { Bot, GrammyError, HttpError, NextFunction, session } from "grammy";
import { checkSubscriptionChannel } from "./middleware/checkSubscriptionChannel";
import { broadcastConversation } from "./handlers/conversation/broadcastConversation";
import {
  createPlanConversation,
  editPlanConversation,
} from "./handlers/conversation/planConversations";
import { promoCodeConversation } from "./handlers/conversation/promoCodeConversation";
import argon2 from "argon2";

async function main() {
  await initializeDatabase();

  const bot = new Bot<MyContext>(process.env.BOT_TOKEN as string);

  bot.api.setMyCommands(commands.filter((command) => !command.auth));

  bot.use(
    session({
      initial: initialSession,
      // @ts-ignore – freeStorage readAllKeys() signature differs from StorageAdapter
      storage: freeStorage<SessionData>(bot.token),
    }),
  );

  bot.use(
    conversations<MyContext, MyConversationContext>({ plugins: [hydrate()] }),
  );

  bot.use(createConversation(editPlanConversation));
  bot.use(createConversation(broadcastConversation));
  bot.use(createConversation(createPlanConversation));
  bot.use(createConversation(promoCodeConversation));

  bot.use(mainMenu);
  bot.use(adminMenu);

  bot.on("callback_query", callbackHandler);

  commands.forEach((command) => {
    bot.command(command.command, (ctx: MyContext, next: NextFunction) => {
      ctx.conversation.exitAll();
      return next();
    });
  });

  commands
    .filter((command) => !command.auth)
    .forEach((command) => {
      bot.command(command.command, checkSubscriptionChannel, command.action);
    });

  commands
    .filter((command) => command.auth)
    .forEach((command) => {
      bot.command(
        command.command,
        async (ctx: MyContext, next: NextFunction) => {
          if (
            await argon2.verify(
              process.env.ADMIN_PASSWORD as string,
              ctx.match as string,
            )
          ) {
            return next();
          }
        },
        command.action,
      );
    });

  bot.chatType("private").on("my_chat_member", async (ctx) => {
    try {
      const status = ctx.myChatMember?.new_chat_member?.status;
      const userId = ctx.from?.id;

      if (!userId) return;

      if (status === "kicked") {
        console.log(`🚫 User ${userId} blocked the bot`);
        await setDidBlock(userId, true);
      } else if (status === "member") {
        console.log(`✅ User ${userId} unblocked the bot`);
        await setDidBlock(userId, false);
      }
    } catch (err) {
      console.log("Ошибка в my_chat_member", err);
      throw err;
    }
  });

  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });

  bot.start();
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
