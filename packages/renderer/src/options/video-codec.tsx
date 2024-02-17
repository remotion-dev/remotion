import type {Codec} from '../codec';
import type {AnyRemotionOption} from './option';

export const videoCodecOption = {
	name: 'Codec',
	cliFlag: 'codec' as const,
	description: () => (
		<>
			H264 works well in most cases, but sometimes it&apos;s worth going for a
			different codec. WebM achieves higher compression but is slower to render.
			WebM, GIF and ProRes support transparency.
		</>
	),
	ssrName: 'codec',
	docLink: 'https://www.remotion.dev/docs/encoding/#choosing-a-codec',
	type: '' as Codec,
} satisfies AnyRemotionOption<string>;
