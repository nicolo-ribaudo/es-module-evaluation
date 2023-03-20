import { signal, computed, effect } from "@preact/signals";
import { beforePromiseJob } from "./utils/ecma262/breakpoints.js";
import { buildModulesGraph } from "./utils/graph.js";

const initialParams = new URLSearchParams(window.location.hash.slice(1));
function paramOr(name) {
  return ([defaultValue]) => {
    if (initialParams.has(name)) {
      return atob(initialParams.get(name));
    }
    return defaultValue;
  };
}

export const inputStructure = signal(paramOr("s")`\
 A
B C
 D
`);
export const inputConnections = signal(paramOr("c")`\
A -> B
B -> C
B -> D
C -> A
C -> D
`);
export const inputAsync = signal(paramOr("a")`\
D
`);
export const inputFailing = signal(paramOr("f")`\
`);

effect(() => {
  const params = new URLSearchParams();
  params.set("s", btoa(inputStructure.value));
  params.set("c", btoa(inputConnections.value));
  params.set("a", btoa(inputAsync.value));
  params.set("f", btoa(inputFailing.value));
  window.location.hash = params.toString();
});

let prevGraph;
export const graph = computed(() => {
  try {
    prevGraph = buildModulesGraph(
      inputStructure.value,
      inputConnections.value,
      inputAsync.value,
      inputFailing.value
    );
    if (currentEvaluation.peek() !== undefined) stale.value = true;
  } catch {
    console.log("fallback");
  }
  return prevGraph;
});

export const stale = signal(false);

export const modulesState = signal(computeModulesState());

export const entrypointModule = computed(() =>
  modulesState.value.find((m) => m.name === "A")
);

export const currentEvaluation = signal(undefined);

export const currentBreakpoint = {
  paused: signal(false),
  AO: signal(undefined),
  step: signal(undefined),
  scope: signal({}),
  stackDepth: signal(undefined),
  isPromiseJob: null,
};
currentBreakpoint.isPromiseJob = computed(
  () => currentBreakpoint.AO.value === beforePromiseJob
);

export function computeModulesState() {
  const modules = graph.value.nodes.map((node) => ({
    name: node.name,
    dependencies: [],
    fields: {
      Status: signal("linked"),
      EvaluationError: signal(undefined),
      DFSIndex: signal(undefined),
      DFSAncestorIndex: signal(undefined),
      CycleRoot: signal(undefined),
      HasTLA: signal(false),
      AsyncEvaluation: signal(false),
      AsyncParentModules: signal([]),
      PendingAsyncDependencies: signal(undefined),
    },
  }));

  const modulesMap = new Map(modules.map((mod) => [mod.name, mod]));
  for (const { from, to } of graph.value.edges) {
    modulesMap.get(from).dependencies.push(modulesMap.get(to));
  }

  for (const name of graph.value.asyncModules) {
    modulesMap.get(name).fields.HasTLA.value = true;
  }

  return modules;
}
