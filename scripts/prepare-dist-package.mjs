import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(rootDir, "..");
const distDir = path.join(repoRoot, "dist");
const rootPackagePath = path.join(repoRoot, "package.json");
const rootPackage = JSON.parse(await readFile(rootPackagePath, "utf8"));

const publishPackage = {
    name: rootPackage.name,
    version: rootPackage.version,
    description: rootPackage.description,
    repository: rootPackage.repository,
    license: rootPackage.license,
    type: "module",
    main: "./index.js",
    types: "./index.d.ts",
    exports: {
        ".": {
            types: "./index.d.ts",
            import: "./index.js",
        },
        "./rehype": {
            types: "./rehype.d.ts",
            import: "./rehype.js",
        },
        "./styles/tokens.css": "./styles/tokens.css",
        "./styles/core.css": "./styles/core.css",
        "./styles/grid.css": "./styles/grid.css",
        "./styles/presets/site.css": "./styles/presets/site.css",
        "./styles/presets/helvetica.css": "./styles/presets/helvetica.css",
    },
    files: [
        "index.js",
        "index.d.ts",
        "rehype.js",
        "rehype.d.ts",
        "styles",
        "README.md",
        "LICENSE",
        "CHANGELOG.md",
    ],
    publishConfig: rootPackage.publishConfig,
    peerDependencies: rootPackage.peerDependencies,
    engines: rootPackage.engines,
};

await mkdir(distDir, { recursive: true });
await writeFile(path.join(distDir, "package.json"), `${JSON.stringify(publishPackage, null, 4)}\n`);

for (const filename of ["README.md", "LICENSE", "CHANGELOG.md"]) {
    await copyFile(path.join(repoRoot, filename), path.join(distDir, filename));
}
