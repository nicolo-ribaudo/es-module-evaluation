function P(AO, step) {
  const breakpoint = (scope = {}) => ({ AO, step, scope });
  return Object.assign(breakpoint, { AO, step });
}

const InnerModuleEvaluation = P.bind(null, "InnerModuleEvaluation");

export const beforePromiseJob = "@@beforePromieJob";

export default {
  Evaluate_1: P("Evaluate", "1"),
  Evaluate_9: P("Evaluate", "9"),
  Evaluate_9_b: P("Evaluate", "9.b"),

  InnerModuleEvaluation_2: InnerModuleEvaluation("2"),
  InnerModuleEvaluation_14: InnerModuleEvaluation("14"),
  InnerModuleEvaluation_14_a: InnerModuleEvaluation("14.a"),
  InnerModuleEvaluation_14_a_completion:
    InnerModuleEvaluation("14.a (completion)"),
  InnerModuleEvaluation_15: InnerModuleEvaluation("15"),
  InnerModuleEvaluation_20: InnerModuleEvaluation("20"),

  AsyncModuleExecutionFulfilled_8: P("AsyncModuleExecutionFulfilled", "8"),
  AsyncModuleExecutionFulfilled_12_a: P(
    "AsyncModuleExecutionFulfilled",
    "12.a"
  ),
  AsyncModuleExecutionFulfilled_return: P(
    "AsyncModuleExecutionFulfilled",
    "(return)"
  ),

  AsyncModuleExecutionRejected_5: P("AsyncModuleExecutionRejected", "5"),

  RunPromiseJobs: P(beforePromiseJob),
};
