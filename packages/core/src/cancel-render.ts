export function cancelRender(): never {
  throw new Error("Rendering cancelled")
}
