import { html } from "htm/preact";

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
  return html`<td><code>${field.value}</code></td>`;
}

function StringField({ field, render }) {
  let { value } = field;
  if (render && value !== undefined) value = render(value);
  return html`<td>${value}</td>`;
}

function BooleanField({ field }) {
  return html`<td><strong>${field.value ? "true" : "false"}</strong></td>`;
}

function ListField({ field, render }) {
  return html`<td>« ${field.value.map(render).join(", ")} »</td>`;
}
