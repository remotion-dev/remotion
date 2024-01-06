import type {AnyRemotionOption} from './option';

export const beepOnFinishOption = {
	name: 'Beep on finish',
	cliFlag: 'beep-on-finish' as const,
	description: () => (
		<>
			Whether the Remotion Studio tab should beep when the render is finished.
		</>
	),
	ssrName: 'videoBitrate',
	docLink: 'https://www.remotion.dev/docs/config#setbeeponfinish',
	type: false as boolean,
} satisfies AnyRemotionOption;
