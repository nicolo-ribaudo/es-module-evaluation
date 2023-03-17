import { html } from "htm/preact";

import {
  inputStructure as structure,
  inputConnections as connections,
  inputAsync as asyncModules,
  inputFailing as failingModules,
} from "../state.js";

export default function GraphInput() {
  return html`
    <div class="graph-input">
      <div>
        <label for="input-structure">Module structure</label>
        <span
          >Names of the modules in this graph, aligned using spaces in the
          position they should appear in the generated image.</span
        >
      </div>
      <${Textarea} id="input-structure" signal=${structure} rows="4" />

      <div>
        <label for="input-connections">Module connections</label>
        <span
          >Dependencies between modules, where "<code>A -> B</code>" means "A
          imports B". One per line.</span
        >
      </div>
      <${Textarea} id="input-connections" signal=${connections} rows="8" />

      <div>
        <label for="input-async-modules">Async modules</label>
        <span
          >Modules that use top-level await, thuse whose execution always
          completes asynchronously, in fulfillment order.</span
        >
      </div>
      <${Textarea} id="input-async-modules" signal=${asyncModules} rows="2" />

      <div>
        <label for="input-failing-modules">Failing modules</label>
        <span
          >Modules that fail executing, either with a throw completion (if
          synchronous) or with a rejected promise (if asynchronous).</span
        >
      </div>
      <${Textarea}
        id="input-failing-modules"
        signal=${failingModules}
        rows="2"
      />
    </div>
  `;
}

function Textarea({ signal, rows }) {
  const onInput = (e) => {
    signal.value = e.target.value;
  };
  return html`
    <textarea class="input" onInput=${onInput} rows=${rows}>${signal}</textarea>
  `;
}
