import { render } from "preact";
import { html } from "htm/preact";
import "preact/debug";

import App from "./components/App.js";

render(html`<${App} />`, document.getElementById("app"));
