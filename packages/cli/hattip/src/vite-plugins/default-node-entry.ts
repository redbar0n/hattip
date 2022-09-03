import { Plugin } from "vite";
import path from "path";
import fs from "fs";

interface DefaultNodeEntryOptions {
  hattipEntry?: string;
}

export function defaultNodeEntry(options: DefaultNodeEntryOptions): Plugin {
  let root: string;
  let hattipEntry = options.hattipEntry;

  return {
    name: "hattip:default-node-entry",

    enforce: "pre",

    config(config) {
      root = config.root ?? process.cwd();
    },

    async resolveId(source, importer, options) {
      if (!options.ssr || source !== "virtual:hattip:default-node-entry") {
        return;
      }

      const entry = await findNodeEntry(root);
      if (entry) {
        const resolved = await this.resolve(entry, importer, {
          ...options,
          skipSelf: true,
        });

        if (resolved) return resolved;
      }

      hattipEntry = hattipEntry ?? (await findHattipEntry(root));

      return "virtual:hattip:default-node-entry";
    },

    async load(id) {
      if (id === "virtual:hattip:default-node-entry") {
        return makeDefaultNodeEntry(hattipEntry);
      }
    },
  };
}

function makeDefaultNodeEntry(hattipEntry: string | undefined) {
  if (!hattipEntry) {
    throw new Error("No hattip entry found");
  }

  return `
    import handler from ${JSON.stringify(hattipEntry)};
    import { createMiddleware } from "@hattip/adapter-node";
    export default createMiddleware(handler);
  `;
}

function findNodeEntry(root: string): string | undefined {
  const dirs = ["", "src"];
  const names = ["entry-node", "index.node"];
  const extensions = [".ts", ".tsx", ".mts", ".mjs", ".js", ".jsx"];

  for (const dir of dirs) {
    for (const name of names) {
      for (const ext of extensions) {
        const file = path.join(root, dir, name + ext);
        if (fs.existsSync(file)) {
          return file;
        }
      }
    }
  }
}

async function findHattipEntry(root: string): Promise<string | undefined> {
  const dirs = ["", "src"];
  const names = [
    "entry-hattip",
    "server",
    "entry-server",
    "entry.hattip",
    "entry.server",
    "index",
    "index.hattip",
    "index.server",
  ];
  const extensions = [".ts", ".tsx", ".mts", ".mjs", ".js", ".jsx"];

  for (const dir of dirs) {
    for (const name of names) {
      for (const ext of extensions) {
        const file = path.join(root, dir, name + ext);
        if (fs.existsSync(file)) {
          return file;
        }
      }
    }
  }
}
