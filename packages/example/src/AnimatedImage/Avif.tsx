import {AbsoluteFill, AnimatedImage, staticFile} from 'remotion';

export const AnimatedImages = () => {
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
		</AbsoluteFill>
	);
};
