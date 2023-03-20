import { Assert, AC, NC } from "./spec-utils.js";
import bp from "./breakpoints.js";
import { AO } from "./stack-utils.js";

function g(module, fieldName) {
  return module.fields[fieldName].peek();
}
function s(module, fieldName, value) {
  module.fields[fieldName].value = value;
}

export const Evaluate = AO(function* (
  module,
  asyncResolutionOrder,
  failingModules
) {
  yield bp.Evaluate_1({ module });

  // This state is not explitly tracked in the modules evaluation
  // algorithm, but we need it to implement the correct semantics.
  const pendingPromiseJobs = new Map();
  const asyncEvaluationFieldOrder = [];
  const implicitState = {
    pendingPromiseJobs,
    asyncEvaluationFieldOrder,
    failingModules,
  };

  Assert(
    g(module, "Status") === "linked" ||
      g(module, "Status") === "evaluating-async" ||
      g(module, "Status") === "evaluated"
  );

  const stack = [];
  const result = yield* InnerModuleEvaluation(module, stack, 0, implicitState);

  yield bp.Evaluate_9({ module, result, stack });
  if (result instanceof AC) {
    for (const m of stack) {
      Assert(g(m, "Status") === "evaluating");
      s(m, "Status", "evaluated");
      s(m, "EvaluationError", result.value);
    }
    yield bp.Evaluate_9_b({ module, result, stack });
    Assert(g(module, "Status") === "evaluated");
    Assert(g(module, "EvaluationError") === result);
    // TODO: reject

    console.log("Done");
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

  yield* RunPromiseJobs(
    asyncResolutionOrder,
    pendingPromiseJobs,
    failingModules
  );

  console.log("Done");
});

const RunPromiseJobs = AO(function* (
  asyncResolutionOrder,
  pendingPromiseJobs,
  failingModules
) {
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
    if (g(module, "EvaluationError") === undefined) return NC(index);
    return AC(g(module, "EvaluationError"));
  }
  if (g(module, "Status") === "evaluating") {
    return NC(index);
  }

  Assert(g(module, "Status") === "linked");
  s(module, "Status", "evaluating");
  s(module, "DFSIndex", index);
  s(module, "DFSAncestorIndex", index);
  s(module, "PendingAsyncDependencies", 0);
  index += 1;
  stack.push(module);

  yield bp.InnerModuleEvaluation_11({ module, stack, index });
  for (let requiredModule of module.dependencies) {
    yield bp.InnerModuleEvaluation_11_b({
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
    yield bp.InnerModuleEvaluation_11_b_completion({
      module,
      stack,
      index,
      requiredModule,
      result: completion,
    });
    if (completion instanceof AC) return completion;
    else index = completion.value;

    Assert(
      g(requiredModule, "Status") === "evaluating" ||
        g(requiredModule, "Status") === "evaluating-async" ||
        g(requiredModule, "Status") === "evaluated"
    );
    Assert(
      (g(requiredModule, "Status") === "evaluating") ===
        stack.includes(requiredModule)
    );
    if (g(requiredModule, "Status") === "evaluating") {
      s(
        module,
        "DFSAncestorIndex",
        Math.min(
          g(module, "DFSAncestorIndex"),
          g(requiredModule, "DFSAncestorIndex")
        )
      );
    } else {
      requiredModule = g(requiredModule, "CycleRoot");
      Assert(
        g(requiredModule, "Status") === "evaluating-async" ||
          g(requiredModule, "Status") === "evaluated"
      );
      if (g(requiredModule, "EvaluationError") !== undefined) {
        return g(requiredModule, "EvaluationError");
      }
    }
    if (g(requiredModule, "AsyncEvaluation") === true) {
      s(
        module,
        "PendingAsyncDependencies",
        g(module, "PendingAsyncDependencies") + 1
      );
      s(
        requiredModule,
        "AsyncParentModules",
        g(requiredModule, "AsyncParentModules").concat(module)
      );
    }
  }

  yield bp.InnerModuleEvaluation_12({ module, stack, index });
  if (
    g(module, "PendingAsyncDependencies") > 0 ||
    g(module, "HasTLA") === true
  ) {
    Assert(g(module, "AsyncEvaluation") === false);
    s(module, "AsyncEvaluation", true);
    implicitState.asyncEvaluationFieldOrder.push(module);
    if (g(module, "PendingAsyncDependencies") === 0) {
      ExecuteAsyncModule(module, implicitState);
    }
  } else {
    const completion = ExecuteSyncModule(module, implicitState);
    if (completion instanceof AC) return completion;
  }

  Assert(stack.filter((m) => m === module).length === 1);
  Assert(g(module, "DFSAncestorIndex") <= g(module, "DFSIndex"));
  if (g(module, "DFSAncestorIndex") === g(module, "DFSIndex")) {
    let done = false;
    while (done === false) {
      const requiredModule = stack.pop();
      if (g(requiredModule, "AsyncEvaluation") === false) {
        s(requiredModule, "Status", "evaluated");
      } else {
        s(requiredModule, "Status", "evaluating-async");
      }
      if (requiredModule === module) {
        done = true;
      }
      s(requiredModule, "CycleRoot", module);
    }
  }

  yield bp.InnerModuleEvaluation_17({ module, stack, index });
  return NC(index);
});

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
      g(g(m, "CycleRoot"), "EvaluationError") === undefined
    ) {
      Assert(g(m, "Status") === "evaluating-async");
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
      const result = ExecuteSyncModule(m, implicitState);
      if (result instanceof AC) {
        yield* AsyncModuleExecutionRejected(m, result.value, implicitState);
      } else {
        s(m, "Status", "evaluated");
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
