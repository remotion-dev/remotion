import React from 'react';
import {Audio, Sequence} from 'remotion';
import {BigRotate} from '../BigRotate';
import {EndLogo} from '../Circle';
import {Layout} from '../Layout';
import {RealStickers} from '../RealStickers';
import {ScreenShowcase} from '../ScreenShowcase';
import {Springy} from '../Springy';
import {Title} from '../Title';
import {Transition} from '../Transition';

export const Welcome: React.FC<{
	theme: 'light' | 'dark';
}> = () => {
	const audio = require('./audio.mp4');

	const yourselfGetImage = (f: number) =>
		require('./stickerify-yourself/Untitled Frame ' + (f + 20) + '.png');
	const objectGetImage = (f: number) =>
		require('./stickerify-object/Untitled Frame ' + (f + 4) + '.png');
	const objectGetScroll = (f: number) =>
		require('./scroll-packs/Untitled Frame ' + (f + 1) + '.png');
	const objectGetThousands = (f: number) =>
		require('./thousands-packs/Untitled Frame ' + (f + 6) + '.png');
	const objectGetReorder = (f: number) =>
		require('./reorder-stickers/Untitled Frame ' + (f + 70) + '.png');
	const objectGetJuicy = (f: number) =>
		require('./juicy/Untitled Frame ' + (f + 1) + '.png');

	return (
		<div style={{flex: 1, display: 'flex', backgroundColor: 'white'}}>
			<Sequence from={0} durationInFrames={40}>
				<BigRotate />
			</Sequence>
			<Sequence from={40} durationInFrames={60}>
				<Title line1="Welcome to" line2="AnySticker" />
			</Sequence>
			<Sequence from={100} durationInFrames={70}>
				<Layout />
			</Sequence>
			<Sequence from={170} durationInFrames={80}>
				<Transition type="out">
					<ScreenShowcase
						title="Stickerize yourself"
						getImage={yourselfGetImage}
						animateIn
					/>
				</Transition>
			</Sequence>
			<Sequence from={250} durationInFrames={70}>
				<Transition type="in">
					<Transition type="out">
						<ScreenShowcase
							title="Stickerize anything"
							getImage={objectGetImage}
							animateIn={false}
						/>
					</Transition>
				</Transition>
			</Sequence>
			<Sequence from={320} durationInFrames={60}>
				<Transition type="in">
					<Transition type="out">
						<ScreenShowcase
							title="Explore sticker packs"
							getImage={objectGetScroll}
							animateIn={false}
						/>
					</Transition>
				</Transition>
			</Sequence>
			<Sequence from={380} durationInFrames={60}>
				<Transition type="in">
					<Transition type="out">
						<ScreenShowcase
							title="Thousands of stickers"
							getImage={objectGetThousands}
							animateIn={false}
						/>
					</Transition>
				</Transition>
			</Sequence>
			<Sequence from={440} durationInFrames={80}>
				<Transition type="in">
					<Transition type="out">
						<ScreenShowcase
							title="Collect stickers"
							getImage={objectGetReorder}
							animateIn={false}
						/>
					</Transition>
				</Transition>
			</Sequence>
			<Sequence from={520} durationInFrames={90}>
				<Transition type="in">
					<Transition type="out">
						<ScreenShowcase
							title="Share anywhere"
							getImage={objectGetJuicy}
							animateIn={false}
						/>
					</Transition>
				</Transition>
			</Sequence>
			<Sequence from={610} durationInFrames={90}>
				<RealStickers />
			</Sequence>
			<Sequence from={700} durationInFrames={70}>
				<Title line1="The power is" line2="in your hands." />
			</Sequence>
			<Sequence from={770} durationInFrames={100}>
				<Springy />
			</Sequence>
			<Sequence from={870} durationInFrames={75}>
				<EndLogo />
			</Sequence>
			<Audio src={audio} />
		</div>
	);
};

export default Welcome;
