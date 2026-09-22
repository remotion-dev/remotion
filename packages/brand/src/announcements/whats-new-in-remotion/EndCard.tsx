import React from 'react';
import {
	Easing,
	Img,
	Interactive,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {assetUrl} from './assets';

export type EndCardPlatform = 'youtube' | 'x' | 'linkedin';

const YouTubeIcon: React.FC<{readonly height: number}> = ({height}) => (
	<svg height={height} viewBox="0 0 576 512">
		<path
			fill="black"
			d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"
		/>
	</svg>
);

const XIcon: React.FC<{readonly height: number}> = ({height}) => (
	<svg height={height} viewBox="0 0 512 512">
		<path
			fill="black"
			d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
		/>
	</svg>
);

const InstagramIcon: React.FC<{readonly height: number}> = ({height}) => (
	<svg height={height} viewBox="0 0 448 512">
		<path
			fill="black"
			d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
		/>
	</svg>
);

const LinkedInIcon: React.FC<{readonly height: number}> = ({height}) => (
	<svg height={height} viewBox="0 0 448 512">
		<path
			fill="black"
			d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"
		/>
	</svg>
);

export const EndCard: React.FC<{readonly platform: EndCardPlatform}> = ({
	platform,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<Interactive.Div
			name="Endcard"
			style={{
				backgroundColor: 'white',
				bottom: 0,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				left: 0,
				padding: 60,
				position: 'absolute',
				right: 0,
				top: 0,
			}}
		>
			<div
				style={{
					translate: interpolate(frame, [56, 86], ['0px 200px', '0px 0px'], {
						easing: Easing.spring({damping: 200}),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<div style={{alignItems: 'center', display: 'flex'}}>
					<Img
						name="Remotion avatar"
						src={assetUrl('remotion-avatar.png')}
						style={{
							borderRadius: '50%',
							boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.2)',
							height: 120,
							width: 120,
						}}
					/>
					<div style={{width: 24}} />
					<Interactive.Div
						name="Call to action button"
						style={{
							alignItems: 'center',
							backgroundColor: 'black',
							borderRadius: 60,
							color: 'white',
							display: 'flex',
							fontFamily: 'GT Planar',
							fontSize: 44,
							fontWeight: 400,
							height: 120,
							justifyContent: 'center',
							width: 340,
						}}
					>
						{platform === 'youtube' ? 'Subscribe' : 'Follow'}
					</Interactive.Div>
				</div>
				<div style={{height: 60}} />
				{platform === 'youtube' ? null : (
					<Interactive.Div
						name="YouTube channel"
						style={{
							alignItems: 'center',
							display: 'flex',
							opacity: spring({
								fps,
								frame,
								config: {damping: 200},
								delay: 66,
								durationInFrames: 15,
							}),
							paddingBottom: 16,
							paddingTop: 16,
						}}
					>
						<div
							style={{
								alignItems: 'center',
								display: 'flex',
								height: 50,
								justifyContent: 'center',
								width: 120,
							}}
						>
							<YouTubeIcon height={50} />
						</div>
						<div style={{width: 24}} />
						<div
							style={{
								color: 'black',
								fontFamily: 'GT Planar',
								fontSize: 42,
								fontWeight: 500,
							}}
						>
							@remotion_dev
						</div>
					</Interactive.Div>
				)}
				{platform === 'x' ? null : (
					<Interactive.Div
						name="X channel"
						style={{
							alignItems: 'center',
							display: 'flex',
							opacity: spring({
								fps,
								frame,
								config: {damping: 200},
								delay: platform === 'linkedin' ? 61 : 66,
								durationInFrames: 15,
							}),
							paddingBottom: 16,
							paddingTop: 16,
						}}
					>
						<div
							style={{
								alignItems: 'center',
								display: 'flex',
								height: 50,
								justifyContent: 'center',
								width: 120,
							}}
						>
							<XIcon height={50} />
						</div>
						<div style={{width: 24}} />
						<div
							style={{
								color: 'black',
								fontFamily: 'GT Planar',
								fontSize: 42,
								fontWeight: 500,
							}}
						>
							@remotion
						</div>
					</Interactive.Div>
				)}
				<Interactive.Div
					name="Instagram channel"
					style={{
						alignItems: 'center',
						display: 'flex',
						opacity: spring({
							fps,
							frame,
							config: {damping: 200},
							delay: platform === 'linkedin' ? 56 : 61,
							durationInFrames: 15,
						}),
						paddingBottom: 16,
						paddingTop: 16,
					}}
				>
					<div
						style={{
							alignItems: 'center',
							display: 'flex',
							height: 50,
							justifyContent: 'center',
							width: 120,
						}}
					>
						<InstagramIcon height={50} />
					</div>
					<div style={{width: 24}} />
					<div
						style={{
							color: 'black',
							fontFamily: 'GT Planar',
							fontSize: 42,
							fontWeight: 500,
						}}
					>
						@remotion
					</div>
				</Interactive.Div>
				{platform === 'linkedin' ? null : (
					<Interactive.Div
						name="LinkedIn channel"
						style={{
							alignItems: 'center',
							display: 'flex',
							opacity: spring({
								fps,
								frame,
								config: {damping: 200},
								delay: 56,
								durationInFrames: 15,
							}),
							paddingBottom: 16,
							paddingTop: 16,
						}}
					>
						<div
							style={{
								alignItems: 'center',
								display: 'flex',
								height: 50,
								justifyContent: 'center',
								width: 120,
							}}
						>
							<LinkedInIcon height={50} />
						</div>
						<div style={{width: 24}} />
						<div
							style={{
								color: 'black',
								fontFamily: 'GT Planar',
								fontSize: 42,
								fontWeight: 500,
							}}
						>
							Remotion
						</div>
					</Interactive.Div>
				)}
			</div>
		</Interactive.Div>
	);
};
