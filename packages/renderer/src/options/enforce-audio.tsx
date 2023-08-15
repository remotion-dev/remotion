import type {RemotionOption} from './option';

export const enforceAudioOption: RemotionOption = {
	name: 'Enforce Audio Track',
	cliFlag: '--enforce-audio-track',
	description: (
		<>Render a silent audio track if there would be none otherwise.</>
	),
	ssrName: 'enforceAudioTrack',
	docLink: 'https://www.remotion.dev/docs/config#setenforceaudiotrack-',
};
