import { Assert, AC, NC } from "./spec-utils.js";
import bp, { beforePromiseJob } from "./breakpoints.js";
import { AO } from "./stack-utils.js";

function g(module, fieldName) {
  return module.fields[fieldName].peek();
}
function s(module, fieldName, value) {
  module.fields[fieldName].value = value;
}

export default AO(function* (module, asyncResolutionOrder, failingModules) {
  const pendingPromiseJobs = new Map();

  yield* Evaluate(module, failingModules, pendingPromiseJobs);

  for (const name of asyncResolutionOrder) {
    if (!pendingPromiseJobs.has(name)) throw new Error("Deadlock");
    yield bp.RunPromiseJobs();
    if (failingModules.has(name)) {
      yield* pendingPromiseJobs.get(name).onRejected("Error in " + name);
      return;
    } else {
      yield* pendingPromiseJobs.get(name).onFulfilled();
    }
  }

  console.log("Done");
});

const Evaluate = AO(function* (module, failingModules, pendingPromiseJobs) {
  yield bp.Evaluate_1({ module });

  // This state is not explitly tracked in the modules evaluation
  // algorithm, but we need it to implement the correct semantics.
  const implicitState = {
    pendingPromiseJobs,
    asyncEvaluationFieldOrder: [],
    failingModules,
  };

  Assert(
    g(module, "Status") === "linked" ||
      g(module, "Status") === "async-subgraphs-evaluating-async" ||
      g(module, "Status") === "async-subgraphs-evaluated" ||
      g(module, "Status") === "evaluating-async" ||
      g(module, "Status") === "evaluated"
  );

  const stack = [];
  const result = yield* InnerModuleEvaluation(module, stack, 0, implicitState);

  yield bp.Evaluate_9({ module, result, stack });
  if (result instanceof AC) {
    for (const m of stack) {
      Assert(
        g(m, "Status") === "async-subgraphs-searching" ||
          g(m, "Status") === "evaluating"
      );
      s(m, "Status", "evaluated");
      s(m, "EvaluationError", result.value);
    }
    yield bp.Evaluate_9_b({ module, result, stack });
    Assert(g(module, "Status") === "evaluated");
    Assert(g(module, "EvaluationError") === result);
    // TODO: reject

    return;
  } else {
    Assert(
      g(module, "Status") === "evaluating-async" ||
        g(module, "Status") === "evaluated"
    );
    Assert(g(module, "EvaluationError") === undefined);
    if (g(module, "AsyncEvaluation") === false) {
      Assert(g(module, "Status") === "evaluated");
      // TODO: Resolve
    }
    Assert(stack.length === 0);
  }
});

