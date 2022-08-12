# HatTip + HTMX + Preact Static SSR

This is a simple example of using HatTip with [HTMX](https://htmx.org/). It's also using [Preact](https://preactjs.com/) but only for rendering JSX to static HTML on the server, the only client-side JavaScript is HTMX.

[Live demo on Cloudflare Workers](https://hattip-htmx.rakkasjs.workers.dev/)

## Try it out

Clone with:

```bash
npx degit hattipjs/hattip/examples/bare-bones/htmx
```

or use the live playgrounds:

- [CodeSandbox](https://codesandbox.io/s/github/hattipjs/hattip/tree/main/examples/bare-bones/htmx)
- [StackBlitz](https://stackblitz.com/github/hattipjs/hattip/tree/main/examples/bare-bones/htmx)

## Development

- Start a development Node.js server with `npm run dev`
- Build a Cloudflare Workers bundle with `npm run bundle:cfw`
- Test the bundle locally with `npx miniflare -p dist/cfw.js`
- Deploy the bundle to Cloudflare Workers with `npm run deploy:cfw`

HatTip also supports many other JavaScript runtimes (Vercel Edge and Serverless, Netlify Edge and Serverless, Deno, Bun etc.) so check out the respective bundlers and adapters in the [main readme](https://github.com/hattipjs/hattip#readme).
