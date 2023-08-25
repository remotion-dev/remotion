import {AnyRemotionOption} from './option';

export const jpegQualityOption = {
	name: 'JPEG Quality',
	cliFlag: '--jpeg-quality',
	description: () => (
		<>
			Sets the quality of the generated JPEG images. Must be an integer between
			0 and 100. Default: 80.
		</>
	),
	ssrName: 'jpegQuality',
	docLink: 'https://www.remotion.dev/docs/renderer/render-media#jpeg-quality',
	type: 0 as number,
} satisfies AnyRemotionOption;
