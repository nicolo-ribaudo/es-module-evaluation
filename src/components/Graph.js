import { html } from "htm/preact";
const svg = html;

import { graph } from "../state.js";

// Logic adapted from https://jsbin.com/qopeye

export default function Graph({
  boxWidth = 60,
  boxHeight = 30,
  rowPadding = 60,
  colPadding = 0,
}) {
  const { nodes, edges, asyncModules } = graph.value;

  const maxCol = Math.max(...nodes.map((node) => node.col));
  const maxRow = Math.max(...nodes.map((node) => node.row));

  // +1px because of the half-pixel spacing pushing everything over a bit
  const width = (maxCol + 1) * boxWidth + maxCol * colPadding + 1;
  const height = (maxRow + 1) * boxHeight + maxRow * rowPadding + 1;

  const sizes = { boxWidth, boxHeight, rowPadding, colPadding };

  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${width} ${height}"
      width="${width}"
      height="${height}"
    >
      <style>
        rect {
          fill: white;
          stroke: black;
          rx: 10;
          ry: 10;
        }

        text {
          dominant-baseline: central;
          text-anchor: middle;
          font-family: sans-serif;
        }

        line {
          stroke: black;
          marker-end: url(#arrowhead);
        }

        .dashed {
          stroke-dasharray: 5, 5;
        }
      </style>

      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="10"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" />
        </marker>
      </defs>

      ${nodes.map(
        (node) =>
          html`<${GraphNode}
            node=${node}
            async=${asyncModules.includes(node.name)}
            sizes=${sizes}
          />`
      )}
      ${edges.map(
        (edge) =>
          html`<${GraphEdge} edge=${edge} nodes=${nodes} sizes=${sizes} />`
      )}
    </svg>
  `;
}

function GraphNode({ node, async, sizes }) {
  const rectDimensions = nodeRectDimensions(node, sizes);
  const textCoordinates = centerCoordinates(rectDimensions);

  return svg`
    <rect ...${rectDimensions} />
    <text ...${textCoordinates}>
      ${node.name}
      ${async ? svg`<${AsyncMarker} />` : null}
    </text>
  `;
}

function AsyncMarker() {
  return svg`<tspan style="font-size:67%;dominant-baseline:text-after-edge;font-family:serif">TLA</tspan>`;
}

function GraphEdge({ edge, nodes, sizes }) {
  const fromNode = nodes.find((node) => node.name === edge.from);
  const fromNodeDimensions = nodeRectDimensions(fromNode, sizes);

  const toNode = nodes.find((node) => node.name === edge.to);
  const toNodeDimensions = nodeRectDimensions(toNode, sizes);

  let fromX, fromY, toX, toY;
  if (fromNodeDimensions.y < toNodeDimensions.y) {
    fromX = centerCoordinates(fromNodeDimensions).x;
    fromY = fromNodeDimensions.y + fromNodeDimensions.height;

    toX = centerCoordinates(toNodeDimensions).x;
    toY = toNodeDimensions.y;
  } else if (fromNodeDimensions.y > toNodeDimensions.y) {
    fromX = centerCoordinates(fromNodeDimensions).x;
    fromY = fromNodeDimensions.y;

    toX = centerCoordinates(toNodeDimensions).x;
    toY = toNodeDimensions.y + toNodeDimensions.height;
  } else {
    if (fromNodeDimensions.x < toNodeDimensions.x) {
      fromX = fromNodeDimensions.x + fromNodeDimensions.width;
      fromY = centerCoordinates(fromNodeDimensions).y;

      toX = toNodeDimensions.x;
      toY = centerCoordinates(fromNodeDimensions).y;
    } else if (fromNodeDimensions.x > toNodeDimensions.x) {
      fromX = fromNodeDimensions.x;
      fromY = centerCoordinates(fromNodeDimensions).y;

      toX = toNodeDimensions.x + toNodeDimensions.width;
      toY = centerCoordinates(fromNodeDimensions).y;
    } else {
      throw new Error("Self-dependencies not yet supported");
    }
  }

  const lineClass = edge.deferred ? "dashed" : "";

  return svg`
    <line x1=${fromX} y1=${fromY} x2=${toX} y2=${toY} class=${lineClass} />
  `;
}

function nodeRectDimensions(
  node,
  { boxWidth, boxHeight, colPadding, rowPadding }
) {
  return {
    x: node.col * (boxWidth + colPadding) + 0.5,
    y: node.row * (boxHeight + rowPadding) + 0.5,
    width: boxWidth,
    height: boxHeight,
  };
}

function centerCoordinates(dimensions) {
  return {
    x: dimensions.x + dimensions.width / 2,
    y: dimensions.y + dimensions.height / 2,
  };
}
