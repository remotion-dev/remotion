import * as blurExports from '../blur/index.js';

export type {
	BlurHorizontalParams,
	BlurParams,
	BlurVerticalParams,
} from '../blur/index.js';

const {blur, blurHorizontal, blurVertical} = blurExports;

export {blur, blurHorizontal, blurVertical};
