export function buildModulesGraph(
  structure,
  connections,
  asyncModules,
  failingModules
) {
  const { nodes, edges } = parseGraph(structure, connections);
  const nodesNames = new Set(nodes.map((n) => n.name));

  return {
    nodes,
    edges: edges.filter(
      (edge) => nodesNames.has(edge.from) && nodesNames.has(edge.to)
    ),
    asyncModules: asyncModules.split(/\s+/g).filter(Boolean),
    failingModules: new Set(failingModules.split(/\s+/g).filter(Boolean)),
  };
}

// Source: https://jsbin.com/qopeye

export function parseGraph(structureText, connectionsText) {
  const structureLines = structureText.split("\n");
  const nodes = [];
  for (const [row, line] of structureLines.entries()) {
    if (isWhitespace(line)) {
      continue;
    }

    const modules = line.split(/\s+/g).filter((name) => !isWhitespace(name));
    for (const module of modules) {
      const col = line.indexOf(module);
      nodes.push({ name: module, row, col });
    }
  }

  // Normalize all cols by the GCD so that spaces in between don't count
  const colGCD = gcd(nodes.map((node) => node.col));
  for (const node of nodes) {
    node.col /= colGCD;
  }

  const connectionsLines = connectionsText.split("\n");
  const edges = [];
  for (const line of connectionsLines) {
    if (isWhitespace(line)) {
      continue;
    }

    const [, from, type, to] = /^([^ ]+) (-|\.)> ([^ ]+)$/.exec(line);
    edges.push({ from, deferred: type === ".", to });
  }

  return { nodes, edges };
}

function isWhitespace(string) {
  return /^\s*$/.test(string);
}

function gcd(numbers) {
  let result = numbers[0];
  for (let i = 1; i < numbers.length; ++i) {
    result = gcd2(result, numbers[i]);
  }
  return result;
}

function gcd2(a, b) {
  if (b === 0) {
    return a;
  }

  return gcd2(b, a % b);
}
