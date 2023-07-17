import type {RemotionOption} from './option';

export const muteOption: RemotionOption = {
	name: 'Muted',
	cliFlag: '--muted',
	description: <>The Audio of the video will be omitted.</>,
	ssrName: 'muted',
	docLink: 'https://www.remotion.dev/docs/using-audio/#muted-property',
};
