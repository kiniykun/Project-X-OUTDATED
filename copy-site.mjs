// Copies the Project X site (site/) into the build output (dist/) after Vite builds the proxy pages.
import fs from "node:fs";
fs.cpSync("site", "dist", { recursive: true });
console.log("Project X copied into dist/");
