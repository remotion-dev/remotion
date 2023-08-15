import type {RemotionOption} from './option';

export const jpegQualityOption: RemotionOption = {
	name: 'JPEG Quality',
	cliFlag: '--jpeg-quality',
	description: (
		<>
			Sets the quality of the generated JPEG images. Must be an integer between
			0 and 100. Default: 80.
		</>
	),
	ssrName: 'jpegQuality',
	docLink: 'https://www.remotion.dev/docs/renderer/render-media#jpeg-quality',
};
