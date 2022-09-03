# HatTip CLI

Command-line tool for HatTip. Zero-config by default.

HatTip CLI is a command-line program for developing and building HatTip applications. It's a wrapper around [Vite](https://vitejs.dev) using [`vavite`](https://github.com/cyco130/vavite) so it accepts most of the same command line options and the same config files. It can handle TypeScript, JSX, CSS, and more out of the box, and can be extended via the rich Vite plugin ecosystem. It can also serve/build client-side assets for seamless full-stack development.

For development, HatTip CLI runs your application on Node. You can start a development server by running `hattip server` on your project root. `hattip dev` and just `hattip` are aliases for this command. It expects three entry points, two of which are optional:

```bash
# Development server
hattip serve hattip-entry.js --node node-entry.js --client client-entry.js
# Build
hattip build hattip-entry.js --node node-entry.js --client client-entry.js
```

### HatTip entry

The **HatTip entry** is the entry point for your HatTip application. It is expected to default export a HatTip handler, for example:

```js
import { createRouter } from "@hattip/router";

const app = createRouter();

app.get("/", () => new Response("Hello world!"));

export default app.buildHandler();
```

This entry point is required but you don't have to specify it explicitly. If you don't, HatTip CLI will scan the project root and the `src` directory for several file names like `entry-hattip`, `server`, `entry-server`, `entry.hattip`, `entry.server`, `index`, `index.hattip`, and `index.server` with the following extensions: `.ts`, `.tsx`, `.mts`, `.mjs`, `.js`, `.jsx`.

### Node entry

Optionally, you can specify a **Node entry**. It is expected to import the HatTip handler from the HatTip entry, turn it into a Node handler using `createMiddleware` from the `@hattip/adapter-node` package and export it as the default export.

If not explicitly specified, HatTip CLI will look for a file named `entry-node`, `entry.node`, `index.node` with `.ts`, `.tsx`, `.mts`, `.mjs`, `.js`, `.jsx` extension in the project root and `src` directory. If not found, it will use the following default:

```js
import handler from "<Name of your HatTip entry file>";
import { createMiddleware } from "@hattip/adapter-node";
export default createMiddleware(handler);
```

You can use this entry to integrate with Express or other Connect-compatible Node frameworks:

```js
import { createMiddleware } from "rakkasjs/node-adapter";
import hattipHandler from "<Name of your HatTip entry file>";
import express from "express";

const app = express();

// Here you can add Express routes and middleware
// app.get(...);
// app.use(...);

// Use the HatTip handler
app.use(createMiddleware(hattipHandler));

// An Express app is actually a request handler function
// so we can simply default export it:
export default app;
```

### Client entries

You can provide one or more client entry points with the `--client` (`-C` for short) CLI option. Multiple entries can be specified by using the option multiple times (`hattip serve -C entry-1.js -C entry-2.js`). If you don't provide any, HatTip CLI will not build or serve client-side assets.

## Credits

- Parts of the CLI are based on [Vite CLI](https://github.com/vitejs/vite/tree/main/packages/vite) by Yuxi (Evan) You and Vite contributors, used under [MIT License](./vite-license.md). They are not affiliated with this project.

```

```
