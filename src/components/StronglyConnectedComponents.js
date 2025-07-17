import { html } from "htm/preact";

import { stronglyConnectedComponents } from "../state.js";

export default function StronglyConnectedComponents() {
  let sccs;
  if (stronglyConnectedComponents.value.length === 0) {
    sccs = html`<i>None detected yet.</i>`;
  } else {
    sccs = html`
      <ul>
        ${stronglyConnectedComponents.value.map(
          (scc, index) => html`<li key=${index}>${scc.join(", ")}</li>`
        )}
      </ul>
    `;
  }

  return html`
    <div class="strongly-connected-components">
      <h2>SCCs:</h2>
      ${sccs}
    </div>
  `;
}
