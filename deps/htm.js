/* esm.sh - esbuild bundle(htm@3.1.1) esnext production */
var a = function (p, f, c, n) {
    var l;
    f[0] = 0;
    for (var u = 1; u < f.length; u++) {
      var g = f[u++],
        o = f[u] ? ((f[0] |= g ? 1 : 2), c[f[u++]]) : f[++u];
      g === 3
        ? (n[0] = o)
        : g === 4
        ? (n[1] = Object.assign(n[1] || {}, o))
        : g === 5
        ? ((n[1] = n[1] || {})[f[++u]] = o)
        : g === 6
        ? (n[1][f[++u]] += o + "")
        : g
        ? ((l = p.apply(o, a(p, o, c, ["", null]))),
          n.push(l),
          o[0] ? (f[0] |= 2) : ((f[u - 2] = 0), (f[u] = l)))
        : n.push(o);
    }
    return n;
  },
  M = new Map();
function b(p) {
  var f = M.get(this);
  return (
    f || ((f = new Map()), M.set(this, f)),
    (f = a(
      this,
      f.get(p) ||
        (f.set(
          p,
          (f = (function (c) {
            for (
              var n,
                l,
                u = 1,
                g = "",
                o = "",
                i = [0],
                s = function (v) {
                  u === 1 && (v || (g = g.replace(/^\s*\n\s*|\s*\n\s*$/g, "")))
                    ? i.push(0, v, g)
                    : u === 3 && (v || g)
                    ? (i.push(3, v, g), (u = 2))
                    : u === 2 && g === "..." && v
                    ? i.push(4, v, 0)
                    : u === 2 && g && !v
                    ? i.push(5, 0, !0, g)
                    : u >= 5 &&
                      ((g || (!v && u === 5)) && (i.push(u, 0, g, l), (u = 6)),
                      v && (i.push(u, v, 0, l), (u = 6))),
                    (g = "");
                },
                t = 0;
              t < c.length;
              t++
            ) {
              t && (u === 1 && s(), s(t));
              for (var w = 0; w < c[t].length; w++)
                (n = c[t][w]),
                  u === 1
                    ? n === "<"
                      ? (s(), (i = [i]), (u = 3))
                      : (g += n)
                    : u === 4
                    ? g === "--" && n === ">"
                      ? ((u = 1), (g = ""))
                      : (g = n + g[0])
                    : o
                    ? n === o
                      ? (o = "")
                      : (g += n)
                    : n === '"' || n === "'"
                    ? (o = n)
                    : n === ">"
                    ? (s(), (u = 1))
                    : u &&
                      (n === "="
                        ? ((u = 5), (l = g), (g = ""))
                        : n === "/" && (u < 5 || c[t][w + 1] === ">")
                        ? (s(),
                          u === 3 && (i = i[0]),
                          (u = i),
                          (i = i[0]).push(2, 0, u),
                          (u = 0))
                        : n === " " ||
                          n === "	" ||
                          n ===
                            `
` ||
                          n === "\r"
                        ? (s(), (u = 2))
                        : (g += n)),
                  u === 3 && g === "!--" && ((u = 4), (i = i[0]));
            }
            return s(), i;
          })(p))
        ),
        f),
      arguments,
      []
    )).length > 1
      ? f
      : f[0]
  );
}
export { b as default };
