import { SlashCommand } from "../command.js";

export default class Ping extends SlashCommand {
	override info: SlashCommand.Info = {
		name: "ping",
		description: "Check if the bot is alive"
	};

	override async run(interaction: SlashCommand.Interaction) {
		let ms = Date.now();
		await interaction.reply({ content: "Pong!", ephemeral: true });
		ms = Date.now() - ms;
		return interaction.editReply(`Pong!\nResponse: \`${ms}ms\`\nWebsocket: \`${this.bot.ws.ping}ms\``);
	}
}
