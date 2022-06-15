import { SlashCommand } from "../command.js";
import util from "node:util";

export default class Eval extends SlashCommand {
	override devGuildOnly = true;

	override info: SlashCommand.Info = {
		name: "eval",
		description: "Evaluate code (bot owners only)",
		options: [{
			name: "code",
			description: "The code to evaluate",
			type: "STRING",
			required: true
		}]
	};

	override async run(interaction: SlashCommand.Interaction) {
		if (!this.bot.owners.has(interaction.user.id))
			return interaction.reply({
				content: "You don't have permission to use this.",
				ephemeral: true
			});

		await interaction.deferReply({ ephemeral: true });
		const code = interaction.options.getString("code", true);

		let result;
		const context = {
			bot: this.bot,
			channel: interaction.channel,
			guild: interaction.guild,
			user: interaction.user,
			member: interaction.member,
			notify: false
		};

		try {
			// HACK: very cursed way to eval with async/await
			const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
			const runCode = new AsyncFunction(code);
			result = await runCode.call(context);
		} catch (err) {
			result = err;
		}

		let resultString = typeof result === "string" ? result
			: result instanceof Error ? `${result.message}${result.stack ? `\n\n${result.stack}` : ""}`
			: util.inspect(result, { depth: 0 });

		resultString = resultString
			.replaceAll("```", "`\u200B`\u200B`")
			.replaceAll(this.bot.token, "");

		if (resultString.length <= 1992)
			await interaction.editReply(`\`\`\`\n${resultString}\n\`\`\``);
		else await interaction.editReply({
			files: [{
				name: "result.txt",
				attachment: Buffer.from(resultString)
			}]
		});

		if (context.notify) await interaction.followUp({
			content: `Finished. ${interaction.user}`,
			ephemeral: true
		});
	}
}
