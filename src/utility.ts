import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const devMode = process.env.BOT_DEV?.toLowerCase();
/** Whether development mode is enabled. */
export const DEV_MODE = devMode === "1" || devMode === "true";

/** Import all `.js` files at the top level of the provided directory. */
export async function importAll(dir: string | URL): Promise<{ [name: string]: any }> {
	dir = path.resolve(dir instanceof URL ? url.fileURLToPath(dir) : dir);
	if (!(await fs.stat(dir)).isDirectory()) throw new Error("expected a directory");

	const result = Object.create(null);
	for (const file of await fs.readdir(dir, { withFileTypes: true })) {
		if (file.isDirectory() || path.extname(file.name) !== ".js") continue;
		const filename = path.basename(file.name, ".js");
		result[filename] = await import(path.join(dir, file.name).toString());
	}

	return result;
}
