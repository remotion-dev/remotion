const { sqrt, exp, sin, cos } = Math;

export function getProgress(
  frame: number,
  totalFrames: number,
  totalStars: number,
  fps: number,
) {
  const table = getTable(totalFrames, totalStars, fps);
  if (frame >= table.length - 1) {
    return totalStars;
  }
  return table[frame][2];
}

function getTable(totalFrames: number, totalStars: number, fps: number) {
  const table = [];
  let px = 0;
  let pv = 0;
  for (let frame = 0; frame < totalFrames; frame++) {
    const target = Math.ceil(
      easeInOutCubic(frame / (totalFrames - 1)) * totalStars,
    );
    const { x, v } = customSpring({
      x0: px,
      v0: pv,
      t0: 0,
      t: 1000 / fps,
      k: 170, // Stiffness
      c: 26, // Damping
      m: 1, // Mass
      X: target,
    });
    px = x;
    pv = v;
    table.push([frame, target, x]);
  }
  return table;
}
function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

// From  https://github.com/pomber/use-spring/blob/master/src/spring.ts
function customSpring({
  x0,
  v0,
  t0,
  t,
  k,
  c,
  m,
  X,
}: {
  x0: number;
  v0: number;
  t0: number;
  t: number;
  k: number;
  c: number;
  m: number;
  X: number;
}) {
  const dx = x0 - X;
  const dt = (t - t0) / 1000;
  const radicand = c * c - 4 * k * m;
  if (radicand > 0) {
    const rp = (-c + sqrt(radicand)) / (2 * m);
    const rn = (-c - sqrt(radicand)) / (2 * m);
    const a = (dx * rp - v0) / (rp - rn);
    const b = (v0 - dx * rn) / (rp - rn);
    return {
      x: X + a * exp(rn * dt) + b * exp(rp * dt),
      v: a * rn * exp(rn * dt) + b * rp * exp(rp * dt),
    };
  }
  if (radicand < 0) {
    const r = -c / (2 * m);
    const s = sqrt(-radicand) / (2 * m);
    const a = dx;
    const b = (v0 - r * dx) / s;
    return {
      x: X + exp(r * dt) * (a * cos(s * dt) + b * sin(s * dt)),
      v:
        exp(r * dt) *
        ((b * s + a * r) * cos(s * dt) - (a * s - b * r) * sin(s * dt)),
    };
  }
  const r = -c / (2 * m);
  const a = dx;
  const b = v0 - r * dx;
  return {
    x: X + (a + b * dt) * exp(r * dt),
    v: (b + a * r + b * r * dt) * exp(r * dt),
  };
}
