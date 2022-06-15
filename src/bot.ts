import { BotCommand } from "./command.js";
import { DEV_MODE, importAll } from "./utility.js";
import { Client } from "discord.js";
import events from "node:events";

// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces
declare module "discord.js" {
	export interface ClientEvents {
		command: [BotCommand, BaseCommandInteraction];
	}
}

export class Bot<Ready extends boolean = boolean> extends Client<Ready> {
	/** This bot's commands. */
	commands: { [name: string]: BotCommand } = Object.create(null);

	/** This bot's owner ids. */
	owners = new Set(process.env.BOT_OWNERS?.split(","));

	/** The id of this bot's development guild. */
	devGuildId: string;

	constructor(...args: ConstructorParameters<typeof Client>) {
		// HACK: force enable captureRejections even though we don't have access to it in super
		// see https://nodejs.org/docs/latest-v18.x/api/events.html#eventscapturerejections
		const oldCaptureRejections = events.captureRejections;
		events.captureRejections = true;
		super(...args);
		events.captureRejections = oldCaptureRejections;

		const tokenVar = DEV_MODE ? "BOT_TOKEN" : "BOT_DEV_TOKEN";
		const token = process.env[tokenVar];
		if (!token) throw new Error(`missing env var '${tokenVar}'`);
		// FIXME: change to 'this.token = token' without making typescript angry
		(this as Bot<false>).token = token;

		const guildId = process.env.BOT_DEV_GUILD;
		if (!guildId) throw new Error("missing env var 'BOT_DEV_GUILD'");
		this.devGuildId = guildId;

		this.once("ready", async () => {
			try {
				if (!this.isReady()) throw new Error("impossible"); // typechecking

				this.emit("debug", "importing command files");
				const commands = await importAll(new URL("./commands", import.meta.url));

				const globalCommands = [];
				const devGuildCommands = [];

				for (const [filename, exports] of Object.entries(commands)) {
					const Command = exports?.default;
					if (!(Command?.prototype instanceof BotCommand))
						throw new Error(`commands/${filename}.js: expected a default BotCommand export`);

					const cmd: BotCommand = new Command(this);
					if (cmd.info.name in this.commands)
						throw new Error(`commands/${filename}.js: command with name '${cmd.info.name}' already exists`);

					this.commands[cmd.info.name] = cmd;
					if (DEV_MODE || cmd.devGuildOnly) devGuildCommands.push(cmd.info);
					else globalCommands.push(cmd.info);
				}

				this.emit("debug", "syncing commands with discord");
				const devGuild = await this.guilds.fetch(this.devGuildId);
				await devGuild.commands.set(devGuildCommands);
				await this.application.commands.set(globalCommands);
			} catch (err) {
				this.destroy();
				throw err;
			}
		});

		this.on("interactionCreate", async interaction => {
			if (interaction.isAutocomplete()) {
				await this.commands[interaction.commandName]?.autocomplete(interaction);
			} else if (interaction.isApplicationCommand()) {
				const command = this.commands[interaction.commandName];
				if (!command) return;
				try {
					await command.run(interaction);
				} finally {
					this.emit("command", command, interaction);
				}
			}
		});
	}
}
