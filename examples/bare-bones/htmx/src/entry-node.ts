import { createServer } from "@hattip/adapter-node";
import handler from "./app";

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

createServer(handler).listen(
  {
    host,
    port,
  },
  () => {
    console.log(
      `Server listening on http://${host}:${port} (press Ctrl+C to quit)`,
    );
  },
);
