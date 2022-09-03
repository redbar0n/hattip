// @ts-check
import bunAdapter from "@hattip/adapter-bun";
import handler from "./entry-hattip";
import url from "url";
import path from "path";

const dir = path.resolve(
  path.dirname(url.fileURLToPath(new URL(import.meta.url))),
  "../client",
);

export default bunAdapter(handler, { staticDir: dir });
