function P(AO, step) {
  const breakpoint = (scope = {}) => ({ AO, step, scope });
  return Object.assign(breakpoint, { AO, step });
}

const InnerModuleEvaluation = P.bind(null, "InnerModuleEvaluation");
const InnerAsyncSubgraphsEvaluation = P.bind(
  null,
  "InnerAsyncSubgraphsEvaluation"
);

export const beforePromiseJob = "@@beforePromieJob";

export default {
  Evaluate_1: P("Evaluate", "1"),
  Evaluate_9: P("Evaluate", "9"),
  Evaluate_9_b: P("Evaluate", "9.b"),

  InnerModuleEvaluation_2: InnerModuleEvaluation("2"),
  InnerModuleEvaluation_12: InnerModuleEvaluation("12"),
  InnerModuleEvaluation_12_b_i: InnerModuleEvaluation("12.b.i"),
  InnerModuleEvaluation_12_b_i_completion: InnerModuleEvaluation(
    "12.b.i (completion)"
  ),
  InnerModuleEvaluation_12_c_i: InnerModuleEvaluation("12.c.i"),
  InnerModuleEvaluation_12_c_i_completion: InnerModuleEvaluation(
    "12.c.i (completion)"
  ),
  InnerModuleEvaluation_13: InnerModuleEvaluation("13"),
  InnerModuleEvaluation_17_d: InnerModuleEvaluation("17.d"),
  InnerModuleEvaluation_18: InnerModuleEvaluation("18"),

  InnerAsyncSubgraphsEvaluation_1: InnerAsyncSubgraphsEvaluation("1"),
  InnerAsyncSubgraphsEvaluation_12: InnerAsyncSubgraphsEvaluation("12"),
  InnerAsyncSubgraphsEvaluation_12_b: InnerAsyncSubgraphsEvaluation("12.b"),
  InnerAsyncSubgraphsEvaluation_12_b_completion:
    InnerAsyncSubgraphsEvaluation("12.b (completion)"),
  InnerAsyncSubgraphsEvaluation_13: InnerAsyncSubgraphsEvaluation("13"),
  InnerAsyncSubgraphsEvaluation_18: InnerAsyncSubgraphsEvaluation("18"),

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
