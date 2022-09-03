/// <reference types="vite/client" />

import { createRouter } from "@hattip/router";
import { renderPage } from "vite-plugin-ssr";

const app = createRouter();

app.use(async (ctx) => {
  const parsedUrl = new URL(ctx.request.url);
  const url = parsedUrl.pathname + parsedUrl.search;
  const pageContext = await renderPage({ urlOriginal: url });
  const { httpResponse } = pageContext;

  if (httpResponse) {
    return new Response(httpResponse.body, {
      status: httpResponse.statusCode,
      headers: {
        "Content-Type": httpResponse.contentType,
      },
    });
  }
});

export default app.buildHandler();
