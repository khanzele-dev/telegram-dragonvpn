import { admin, start } from "../handlers/commands";
import { ICommand } from "../types";

export const commands: ICommand[] = [
  {
    command: "start",
    description: "Главное меню",
    action: start,
    auth: false,
  },
  {
    command: "admin",
    description: "Админ-панель",
    action: admin,
    auth: true,
  },
];
