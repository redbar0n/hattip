import { createRouter, RouteHandler } from "@hattip/router";
import { html } from "@hattip/response";
import { JSX } from "preact";
import render from "preact-render-to-string";

const app = createRouter();

type RouteModule = Record<string, RouteHandler | undefined>;

function route(path: string, importer: () => Promise<RouteModule>): void {
  app.use<any>(path, async (ctx) => {
    const module = await importer();
    let method = ctx.method.toLowerCase();
    if (method === "delete") {
      method = "del";
    }
    const handler = module[method];
    return handler?.(ctx);
  });
}

export function hxDoc(elements: JSX.Element) {
  const doc = render(elements);
  return html("<!DOCTYPE html>\n" + doc);
}

export function hx(elements: JSX.Element) {
  return html(render(elements));
}

route("/", () => import("./index.page"));

export default app.buildHandler();
