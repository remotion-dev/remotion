# `@remotion/animation-utils`

## interpolateStyles

_Available from v2.0.3_

Allows you to map a range of values to styles.

**Documentation: https://remotion.dev/animation-utils**

### Usage

```tsx twoslash
import {interpolateStyles} from '@remotion/animation-utils';
import {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';

export default function Example() {
	const outputStyles = useMemo(
		() => [
			{
				backgroundColor: 'red',
			},
			{
				backgroundColor: 'blue',
			},
		],
		[],
	);
	const frame = useCurrentFrame();
	const styles = interpolateStyles(frame, [0, 100], outputStyles);
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<h1
				style={{
					fontSize: 200,
					...styles,
				}}
			>
				Testing
			</h1>
		</AbsoluteFill>
	);
}
```

## makeTransform

A type-safe function to create a string to be passed to the `transform` CSS property.

### Usage

```tsx twoslash
import {makeTransform, rotate, translateX} from '@remotion/animation-utils';
import {AbsoluteFill} from 'remotion';

export default function Example() {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<h1
				style={{
					fontSize: 200,
					transform: makeTransform([translateX(100), rotate(90)]),
				}}
			>
				Testing
			</h1>
		</AbsoluteFill>
	);
}
```

## License

MIT
