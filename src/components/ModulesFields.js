import { html } from "htm/preact";
import { useLayoutEffect, useRef } from "preact/hooks";

import { modulesState } from "../state.js";

export default function ModulesFields() {
  return html`<table class="modules-fields">
    <thead>
      <tr>
        <th>Name</th>
        <th>[[Status]]</th>
        <th>[[DFSIndex]]</th>
        <th>[[DFSAncestorIndex]]</th>
        <th>[[CycleRoot]]</th>
        <th>[[HasTLA]]</th>
        <th>[[AsyncEvaluation]]</th>
        <th>[[AsyncParentModules]]</th>
        <th>[[PendingAsyncDependencies]]</th>
        <th>[[EvaluationError]]</th>
      </tr>
    </thead>
    ${modulesState.value.map(
      ({ name, fields }, i) =>
        html`<${SingleModuleFields} name=${name} fields=${fields} />`
    )}
  </table>`;
}

function SingleModuleFields({ name, fields }) {
  return html`
    <tr>
      <th>${name}</th>
      <${EnumField} field=${fields.Status} />
      <${StringField} field=${fields.DFSIndex} />
      <${StringField} field=${fields.DFSAncestorIndex} />
      <${StringField} field=${fields.CycleRoot} render=${getName} />
      <${BooleanField} field=${fields.HasTLA} />
      <${BooleanField} field=${fields.AsyncEvaluation} />
      <${ListField} field=${fields.AsyncParentModules} render=${getName} />
      <${StringField} field=${fields.PendingAsyncDependencies} />
      <${StringField} field=${fields.EvaluationError} />
    </tr>
  `;
}

function getName(module) {
  return module.name;
}

function EnumField({ field }) {
  const ref = useUpdatesHighglighting();
  return html`<td ref=${ref}><code>${field.value}</code></td>`;
}

function StringField({ field, render }) {
  let { value } = field;
  if (render && value !== undefined) value = render(value);

  const ref = useUpdatesHighglighting();
  return html`<td ref=${ref}>${value}</td>`;
}

function BooleanField({ field }) {
  const ref = useUpdatesHighglighting();
  return html`<td ref=${ref}>
    <strong>${field.value ? "true" : "false"}</strong>
  </td>`;
}

function ListField({ field, render }) {
  const ref = useUpdatesHighglighting();
  return html`<td ref=${ref}>« ${field.value.map(render).join(", ")} »</td>`;
}

function useUpdatesHighglighting() {
  const ref = useRef();
  useLayoutEffect(() => {
    ref.current.classList.add("highlight");
    let timeout = setTimeout(
      () => ref.current.classList.remove("highlight"),
      250
    );
    return () => clearTimeout(timeout);
  });
  return ref;
}
