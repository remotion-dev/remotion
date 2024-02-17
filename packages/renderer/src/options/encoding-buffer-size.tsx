import type {AnyRemotionOption} from './option';

export const encodingBufferSizeOption = {
	name: 'FFmpeg -bufsize flag',
	cliFlag: 'buffer-size' as const,
	description: () => (
		<>
			The value for the <code>-bufsize</code> flag of FFmpeg. Should be used in
			conjunction with the encoding max rate flag.
		</>
	),
	ssrName: 'encodingBufferSize' as const,
	docLink:
		'https://www.remotion.dev/docs/renderer/render-media#encodingbuffersize',
	type: '' as string | null,
} satisfies AnyRemotionOption<string | null>;
