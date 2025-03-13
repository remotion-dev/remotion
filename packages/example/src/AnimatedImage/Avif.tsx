import {StudioInternals} from '@remotion/studio';
import {AbsoluteFill, AnimatedImage, staticFile} from 'remotion';

const Comp = () => {
	return (
		<AbsoluteFill className="bg-white justify-center items-center flex flex-row gap-20">
			<div className="flex flex-col items-center gap-8">
				<AnimatedImage
					className="h-96 inline-block rounded-2xl outline outline-4 outline-black"
					src="https://colinbendell.github.io/webperf/animated-gif-decode/2.avif"
				/>
				<div className="text-7xl font-sans font-bold">AVIF</div>
			</div>
			<div className="flex flex-col items-center gap-8">
				<AnimatedImage
					className="h-96 inline-block rounded-2xl outline outline-4 outline-black"
					src="https://mathiasbynens.be/demo/animated-webp-supported.webp"
				/>
				<div className="text-7xl font-sans font-bold">WebP</div>
			</div>
			<div className="flex flex-col items-center gap-8">
				<AnimatedImage
					className="h-96 inline-block rounded-2xl outline outline-4 outline-black"
					src={staticFile('giphy.gif')}
				/>
				<div className="text-7xl font-sans font-bold">GIF</div>
			</div>
			<div className="flex flex-col items-center gap-8">
				<AnimatedImage
					className="h-96 inline-block rounded-2xl outline outline-8 outline-[#0B84F3]"
					src={staticFile('animated-png.png')}
				/>
				<div className="text-7xl font-sans font-bold">APNG</div>
			</div>
		</AbsoluteFill>
	);
};

export const AnimatedImages = StudioInternals.createComposition({
	component: Comp,
	id: 'animated-images',
	width: 2400,
	height: 1080,
	durationInFrames: 200,
	fps: 30,
});
