import "dotenv/config";
import "./logging.js";

import { Bot } from "./bot.js";

const bot = new Bot({
	intents: ["GUILDS"],

	// don't mention roles, @everyone, or @here unless explicitly specified
	allowedMentions: { parse: ["users"] }
});

bot
	.on("error", console.error)
	.on("warn", console.warn)
	.on("debug", console.debug)
	.on("ready", () => console.info("ready"))
	.on("command", (command, interaction) => {
		console.info("command used: %s", command.info.name);
		console.group();
		console.log("by: %s (%s)", interaction.user.tag, interaction.user.id);

		const channel = interaction.channel;
		if (channel) {
			if (channel.type === "DM") console.log("in: DM (%s)", channel.id);
			else console.log("channel: #%s (%s)", channel.name, channel.id);
		}

		const guild = interaction.guild;
		if (guild) console.log("guild: %s (%s, %d members)", guild.name, guild.id, guild.memberCount);
	});

await bot.login();