const InnerModuleEvaluation = AO(function* (
  module,
  stack,
  index,
  implicitState
) {
  yield bp.InnerModuleEvaluation_2({ module, stack, index });
  if (
    g(module, "Status") === "evaluating-async" ||
    g(module, "Status") === "evaluated"
  ) {
    if (g(module, "Status") === "evaluated") s(module, "CycleRoot", module);
    if (g(module, "EvaluationError") === undefined) return NC(index);
    return AC(g(module, "EvaluationError"));
  }
  if (g(module, "Status") === "evaluating") {
    return NC(index);
  }

  Assert(
    g(module, "Status") === "linked" ||
      g(module, "Status") === "async-subgraphs-searching" ||
      g(module, "Status") === "async-subgraphs-evaluating-async" ||
      g(module, "Status") === "async-subgraphs-evaluated"
  );
  s(module, "Status", "evaluating");
  s(module, "DFSIndex", index);
  s(module, "DFSAncestorIndex", index);
  s(module, "PendingAsyncDependencies", 0);
  s(module, "AsyncEvaluation", false);
  index += 1;
  stack.push(module);

  yield bp.InnerModuleEvaluation_12({ module, stack, index });
  for (let requiredModule of module.dependencies) {
    if (module.deferredDependencies.has(requiredModule)) {
      yield bp.InnerModuleEvaluation_12_b_i({
        module,
        stack,
        index,
        requiredModule,
      });
      const completion = yield* InnerAsyncSubgraphsEvaluation(
        requiredModule,
        stack,
        index,
        implicitState
      );
      yield bp.InnerModuleEvaluation_12_b_i_completion({
        module,
        stack,
        index,
        requiredModule,
        result: completion,
      });
      if (completion instanceof AC) return completion;
      else index = completion.value;
    } else {
      yield bp.InnerModuleEvaluation_12_c_i({
        module,
        stack,
        index,
        requiredModule,
      });
      const completion = yield* InnerModuleEvaluation(
        requiredModule,
        stack,
        index,
        implicitState
      );
      yield bp.InnerModuleEvaluation_12_c_i_completion({
        module,
        stack,
        index,
        requiredModule,
        result: completion,
      });
      if (completion instanceof AC) return completion;
      else index = completion.value;
    }

    const completion = AfterCyclicModuleRecordEvaluation(
      module,
      requiredModule,
      stack
    );
    if (completion instanceof AC) return completion;
  }

  yield bp.InnerModuleEvaluation_13({ module, stack, index });
  if (
    g(module, "PendingAsyncDependencies") > 0 ||
    g(module, "HasTLA") === true
  ) {
    Assert(g(module, "AsyncEvaluation") === false);
    s(module, "AsyncEvaluation", true);
    if (implicitState.asyncEvaluationFieldOrder.includes(module)) {
      implicitState.asyncEvaluationFieldOrder.splice(
        implicitState.asyncEvaluationFieldOrder.indexOf(module),
        1
      );
    }
    implicitState.asyncEvaluationFieldOrder.push(module);
    if (g(module, "PendingAsyncDependencies") === 0) {
      ExecuteAsyncModule(module, implicitState);
    }
  } else {
    const completion = ExecuteSyncModule(module, implicitState);
    if (completion instanceof AC) return completion;
  }

  Assert(stack.includes(module));
  Assert(g(module, "DFSAncestorIndex") <= g(module, "DFSIndex"));
  if (g(module, "DFSAncestorIndex") === g(module, "DFSIndex")) {
    let done = false;
    while (done === false) {
      const requiredModule = stack.pop();
      if (g(requiredModule, "AsyncEvaluation") === false) {
        Assert(g(requiredModule, "Status") === "evaluating");
        s(requiredModule, "Status", "evaluated");
      } else if (g(requiredModule, "Status") === "async-subgraphs-searching") {
        s(requiredModule, "Status", "async-subgraphs-evaluating-async");
      } else {
        Assert(g(requiredModule, "Status") === "evaluating");
        s(requiredModule, "Status", "evaluating-async");
      }
      if (requiredModule === module && !stack.includes(module)) {
        done = true;
      }
      s(requiredModule, "CycleRoot", module);
    }
    done = false;
    yield bp.InnerModuleEvaluation_17_d({ module, stack, index });
    while (done === false && stack.length !== 0) {
      const requiredModule = stack[stack.length - 1];
      if (
        g(requiredModule, "Status") === "evaluated" ||
        g(requiredModule, "Status") === "evaluating-async"
      ) {
        stack.pop();
      } else {
        done = true;
      }
    }
  }

  yield bp.InnerModuleEvaluation_18({ module, stack, index });
  return NC(index);
});

