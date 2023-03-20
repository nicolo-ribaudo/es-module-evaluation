let currentStackDepth = 0;

export function AO(runner) {
  return function* () {
    const stackDepth = ++currentStackDepth;
    let it = runner.apply(this, arguments);
    let done, value, nextArg;
    while ((({ done, value } = it.next(nextArg)), !done)) {
      if (!value.AO) value.AO = name;
      if (!value.stackDepth) value.stackDepth = stackDepth;
      nextArg = yield value;
    }
    --currentStackDepth;
    return value;
  };
}
