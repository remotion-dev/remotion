---
id: three-canvas
title: <ThreeCanvas />
---

import { ExperimentalBadge } from "../components/Experimental.tsx";

<ExperimentalBadge/>

A wrapper for [React Three Fiber](https://github.com/pmndrs/react-three-fiber)'s `<Canvas />` which synchronizes with Remotions [`useCurrentFrame()`](/docs/use-current-frame).

Since React Three Fiber is a custom renderer, normally the React contexts that surround it don't work inside. This would normally break the usage of it in Remotion, but this component wraps the contexts so you can write your markup as expected.

Instead of using React Three Fibers `useFrame` API, you can (and must) write your animations fully declaratively using Remotions `useCurrentFrame` API. This will ensure that you can scrub back and forth in the timeline and pause the animation.

## Example

A spinning, color changing, scaling cube. This example can also be found in the `examples` folder of the Remotion repo.

```tsx
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';

const ThreeBasic: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<div style={{display: 'flex', width: '100%', backgroundColor: 'white'}}>
			<ThreeCanvas
				orthographic={false}
				camera={{fov: 75, position: [0, 0, 470]}}
			>
				<ambientLight intensity={0.15} />
				<pointLight args={[undefined, 0.4]} position={[200, 200, 0]} />

				<mesh
					position={[0, 0, 0]}
					rotation={[
						frame * 0.06 * 0.5,
						frame * 0.07 * 0.5,
						frame * 0.08 * 0.5,
					]}
					scale={interpolate(Math.sin(frame / 10), [-1, 1], [0.8, 1.2])}
				>
					<boxGeometry args={[100, 100, 100]} />
					<meshStandardMaterial
						color={[
							Math.sin(frame * 0.12) * 0.5 + 0.5,
							Math.cos(frame * 0.11) * 0.5 + 0.5,
							Math.sin(frame * 0.08) * 0.5 + 0.5,
						]}
					/>
				</mesh>
			</ThreeCanvas>
		</div>
	);
};

export default ThreeBasic;
```
