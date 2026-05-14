import {Gif} from '@remotion/gif';
import {LightLeak} from '@remotion/light-leaks';
import {Audio, Video} from '@remotion/media';
import {Starburst} from '@remotion/starburst';
import React from 'react';
import {
	AbsoluteFill,
	Html5Audio,
	Html5Video,
	HtmlInCanvas,
	Img,
	Sequence,
	staticFile,
} from 'remotion';

const Tile: React.FC<{
	readonly title: string;
	readonly children: React.ReactNode;
}> = ({title, children}) => {
	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				border: '2px solid #333',
				borderRadius: 8,
				overflow: 'hidden',
				backgroundColor: '#111',
				minWidth: 0,
				minHeight: 0,
			}}
		>
			<div
				style={{
					padding: '8px 12px',
					fontFamily: 'monospace',
					fontSize: 16,
					color: '#fff',
					backgroundColor: '#222',
				}}
			>
				{title}
			</div>
			<div
				style={{
					flex: 1,
					position: 'relative',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					overflow: 'hidden',
				}}
			>
				{children}
			</div>
		</div>
	);
};

export const ExperimentalControlsShowcase: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black', padding: 16, gap: 16}}>
			<div style={{flex: 1, display: 'flex', flexDirection: 'row', gap: 16}}>
				<Tile title="Img">
					<Img
						src={staticFile('1.jpg')}
						style={{
							maxWidth: '100%',
							maxHeight: '100%',
							translate: '0px 93px',
							scale: 1.98,
						}}
					/>
				</Tile>
				<Tile title="Sequence">
					<Sequence
						durationInFrames={120}
						name="inner-sequence"
						style={{
							translate: '0px 66px',
							scale: 2.05,
						}}
					>
						<AbsoluteFill
							style={{
								backgroundColor: '#3344ff',
								color: 'white',
								fontFamily: 'sans-serif',
								fontSize: 40,
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							Sequence
						</AbsoluteFill>
					</Sequence>
				</Tile>
				<Tile title="HtmlInCanvas">
					<HtmlInCanvas
						width={400}
						height={300}
						style={{
							translate: '0px -124px',
							scale: 2.06,
							rotate: '48deg',
						}}
					>
						<div
							style={{
								width: 400,
								height: 300,
								backgroundColor: '#101728',
								color: 'white',
								fontFamily: 'sans-serif',
								fontSize: 32,
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							HtmlInCanvas
						</div>
					</HtmlInCanvas>
				</Tile>
				<Tile title="LightLeak">
					<AbsoluteFill style={{backgroundColor: 'black'}}>
						<LightLeak
							durationInFrames={120}
							seed={3}
							hueShift={30}
							style={{
								translate: '0px 81px',
								scale: 1.1,
							}}
						/>
					</AbsoluteFill>
				</Tile>
			</div>
			<div style={{flex: 1, display: 'flex', flexDirection: 'row', gap: 16}}>
				<Tile title="Starburst">
					<AbsoluteFill style={{backgroundColor: 'black'}}>
						<Starburst
							rays={16}
							colors={['#ffdd00', '#ff8800']}
							vignette={0.5}
						/>
					</AbsoluteFill>
				</Tile>
				<Tile title="Gif">
					<Gif
						src={staticFile('giphy.gif')}
						fit="contain"
						width={400}
						height={300}
						style={{
							translate: '0px 59px',
						}}
					/>
				</Tile>
				<Tile title="Video">
					<Video
						src={staticFile('bigbuckbunny.mp4')}
						style={{
							width: '100%',
							height: '100%',
							translate: '0px -27px',
						}}
						objectFit="contain"
					/>
				</Tile>
				<Tile title="Audio">
					<div
						style={{
							color: 'white',
							fontFamily: 'sans-serif',
							fontSize: 24,
							textAlign: 'center',
						}}
					>
						Audio (no visual)
						<Audio src={staticFile('music.mp3')} volume={1.29} />
					</div>
				</Tile>
				<Tile title="Sequence layout='none'">
					<Sequence name="layout='none'" layout={'none'}>
						hi
					</Sequence>
				</Tile>
			</div>
			<div style={{flex: 1, display: 'flex', flexDirection: 'row', gap: 16}}>
				<Tile title="Html5Video">
					<Html5Video
						src={staticFile('bigbuckbunny.mp4')}
						style={{
							width: '100%',
							height: '100%',
						}}
					/>
				</Tile>
				<Tile title="Html5Audio">
					<div
						style={{
							color: 'white',
							fontFamily: 'sans-serif',
							fontSize: 24,
							textAlign: 'center',
						}}
					>
						Html5Audio (no visual)
						<Html5Audio src={staticFile('music.mp3')} volume={1} />
					</div>
				</Tile>
			</div>
		</AbsoluteFill>
	);
};
