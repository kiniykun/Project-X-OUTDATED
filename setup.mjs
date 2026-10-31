// Rebuilds folders from flat file names: "site__css__style.css" -> "site/css/style.css"
import fs from "node:fs";
import path from "node:path";
for (const name of fs.readdirSync(".")) {
	if (!name.includes("__") || !fs.statSync(name).isFile()) continue;
	const dest = name.split("__").join("/");
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.renameSync(name, dest);
}