const InnerAsyncSubgraphsEvaluation = AO(function* (
  module,
  stack,
  index,
  implicitState
) {
  yield bp.InnerAsyncSubgraphsEvaluation_1({ module, stack, index });
  if (g(module, "HasTLA") === true) {
    return yield* InnerModuleEvaluation(module, stack, index, implicitState);
  }
  if (
    g(module, "Status") === "async-subgraphs-evaluating-async" ||
    g(module, "Status") === "async-subgraphs-evaluated" ||
    g(module, "Status") === "evaluating-async" ||
    g(module, "Status") === "evaluated"
  ) {
    if (g(module, "EvaluationError") === undefined) return NC(index);
    return AC(g(module, "EvaluationError"));
  }
  if (
    g(module, "Status") === "async-subgraphs-searching" ||
    g(module, "Status") === "evaluating"
  ) {
    return NC(index);
  }

  Assert(g(module, "Status") === "linked");
  s(module, "Status", "async-subgraphs-searching");
  s(module, "DFSIndex", index);
  s(module, "DFSAncestorIndex", index);
  s(module, "PendingAsyncDependencies", 0);
  index += 1;
  stack.push(module);

  yield bp.InnerAsyncSubgraphsEvaluation_12({ module, stack, index });
  for (let requiredModule of module.dependencies) {
    yield bp.InnerAsyncSubgraphsEvaluation_12_b({
      module,
      stack,
      index,
      requiredModule,
    });
    const completion = yield* InnerAsyncSubgraphsEvaluation(
      requiredModule,
      stack,
      index,
      implicitState
    );
    yield bp.InnerAsyncSubgraphsEvaluation_12_b_completion({
      module,
      stack,
      index,
      requiredModule,
      result: completion,
    });
    if (completion instanceof AC) return completion;
    else index = completion.value;

    const completion2 = AfterCyclicModuleRecordEvaluation(
      module,
      requiredModule,
      stack
    );
    if (completion2 instanceof AC) return completion2;
  }

  yield bp.InnerAsyncSubgraphsEvaluation_13({ module, stack, index });
  if (g(module, "PendingAsyncDependencies") > 0) {
    Assert(g(module, "AsyncEvaluation") === false);
    s(module, "AsyncEvaluation", true);
    implicitState.asyncEvaluationFieldOrder.push(module);
  }

  Assert(stack.indexOf(module) === stack.lastIndexOf(module));
  Assert(g(module, "DFSAncestorIndex") <= g(module, "DFSIndex"));
  if (g(module, "DFSAncestorIndex") === g(module, "DFSIndex")) {
    let done = false;
    while (done === false) {
      const requiredModule = stack.pop();
      if (g(requiredModule, "AsyncEvaluation") === false) {
        if (g(requiredModule, "Status") === "async-subgraphs-searching") {
          s(requiredModule, "Status", "async-subgraphs-evaluated");
        } else {
          Assert(g(requiredModule, "Status") === "evaluating");
          s(requiredModule, "Status", "evaluated");
        }
      } else {
        if (g(requiredModule, "Status") === "async-subgraphs-searching") {
          s(requiredModule, "Status", "async-subgraphs-evaluating-async");
        } else {
          Assert(g(requiredModule, "Status") === "evaluating");
          s(requiredModule, "Status", "evaluating-async");
        }
      }
      if (requiredModule === module) {
        done = true;
      }
      s(requiredModule, "CycleRoot", module);
    }
  }

  yield bp.InnerAsyncSubgraphsEvaluation_18({ module, stack, index });
  return NC(index);
});

function AfterCyclicModuleRecordEvaluation(module, requiredModule, stack) {
  Assert(
    g(requiredModule, "Status") === "async-subgraphs-searching" ||
      g(requiredModule, "Status") === "async-subgraphs-evaluating-async" ||
      g(requiredModule, "Status") === "async-subgraphs-evaluated" ||
      g(requiredModule, "Status") === "evaluating" ||
      g(requiredModule, "Status") === "evaluating-async" ||
      g(requiredModule, "Status") === "evaluated"
  );
  Assert(
    (g(requiredModule, "Status") === "async-subgraphs-searching" ||
      g(requiredModule, "Status") === "evaluating") ===
      stack.includes(requiredModule)
  );
  if (
    g(requiredModule, "Status") === "evaluating" ||
    (g(requiredModule, "Status") === "async-subgraphs-searching" &&
      g(module, "Status") === "async-subgraphs-searching")
  ) {
    s(
      module,
      "DFSAncestorIndex",
      Math.min(
        g(module, "DFSAncestorIndex"),
        g(requiredModule, "DFSAncestorIndex")
      )
    );
  } else if (g(requiredModule, "Status") !== "async-subgraphs-searching") {
    requiredModule = g(requiredModule, "CycleRoot");
    Assert(
      g(requiredModule, "Status") === "async-subgraphs-evaluating-async" ||
        g(requiredModule, "Status") === "async-subgraphs-evaluated" ||
        g(requiredModule, "Status") === "evaluating-async" ||
        g(requiredModule, "Status") === "evaluated"
    );
    if (g(requiredModule, "EvaluationError") !== undefined) {
      return AC(g(requiredModule, "EvaluationError"));
    }
  }
  if (
    g(requiredModule, "AsyncEvaluation") === true &&
    g(module, "Status") !== "evaluated" &&
    g(module, "Status") !== "async-subgraphs-evaluated"
  ) {
    s(
      module,
      "PendingAsyncDependencies",
      g(module, "PendingAsyncDependencies") + 1
    );
    if (!g(requiredModule, "AsyncParentModules").includes(module)) {
      s(
        requiredModule,
        "AsyncParentModules",
        g(requiredModule, "AsyncParentModules").concat(module)
      );
    }
  }
}

