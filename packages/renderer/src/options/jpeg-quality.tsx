import type {RemotionOption} from './option';

export const jpegQualityOption: RemotionOption = {
	name: 'JPEG Quality',
	cliFlag: '--quality',
	description: (
		<>
			Sets the quality of the generate JPEG images. Must be an integer between 0
			and 100. Default is to leave it up to the browser, current default is 80.
		</>
	),
	ssrName: 'quality',
	docLink: 'https://www.remotion.dev/docs/renderer/render-media#quality',
};
