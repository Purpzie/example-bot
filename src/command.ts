import { Bot } from "./bot.js";
import {
	ApplicationCommandData,
	AutocompleteInteraction,
	BaseCommandInteraction,
	ChatInputApplicationCommandData,
	CommandInteraction,
	MessageApplicationCommandData,
	MessageContextMenuInteraction,
	UserApplicationCommandData,
	UserContextMenuInteraction
} from "discord.js";

export abstract class BotCommand<
	T extends ApplicationCommandData = ApplicationCommandData,
	U extends BaseCommandInteraction = BaseCommandInteraction
> {
	/** The bot this command belongs to. */
	readonly bot!: Bot<true>;

	/** The information sent to Discord about this command. */
	abstract info: T;

	/** Whether this command should only appear in the developer server. */
	devGuildOnly = false;

	constructor(client: Bot<true>) {
		Object.defineProperty(this, "client", { value: client });
	}

	/** Called when this command is run. */
	abstract run(interaction: U): Promise<unknown>;

	/** Called when this command's autocomplete is run. */
	autocomplete(_interaction: AutocompleteInteraction): Promise<unknown> {
		return Promise.resolve();
	}
}

export abstract class SlashCommand extends BotCommand<
	SlashCommand.Info,
	SlashCommand.Interaction
> {}
export namespace SlashCommand {
	export type Info = ChatInputApplicationCommandData;
	export type Interaction = CommandInteraction;
}

export abstract class UserMenuCommand extends BotCommand<
	UserMenuCommand.Info,
	UserMenuCommand.Interaction
> {}
export namespace UserMenuCommand {
	export type Info = UserApplicationCommandData;
	export type Interaction = UserContextMenuInteraction;
}

export abstract class MessageMenuCommand extends BotCommand<
	MessageMenuCommand.Info,
	MessageMenuCommand.Interaction
> {}
export namespace MessageMenuCommand {
	export type Info = MessageApplicationCommandData;
	export type Interaction = MessageContextMenuInteraction;
}
