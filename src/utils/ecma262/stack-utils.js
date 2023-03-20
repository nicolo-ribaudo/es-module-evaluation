let currentStackDepth = 0;

export function AO(runner) {
  return function* () {
    const stackDepth = ++currentStackDepth;
    let it = runner.apply(this, arguments);
    let res;
    let nextArg;
    while (!(res = it.next(nextArg)).done) {
      if (!res.value.AO) res.value.AO = name;
      if (!res.value.stackDepth) res.value.stackDepth = stackDepth;
      nextArg = yield res.value;
    }
    --currentStackDepth;
    return res.value;
  };
}
