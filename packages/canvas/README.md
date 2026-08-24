# @remotion/canvas

Headless primitives for Remotion authoring interfaces.

`<Canvas>` renders an `@remotion/player` and publishes its live timeline through
a controller:

```tsx
import {Canvas, createCanvasController} from '@remotion/canvas';

const controller = createCanvasController();

controller.timeline.subscribe(() => {
	console.log(controller.timeline.getSnapshot());
});

controller.selection.subscribe(() => {
	console.log(controller.selection.getSnapshot());
});

controller.selection.select(
	{
		type: 'property',
		entity: {type: 'sequence', id: 'title'},
		propertyPath: ['style', 'opacity'],
	},
	'add',
);

<Canvas
	controller={controller}
	component={MyComposition}
	durationInFrames={300}
	compositionWidth={1920}
	compositionHeight={1080}
	fps={30}
/>;
```

This package is an internal dependency of Remotion Studio. Its API is not yet
ready for general use.
