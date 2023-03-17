import type {RemotionOption} from './option';

// TODO: add ssrName
export const enforceAudio: RemotionOption = {
	name: 'Enforce Audio Track',
	cliFlag: '--enforce-audio-track',
	description: (
		<>Render a silent audio track if there would be none otherwise.</>
	),
	ssrName: '?',
	docLink: 'https://www.remotion.dev/docs/config#setenforceaudiotrack-',
};
