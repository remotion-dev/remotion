import type {RemotionOption} from './option';

export const scaleOption: RemotionOption = {
	name: 'Scale',
	cliFlag: '--scale',
	description: (
		<>
			Scales the output by a factor. For example, a 1280x720px frame will become
			a 1920x1080px frame with a scale factor of <code>1.5</code>. Vector
			elements like fonts and HTML markups will be rendered with extra details.
		</>
	),
	ssrName: 'scale',
	docLink: 'https://www.remotion.dev/docs/scaling',
};
