import {Lottie} from '@remotion/lottie';
import {AbsoluteFill, staticFile, useVideoConfig} from 'remotion';

const lottie = {
	v: '5.5.2',
	fr: 1,
	ip: 0,
	op: 1,
	w: 500,
	h: 500,
	nm: '@forresto/movie-to-lottie',
	ddd: 0,
	assets: [
		{
			id: 'fr_0',
			w: 500,
			h: 500,
			u: '',
			p: 'new-logo.png',
			e: 0,
		},
	],
	layers: [
		{
			ddd: 0,
			ind: 1,
			ty: 2,
			nm: 'fr_0.jpg',
			cl: 'jpg',
			refId: 'fr_0',
			sr: 1,
			ks: {
				o: {a: 0, k: 100, ix: 11},
				r: {a: 0, k: 0, ix: 10},
				p: {a: 0, k: [250, 250, 0], ix: 2},
				a: {a: 0, k: [250, 250, 0], ix: 1},
				s: {a: 0, k: [100, 100, 100], ix: 6},
			},
			ao: 0,
			ip: 0,
			op: 1,
			st: 0,
			bm: 0,
		},
	],
	markers: [],
};

const ImageInLottie = () => {
	const {height, width} = useVideoConfig();

	return (
		<AbsoluteFill style={{height, width}}>
			<Lottie
				loop
				assetsPath={staticFile('lottie/')}
				animationData={lottie}
				playbackRate={10}
				style={{height: 200}}
			/>
		</AbsoluteFill>
	);
};

export default ImageInLottie;
