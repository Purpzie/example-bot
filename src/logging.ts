import chalk from "chalk";
import { Console } from "console";

const TRACE = chalk.magentaBright.bold("TRACE ")
const DEBUG = chalk.blueBright.bold("DEBUG ")
const INFO = chalk.greenBright.bold("INFO ");
const WARN = chalk.yellowBright.bold("WARN ");
const ERROR = chalk.redBright.bold("ERROR ");

const stdout = process.stdout;
const stderr = process.stderr;

class ColorConsole extends Console {
	override trace(...args: Parameters<Console["trace"]>) {
		stderr.write(TRACE);
		super.trace(...args);
	}

	override debug(...args: Parameters<Console["debug"]>) {
		stdout.write(DEBUG);
		super.debug(...args);
	}

	override info(...args: Parameters<Console["info"]>) {
		stdout.write(INFO);
		super.info(...args);
	}

	override warn(...args: Parameters<Console["warn"]>) {
		stderr.write(WARN);
		super.warn(...args);
	}

	override error(...args: Parameters<Console["error"]>) {
		stderr.write(ERROR);
		super.error(...args);
	}
}

console = new ColorConsole(stdout, stderr);
