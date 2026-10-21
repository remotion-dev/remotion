import type {ElementAsset} from '@remotion/studio-protocol';
import type {ComponentProps} from 'react';
import type {SpinningGlobe} from './spinning-globe';

// Natural Earth II, public domain; attribution is not required.
// https://www.naturalearthdata.com/about/terms-of-use/
export const spinningGlobeTexture = {
	path: 'elements/spinning-globe/earth.jpg',
	type: 'url',
	url: 'https://remotion.media/earth.jpg',
} as const satisfies ElementAsset;

export const spinningGlobeInitialProps = {
	src: spinningGlobeTexture.url,
} satisfies ComponentProps<typeof SpinningGlobe>;
