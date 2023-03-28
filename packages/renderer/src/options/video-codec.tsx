import type {RemotionOption} from './option';

export const videoCodecOption: RemotionOption = {
	name: 'Codec',
	cliFlag: '--codec',
	description: (
		<>
			Remotion supports 5 video codecs: h264 (default), h265, vp8, vp9 and
			prores. While H264 will work well in most cases, sometimes it&apos;s worth
			going for a different codec. Follow the link below for an overview.
		</>
	),
	ssrName: 'codec',
	docLink: 'https://www.remotion.dev/docs/encoding/#choosing-a-codec',
};
