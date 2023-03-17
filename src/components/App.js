import { html } from "htm/preact";

import GraphInput from "./GraphInput.js";
import ModulesFields from "./ModulesFields.js";
import EvaluationControls from "./EvaluationControls.js";
import Graph from "./Graph.js";

export default function App() {
  return html`
    <${GraphInput} />
    <div class="graph-container">
      <${Graph} />
    </div>
    <${EvaluationControls} />
    <${ModulesFields} />
  `;
}
