import { hx, hxDoc } from "./app";
import { h } from "preact";

export function get() {
  return hxDoc(
    <html>
      <head>
        <script src="https://unpkg.com/htmx.org@1.8.0"></script>
        <title>Hello world!</title>
      </head>
      <body>
        <h1>Hello world!</h1>
        <button hx-post="/" hx-swap="outerHTML">
          Click to see HTMX in action
        </button>
      </body>
    </html>,
  );
}

export function post() {
  return hx(<p>HTMX works!</p>);
}
