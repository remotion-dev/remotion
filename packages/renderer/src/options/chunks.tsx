import type {AnyRemotionOption} from './option';

const cliFlag = 'chunks' as const;

export const chunksOption = {
	name: 'Chunks',
	addedIn: '4.0.542',
	cliFlag,
	description: (type) => (
		<>
			The frame range that each Lambda function renders, as a list of{' '}
			<code>[startFrame, endFrame]</code> pairs. Use it instead of setting the
			number of frames per Lambda or the concurrency when the cost of rendering
			is uneven, so that expensive parts of a video get split into shorter
			chunks than cheap parts.{' '}
			{type === 'cli'
				? 'Pass a JSON array, or a file path pointing to a JSON file.'
				: null}
		</>
	),
	ssrName: 'chunks' as const,
	docLink: 'https://www.remotion.dev/docs/options/chunks',
	type: [] as [number, number][] | null,
	getValue: () => {
		throw new Error('Option resolution not implemented');
	},
	setConfig: () => {
		throw new Error('Not implemented');
	},
	id: cliFlag,
} satisfies AnyRemotionOption<[number, number][] | null>;
