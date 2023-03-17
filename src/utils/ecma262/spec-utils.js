export function NC(value) {
  return { value, __proto__: NC.prototype };
}
export function AC(value) {
  return { value, __proto__: AC.prototype };
}
export function Assert(val) {
  if (!val) throw new Error("Assertion failure");
}
