import {expect, test} from 'bun:test';
import {computeSequencePropsSubscriptionFromContent} from '../sequence-props';

// https://github.com/remotion-dev/remotion/issues/10717
// Props passed via a JSX spread are invisible to the parser. Reporting them as
// static(undefined) made the Studio delete the runtime values of `from` /
// `durationInFrames`, mounting every <Sequence> at every frame.
test('treats all props as computed if a spread attribute is present', () => {
	const input = `import {Sequence} from 'remotion';

export const Example = ({timing}: {timing: {from: number; durationInFrames: number}}) => {
	return (
		<Sequence {...timing} name="Scene" style={{opacity: 0.5}}>
			<div />
		</Sequence>
	);
};
`;
	const result = computeSequencePropsSubscriptionFromContent({
		fileContents: input,
		absolutePath: '/project/src/Example.tsx',
		line: 5,
		preferredNodePath: null,
		componentIdentity: 'dev.remotion.remotion.Sequence',
		keys: ['from', 'durationInFrames', 'name', 'style.opacity'],
		effects: [],
		videoConfigValues: {
			durationInFrames: 120,
			fps: 30,
			height: 1080,
			width: 1920,
		},
	});

	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error('Expected the subscription to succeed');
	}

	expect(result.status.canUpdate).toBe(true);
	if (!result.status.canUpdate) {
		throw new Error('Expected canUpdate to be true');
	}

	expect(result.status.props).toEqual({
		from: {status: 'computed'},
		durationInFrames: {status: 'computed'},
		name: {status: 'computed'},
		'style.opacity': {status: 'computed'},
	});
});
