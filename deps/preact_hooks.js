/* esm.sh - esbuild bundle(preact@10.13.0/hooks) esnext production */
import { options as r } from "preact";
var i,
  o,
  d,
  N,
  f = 0,
  q = [],
  l = [],
  V = r.__b,
  b = r.__r,
  g = r.diffed,
  A = r.__c,
  C = r.unmount;
function a(_, n) {
  r.__h && r.__h(o, _, f || n), (f = 0);
  var u = o.__H || (o.__H = { __: [], __h: [] });
  return _ >= u.__.length && u.__.push({ __V: l }), u.__[_];
}
function P(_) {
  return (f = 1), k(x, _);
}
function k(_, n, u) {
  var t = a(i++, 2);
  if (
    ((t.t = _),
    !t.__c &&
      ((t.__ = [
        u ? u(n) : x(void 0, n),
        function (s) {
          var h = t.__N ? t.__N[0] : t.__[0],
            v = t.t(h, s);
          h !== v && ((t.__N = [v, t.__[1]]), t.__c.setState({}));
        },
      ]),
      (t.__c = o),
      !o.u))
  ) {
    o.u = !0;
    var e = o.shouldComponentUpdate;
    o.shouldComponentUpdate = function (s, h, v) {
      if (!t.__c.__H) return !0;
      var E = t.__c.__H.__.filter(function (c) {
        return c.__c;
      });
      if (
        E.every(function (c) {
          return !c.__N;
        })
      )
        return !e || e.call(this, s, h, v);
      var y = !1;
      return (
        E.forEach(function (c) {
          if (c.__N) {
            var T = c.__[0];
            (c.__ = c.__N), (c.__N = void 0), T !== c.__[0] && (y = !0);
          }
        }),
        !(!y && t.__c.props === s) && (!e || e.call(this, s, h, v))
      );
    };
  }
  return t.__N || t.__;
}
function U(_, n) {
  var u = a(i++, 3);
  !r.__s && H(u.__H, n) && ((u.__ = _), (u.i = n), o.__H.__h.push(u));
}
function B(_, n) {
  var u = a(i++, 4);
  !r.__s && H(u.__H, n) && ((u.__ = _), (u.i = n), o.__h.push(u));
}
function j(_) {
  return (
    (f = 5),
    D(function () {
      return { current: _ };
    }, [])
  );
}
function w(_, n, u) {
  (f = 6),
    B(
      function () {
        return typeof _ == "function"
          ? (_(n()),
            function () {
              return _(null);
            })
          : _
          ? ((_.current = n()),
            function () {
              return (_.current = null);
            })
          : void 0;
      },
      u == null ? u : u.concat(_)
    );
}
function D(_, n) {
  var u = a(i++, 7);
  return H(u.__H, n) ? ((u.__V = _()), (u.i = n), (u.__h = _), u.__V) : u.__;
}
function z(_, n) {
  return (
    (f = 8),
    D(function () {
      return _;
    }, n)
  );
}
function L(_) {
  var n = o.context[_.__c],
    u = a(i++, 9);
  return (
    (u.c = _),
    n ? (u.__ == null && ((u.__ = !0), n.sub(o)), n.props.value) : _.__
  );
}
function M(_, n) {
  r.useDebugValue && r.useDebugValue(n ? n(_) : _);
}
function G(_) {
  var n = a(i++, 10),
    u = P();
  return (
    (n.__ = _),
    o.componentDidCatch ||
      (o.componentDidCatch = function (t, e) {
        n.__ && n.__(t, e), u[1](t);
      }),
    [
      u[0],
      function () {
        u[1](void 0);
      },
    ]
  );
}
function J() {
  var _ = a(i++, 11);
  if (!_.__) {
    for (var n = o.__v; n !== null && !n.__m && n.__ !== null; ) n = n.__;
    var u = n.__m || (n.__m = [0, 0]);
    _.__ = "P" + u[0] + "-" + u[1]++;
  }
  return _.__;
}
function I() {
  for (var _; (_ = q.shift()); )
    if (_.__P && _.__H)
      try {
        _.__H.__h.forEach(m), _.__H.__h.forEach(p), (_.__H.__h = []);
      } catch (n) {
        (_.__H.__h = []), r.__e(n, _.__v);
      }
}
(r.__b = function (_) {
  (o = null), V && V(_);
}),
  (r.__r = function (_) {
    b && b(_), (i = 0);
    var n = (o = _.__c).__H;
    n &&
      (d === o
        ? ((n.__h = []),
          (o.__h = []),
          n.__.forEach(function (u) {
            u.__N && (u.__ = u.__N), (u.__V = l), (u.__N = u.i = void 0);
          }))
        : (n.__h.forEach(m), n.__h.forEach(p), (n.__h = []))),
      (d = o);
  }),
  (r.diffed = function (_) {
    g && g(_);
    var n = _.__c;
    n &&
      n.__H &&
      (n.__H.__h.length &&
        ((q.push(n) !== 1 && N === r.requestAnimationFrame) ||
          ((N = r.requestAnimationFrame) || R)(I)),
      n.__H.__.forEach(function (u) {
        u.i && (u.__H = u.i),
          u.__V !== l && (u.__ = u.__V),
          (u.i = void 0),
          (u.__V = l);
      })),
      (d = o = null);
  }),
  (r.__c = function (_, n) {
    n.some(function (u) {
      try {
        u.__h.forEach(m),
          (u.__h = u.__h.filter(function (t) {
            return !t.__ || p(t);
          }));
      } catch (t) {
        n.some(function (e) {
          e.__h && (e.__h = []);
        }),
          (n = []),
          r.__e(t, u.__v);
      }
    }),
      A && A(_, n);
  }),
  (r.unmount = function (_) {
    C && C(_);
    var n,
      u = _.__c;
    u &&
      u.__H &&
      (u.__H.__.forEach(function (t) {
        try {
          m(t);
        } catch (e) {
          n = e;
        }
      }),
      (u.__H = void 0),
      n && r.__e(n, u.__v));
  });
var F = typeof requestAnimationFrame == "function";
function R(_) {
  var n,
    u = function () {
      clearTimeout(t), F && cancelAnimationFrame(n), setTimeout(_);
    },
    t = setTimeout(u, 100);
  F && (n = requestAnimationFrame(u));
}
function m(_) {
  var n = o,
    u = _.__c;
  typeof u == "function" && ((_.__c = void 0), u()), (o = n);
}
function p(_) {
  var n = o;
  (_.__c = _.__()), (o = n);
}
function H(_, n) {
  return (
    !_ ||
    _.length !== n.length ||
    n.some(function (u, t) {
      return u !== _[t];
    })
  );
}
function x(_, n) {
  return typeof n == "function" ? n(_) : n;
}
export {
  z as useCallback,
  L as useContext,
  M as useDebugValue,
  U as useEffect,
  G as useErrorBoundary,
  J as useId,
  w as useImperativeHandle,
  B as useLayoutEffect,
  D as useMemo,
  k as useReducer,
  j as useRef,
  P as useState,
};
