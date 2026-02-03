---
image: /generated/articles-docs-shaders.png
id: shaders
title: Shaders
crumb: 'Designing visuals'
---

You can use WebGL shaders in Remotion by rendering to a `<canvas>` element.  
[All animations must be driven](/docs/animating-properties#always-animate-using-usecurrentframe) by [`useCurrentFrame()`](/docs/use-current-frame) to ensure deterministic rendering during both preview and final output.

## Retrieving a WebGL context

Get a reference to a `<canvas>` element using [`useRef()`](https://react.dev/reference/react/useRef), then call `canvas.getContext("webgl")` to obtain a [`WebGLRenderingContext`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext). Initialize the GL state once (e.g. compile shaders, set up buffers), then update uniforms each frame based on the current time derived from [`useCurrentFrame()`](/docs/use-current-frame) and [`useVideoConfig()`](/docs/use-video-config).

## Example

The following component renders an animated shader.
The `time` uniform is computed from `frame / fps`, making the animation frame-accurate and deterministic.

<Demo type="shader" />

```tsx twoslash title="BurlFigure.tsx"
import {useCurrentFrame, useVideoConfig, AbsoluteFill} from 'remotion';
import {useCallback, useRef, useEffect} from 'react';

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

const float Pi = 3.14159;

void main()
{
    vec2 p = 0.001 * gl_FragCoord.xy;
    for(int i = 1; i < 7; i++)
    {
        vec2 newp = p;
        newp.x += 0.6 / float(i) * cos(float(i) * p.y + (time * 20.0) / 10.0 + 0.3 * float(i)) + 400.0 / 20.0;
        newp.y += 0.6 / float(i) * cos(float(i) * p.x + (time * 20.0) / 10.0 + 0.3 * float(i + 10)) - 400.0 / 20.0 + 15.0;
        p = newp;
    }
    vec3 col = vec3(0.5 * sin(3.0 * p.x) + 0.5, 0.5 * sin(3.0 * p.y) + 0.5, sin(p.x + p.y));
    gl_FragColor = vec4(col, 1.0);
}
`;

export const BurlFigure: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<{
    gl: WebGLRenderingContext;
    timeLoc: WebGLUniformLocation;
    resLoc: WebGLUniformLocation;
  } | null>(null);

  const initGl = useCallback((canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext('webgl');
    if (!gl) return null;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    return {
      gl,
      timeLoc: gl.getUniformLocation(program, 'time')!,
      resLoc: gl.getUniformLocation(program, 'resolution')!,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || glRef.current) return;
    glRef.current = initGl(canvas);
  }, [initGl]);

  useEffect(() => {
    const ctx = glRef.current;
    if (!ctx) return;
    const {gl, timeLoc, resLoc} = ctx;

    const time = frame / fps;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(timeLoc, time);
    gl.uniform2f(resLoc, gl.canvas.width, gl.canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [frame, fps]);

  return (
    <AbsoluteFill>
      <canvas ref={canvasRef} width={width} height={height} />
    </AbsoluteFill>
  );
};
```

:::note
Shader source: [GLSL Sandbox](https://glslsandbox.com/e#24303.0).
:::

## Drawing a shader to a DOM element

WebGL shaders can only render into a `<canvas>` element.  
You cannot apply a shader as a post-processing effect to arbitrary DOM elements.

## Rendering

When rendering a video that uses WebGL, you need to pass [`--gl=angle`](/docs/gl-options) to ensure the headless browser uses the GPU:

```bash
npx remotion render MyComp --gl=angle
```

Without this flag, the headless browser may not have a WebGL context available.

## See also

- [`useCurrentFrame()`](/docs/use-current-frame)
- [`useVideoConfig()`](/docs/use-video-config)
- [Animation math](/docs/animation-math)
