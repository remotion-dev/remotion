import type {AnyRemotionOption} from './option';

export const enforceAudioOption = {
	name: 'Enforce Audio Track',
	cliFlag: 'enforce-audio-track' as const,
	description: () => (
		<>Render a silent audio track if there would be none otherwise.</>
	),
	ssrName: 'enforceAudioTrack',
	docLink: 'https://www.remotion.dev/docs/config#setenforceaudiotrack-',
	type: false as boolean,
} satisfies AnyRemotionOption;
