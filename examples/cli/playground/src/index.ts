import { createRouter } from "@hattip/router";

const app = createRouter();

app.get("/", () => new Response("Hello world!"));

export default app.buildHandler();
