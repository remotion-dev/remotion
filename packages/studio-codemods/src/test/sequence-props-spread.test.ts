import {expect, test} from 'bun:test';
import {computeSequencePropsSubscriptionFromContent} from '../sequence-props';

const videoConfigValues = {
	durationInFrames: 120,
	fps: 30,
	height: 1080,
	width: 1920,
};

const subscribe = (input: string, line: number, keys: string[]) => {
	const result = computeSequencePropsSubscriptionFromContent({
		fileContents: input,
		absolutePath: '/project/src/Example.tsx',
		line,
		preferredNodePath: null,
		componentIdentity: 'dev.remotion.remotion.Sequence',
		keys,
		effects: [],
		videoConfigValues,
	});

	if (!result.success || !result.status.canUpdate) {
		throw new Error('Expected the subscription to succeed');
	}

	return result.status.props;
};

// https://github.com/remotion-dev/remotion/issues/10717
// Props passed via a JSX spread are invisible to the parser. Reporting them as
// static(undefined) made the Studio delete the runtime values of `from` /
// `durationInFrames`, mounting every <Sequence> at every frame.
test('treats props that a spread attribute may override as computed', () => {
	const input = `import {Sequence} from 'remotion';

export const Example = ({timing}: {timing: {from: number; durationInFrames: number}}) => {
	return (
		<>
			<Sequence from={10} {...timing} name="Scene" style={{opacity: 0.5}}>
				<div />
			</Sequence>
			<Sequence {...timing} />
		</>
	);
};
`;
	expect(
		subscribe(input, 6, ['from', 'durationInFrames', 'name', 'style.opacity']),
	).toEqual({
		// Written before the spread, so the spread may override it
		from: {status: 'computed'},
		// Only provided by the spread
		durationInFrames: {status: 'computed'},
		// Written after the spread, so they win at runtime and stay editable
		name: {
			status: 'static',
			keyframeDisplayOffsetAdjustment: null,
			codeValue: 'Scene',
		},
		'style.opacity': {
			status: 'static',
			keyframeDisplayOffsetAdjustment: null,
			codeValue: 0.5,
		},
	});

	// With an empty element body, the spread may provide both props
	expect(subscribe(input, 9, ['from', 'children'])).toEqual({
		from: {status: 'computed'},
		children: {status: 'computed'},
	});
});
