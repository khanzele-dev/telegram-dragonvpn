import { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import { HydrateFlavor } from "@grammyjs/hydrate";
import { MenuFlavor } from "@grammyjs/menu";
import { Context, SessionFlavor } from "grammy";
import { BotCommand } from "grammy/types";
import { Plan } from "../../generated/prisma";

export interface SessionData {
  editingPlanId?: string;
  editingPlan?: Plan;
}

export interface ICommand extends BotCommand {
  auth: boolean;
  action: (ctx: MyContext) => Promise<void>;
}

export type MyContext = ConversationFlavor<
  Context & HydrateFlavor<Context> & MenuFlavor & SessionFlavor<SessionData>
>;

export type MyConversationContext = HydrateFlavor<
  Context & MenuFlavor & SessionFlavor<SessionData>
>;

export type MyConversation = Conversation<MyContext, MyConversationContext>;
