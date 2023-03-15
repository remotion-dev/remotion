import type {RemotionOption} from './option';

export const crfOption: RemotionOption = {
	name: 'CRF',
	cliFlag: '--crf',
	description: (
		<>
			No matter which codec you end up using, there&apos;s always a tradeoff
			between file size and video quality. You can control it by setting the so
			called CRF (Constant Rate Factor). The lower the number, the better the
			quality, the higher the number, the smaller the file is – of course at the
			cost of quality.
		</>
	),
	ssrName: 'crf',
};