function ExecuteSyncModule(module, implicitState) {
  console.log("Executing " + module.name);

  if (implicitState.failingModules.has(module.name)) {
    return AC("Error in " + module.name);
  } else {
    return NC(undefined);
  }
}

function ExecuteAsyncModule(module, implicitState) {
  Assert(
    g(module, "Status") === "evaluating" ||
      g(module, "Status") === "evaluating-async"
  );
  Assert(g(module, "HasTLA") === true);
  console.log("Executing async " + module.name);

  implicitState.pendingPromiseJobs.set(module.name, {
    *onFulfilled() {
      console.log("Fulfilled " + module.name);
      yield* AsyncModuleExecutionFulfilled(module, implicitState);
    },
    *onRejected(error) {
      console.log("Rejected " + module.name);
      yield* AsyncModuleExecutionRejected(module, error, implicitState);
    },
  });
}

function GatherAvailableAncestors(module, execList) {
  for (const m of g(module, "AsyncParentModules")) {
    if (
      !execList.has(m) &&
      g(g(m, "CycleRoot"), "EvaluationError") === undefined &&
      g(m, "Status") !== "evaluated"
    ) {
      Assert(
        g(m, "Status") === "async-subgraphs-evaluating-async" ||
          g(m, "Status") === "evaluating-async"
      );
      Assert(g(m, "EvaluationError") === undefined);
      Assert(g(m, "AsyncEvaluation") === true);
      Assert(g(m, "PendingAsyncDependencies") > 0);
      s(m, "PendingAsyncDependencies", g(m, "PendingAsyncDependencies") - 1);
      if (g(m, "PendingAsyncDependencies") === 0) {
        execList.add(m);
        if (g(m, "HasTLA") === false) {
          GatherAvailableAncestors(m, execList);
        }
      }
    }
  }
}

const AsyncModuleExecutionFulfilled = AO(function* (module, implicitState) {
  if (g(module, "Status") === "evaluated") {
    Assert(g(module, "EvaluationError") !== undefined);
    return;
  }
  Assert(g(module, "Status") === "evaluating-async");
  Assert(g(module, "AsyncEvaluation") === true);
  Assert(g(module, "EvaluationError") === undefined);
  s(module, "AsyncEvaluation", false);
  s(module, "Status", "evaluated");

  yield bp.AsyncModuleExecutionFulfilled_8({ module });
  const execList = new Set();
  GatherAvailableAncestors(module, execList);
  const sortedExecList = implicitState.asyncEvaluationFieldOrder.filter((m) =>
    execList.has(m)
  );
  Assert(
    sortedExecList.every(
      (m) =>
        g(m, "AsyncEvaluation") === true &&
        g(m, "PendingAsyncDependencies") === 0 &&
        g(m, "EvaluationError") === undefined
    )
  );

  for (const m of sortedExecList) {
    yield bp.AsyncModuleExecutionFulfilled_12_a({
      module,
      sortedExecList,
      m,
    });
    if (g(m, "Status") === "evaluated") {
      Assert(g(m, "EvaluationError") !== undefined);
    } else if (g(m, "HasTLA") === true) {
      ExecuteAsyncModule(m, implicitState);
    } else {
      let success = false;
      if (g(m, "Status") === "async-subgraphs-evaluating-async") {
        s(m, "Status", "async-subgraphs-evaluated");
        success = true;
      } else {
        const result = ExecuteSyncModule(m, implicitState);
        if (result instanceof AC) {
          yield* AsyncModuleExecutionRejected(m, result.value, implicitState);
        } else {
          s(m, "Status", "evaluated");
          success = true;
        }
      }
      if (success === true) {
        // TODO: Resolve
      }
    }
  }

  yield bp.AsyncModuleExecutionFulfilled_return({ module, sortedExecList });
});

const AsyncModuleExecutionRejected = AO(function* (
  module,
  error,
  implicitState
) {
  if (g(module, "Status") === "evaluated") {
    Assert(g(module, "EvaluationError") !== undefined);
    return;
  }
  Assert(g(module, "Status") === "evaluating-async");
  Assert(g(module, "AsyncEvaluation") === true);
  Assert(g(module, "EvaluationError") === undefined);
  yield bp.AsyncModuleExecutionRejected_5({ module, error });
  s(module, "EvaluationError", error);
  s(module, "Status", "evaluated");

  for (const m of g(module, "AsyncParentModules")) {
    yield* AsyncModuleExecutionRejected(m, error, implicitState);
  }
});
