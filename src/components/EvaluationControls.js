import { html } from "htm/preact";

import {
  graph,
  modulesState,
  entrypointModule,
  currentEvaluation,
  computeModulesState,
  currentBreakpoint,
} from "../state.js";
import { Evaluate } from "../utils/ecma262/evaluation.js";
import { NC, AC } from "../utils/ecma262/spec-utils.js";

export default function EvaluationControls() {
  return html`
    <div class="evaluation-controls">
      <button onclick=${updateGraph}>
        ${currentEvaluation.value ? "Reload" : "Load"} modules graph
      </button>
      ${currentEvaluation.value
        ? html`<button onclick=${nextStep}>Step in</button>`
        : null}
      ${currentEvaluation.value
        ? html`<button onclick=${nextStepCurrentAO}>Step over</button>`
        : null}
      <${PausedStatus} />
    </div>
  `;
}

export function PausedStatus() {
  if (!currentBreakpoint.paused.value) return null;
  const serializedScope = Object.entries(currentBreakpoint.scope.value)
    .map(([name, value]) => `- ${name}: ${inspectValue(value)}`)
    .join("\n");
  return html`
    <div class="paused-status">
      <p>
        Paused at step ${currentBreakpoint.step} of${" "}
        ${currentBreakpoint.AO}.
      </p>
      <pre>${serializedScope}</pre>
    </div>
  `;
}

function nextStep() {
  const { done, value } = currentEvaluation.value.next();
  if (done) {
    currentEvaluation.value = null;
    currentBreakpoint.paused.value = false;
  } else {
    currentBreakpoint.paused.value = true;
    currentBreakpoint.AO.value = value.AO;
    currentBreakpoint.stackDepth.value = value.stackDepth;
    currentBreakpoint.step.value = value.step;
    currentBreakpoint.scope.value = value.scope;
  }
}

function nextStepCurrentAO() {
  let done, value;
  do {
    ({ done, value } = currentEvaluation.value.next());
  } while (!done && currentBreakpoint.stackDepth.value < value.stackDepth);
  if (done) {
    currentEvaluation.value = null;
    currentBreakpoint.paused.value = false;
  } else {
    currentBreakpoint.paused.value = true;
    currentBreakpoint.AO.value = value.AO;
    currentBreakpoint.stackDepth.value = value.stackDepth;
    currentBreakpoint.step.value = value.step;
    currentBreakpoint.scope.value = value.scope;
  }
}

function inspectValue(arg) {
  if (typeof arg === "object") {
    if (arg instanceof NC) {
      return `NormalCompletion(${inspectValue(arg.value)})`;
    }
    if (arg instanceof AC) {
      return `ThrowssCompletion(${inspectValue(arg.value)})`;
    }
    if (arg.name) return arg.name;
    if (Array.isArray(arg))
      return "« " + arg.map(inspectValue).join(", ") + " »";
  }
  return JSON.stringify(arg);
}

function updateGraph() {
  modulesState.value = computeModulesState();
  currentEvaluation.value = Evaluate(
    entrypointModule.value,
    graph.value.asyncModules,
    graph.value.failingModules
  );
  console.log(graph.value.failingModules);
}
