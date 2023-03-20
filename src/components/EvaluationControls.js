import { html } from "htm/preact";

import {
  graph,
  modulesState,
  entrypointModule,
  currentEvaluation,
  computeModulesState,
  currentBreakpoint,
  stale,
} from "../state.js";
import Evaluate from "../utils/ecma262/evaluation.js";
import { NC, AC } from "../utils/ecma262/spec-utils.js";

export default function EvaluationControls() {
  let controls = [];
  if (currentEvaluation.value) {
    if (currentBreakpoint.isPromiseJob.value) {
      controls.push(
        html`<button key="0" onclick=${stepIn}>Run promise job</button>`
      );
    } else {
      controls.push(
        html`<button key="1" onclick=${stepIn}>Step in</button>`,
        html`<button key="2" onclick=${stepOver}>Step over</button>`,
        html`<button key="3" onclick=${stepOut}>Step out</button>`,
        html`<button key="4" onclick=${stepBack} disabled=${stale}>
          Step back
        </button>`
      );
    }
  }

  const staleWarning =
    "The current evaluation might not reflect the updated graph.";

  return html`
    <div class="evaluation-controls">
      <button onclick=${loadEvaluation}>
        ${currentEvaluation.value ? "Reload" : "Load"}
      </button>
      ${controls}
      ${stale.value
        ? html`<br /><span class="warning">${staleWarning}</span>`
        : null}
      <${PausedStatus} />
    </div>
  `;
}

export function PausedStatus() {
  currentEvaluation.value;
  if (!currentBreakpoint.paused.value) return null;
  const serializedScope = Object.entries(currentBreakpoint.scope.value)
    .map(([name, value]) => `- ${name}: ${inspectValue(value)}`)
    .join("\n");
  return html`
    <div class="paused-status">
      ${currentBreakpoint.isPromiseJob.value
        ? html`<p>Paused before the next promise job.</p>`
        : html`
            <p>
              Paused at step ${currentBreakpoint.step} of${" "}
              ${currentBreakpoint.AO}.
            </p>
            <pre>${serializedScope}</pre>
          `}
    </div>
  `;
}

function stepIn() {
  const res = currentEvaluation.value.next();
  currentBreakpoint.count++;
  updateBreakpointState(res);
}

function stepOver() {
  let res;
  do {
    res = currentEvaluation.value.next();
    currentBreakpoint.count++;
  } while (
    !res.done &&
    currentBreakpoint.stackDepth.value < res.value.stackDepth
  );
  updateBreakpointState(res);
}

function stepOut() {
  let res;
  do {
    res = currentEvaluation.value.next();
    currentBreakpoint.count++;
  } while (
    !res.done &&
    currentBreakpoint.stackDepth.value <= res.value.stackDepth
  );
  updateBreakpointState(res);
}

function stepBack() {
  const prevCount = currentBreakpoint.count - 1;
  loadEvaluation();
  while (currentBreakpoint.count < prevCount) stepIn();
}

function updateBreakpointState({ done, value }) {
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
      return `ThrowCompletion(${inspectValue(arg.value)})`;
    }
    if (arg.name) return arg.name;
    if (Array.isArray(arg))
      return "« " + arg.map(inspectValue).join(", ") + " »";
  }
  return JSON.stringify(arg);
}

function loadEvaluation() {
  modulesState.value = computeModulesState();
  currentEvaluation.value = Evaluate(
    entrypointModule.value,
    graph.value.asyncModules,
    graph.value.failingModules
  );
  stale.value = false;
  currentBreakpoint.count = 0;
  stepIn();
}
