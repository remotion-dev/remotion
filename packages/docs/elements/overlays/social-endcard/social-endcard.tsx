import {fontFamily, loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

loadFont('normal', {
	weights: ['500'],
});

const LinkedInIcon: React.FC<{height: number}> = ({height}) => {
	return (
		<Interactive.Svg
			name="LinkedIn icon"
			height={height}
			viewBox="0 0 448 512"
			style={{translate: '0 -4px'}}
		>
			<path
				fill="currentColor"
				d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"
			/>
		</Interactive.Svg>
	);
};

const XIcon: React.FC<{height: number}> = ({height}) => {
	return (
		<Interactive.Svg name="X icon" height={height} viewBox="0 0 512 512">
			<path
				fill="currentColor"
				d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
			/>
		</Interactive.Svg>
	);
};

const LinkIcon: React.FC<{height: number}> = ({height}) => {
	return (
		<Interactive.Svg name="Website icon" height={height} viewBox="0 0 640 512">
			<path
				fill="currentColor"
				d="M580.2 267.3c56.2-56.2 56.2-147.4 0-203.6S432.8 7.4 376.6 63.7L365.3 75l45.3 45.3 11.3-11.3c31.2-31.2 81.9-31.2 113.1 0s31.2 81.9 0 113.1L421.8 335.2c-31.2 31.2-81.9 31.2-113.1 0c-25.6-25.6-30.3-64.3-13.8-94.6c1.8-3.4 3.9-6.7 6.3-9.8l-51.2-38.4c-4.3 5.7-8.1 11.6-11.4 17.8c-29.5 54.6-21.3 124.2 24.9 170.3c56.2 56.2 147.4 56.2 203.6 0L580.2 267.3zM59.8 244.7c-56.2 56.2-56.2 147.4 0 203.6s147.4 56.2 203.6 0L274.7 437l-45.3-45.3-11.3 11.3c-31.2 31.2-81.9 31.2-113.1 0s-31.2-81.9 0-113.1L218.2 176.8c31.2-31.2 81.9-31.2 113.1 0c25.6 25.6 30.3 64.3 13.8 94.6c-1.8 3.4-3.9 6.7-6.3 9.8l51.2 38.4c4.3-5.7 8.1-11.6 11.4-17.8c29.5-54.6 21.3-124.2-24.9-170.3c-56.2-56.2-147.4-56.2-203.6 0L59.8 244.7z"
			/>
		</Interactive.Svg>
	);
};

const InstagramIcon: React.FC<{height: number}> = ({height}) => {
	return (
		<Interactive.Svg
			name="Instagram icon"
			height={height}
			viewBox="0 0 448 512"
		>
			<path
				fill="currentColor"
				d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7 2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
			/>
		</Interactive.Svg>
	);
};

const SocialLink: React.FC<{
	children: React.ReactNode;
	icon: React.ReactNode;
	indexFromLast: number;
}> = ({children, icon, indexFromLast}) => {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				paddingTop: 20,
				paddingBottom: 20,
				opacity: interpolate(
					frame,
					[
						35 + ((indexFromLast - 1) / 4) * (30 - 15),
						50 + ((indexFromLast - 1) / 4) * (30 - 15),
					],
					[0, 1],
					{
						easing: Easing.spring({damping: 200}),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					height: 60,
					width: 140,
					translate: '0 4px',
				}}
			>
				{icon}
			</div>
			<div style={{width: 30}} />
			{children}
		</div>
	);
};

const WebsiteLink = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const opacity = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: 35,
		durationInFrames: 15,
	});

	return (
		<>
			<div style={{height: 80}} />
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					paddingTop: 20,
					paddingBottom: 20,
					opacity,
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						height: 60,
						width: 140,
						translate: '0 4px',
					}}
				>
					<LinkIcon height={60} />
				</div>
				<div style={{width: 30}} />
				<Interactive.Div
					name="Website"
					style={{
						fontSize: 50,
						fontFamily,
						fontWeight: 500,
						marginLeft: 20,
						color: 'black',
					}}
				>
					remotion.dev
				</Interactive.Div>
			</div>
		</>
	);
};

const SubscribeButton = () => {
	return (
		<Interactive.Div
			style={{
				height: 140,
				borderRadius: 70,
				width: 400,
				backgroundColor: 'black',
				color: 'white',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 50,
				fontFamily,
				fontWeight: 500,
			}}
			name="Subscribe button"
		>
			Subscribe
		</Interactive.Div>
	);
};

const Avatar = () => {
	return (
		<Img
			style={{
				height: 140,
				width: 140,
				borderRadius: '50%',
				boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.2)',
			}}
			src="https://remotion.media/elements/social-endcard-remotion-logo.png"
		/>
	);
};

const SubscribeCTA = () => {
	return (
		<div style={{display: 'inline-flex', alignItems: 'center'}}>
			<Avatar />
			<div style={{width: 30}} />
			<SubscribeButton />
		</div>
	);
};

const LeftSide = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			style={{
				display: 'flex',
				position: 'absolute',
				height: '100%',
				flexDirection: 'column',
				left: 80,
				justifyContent: 'center',
			}}
			showInTimeline={false}
		>
			<Interactive.Div
				name={'Call to action'}
				style={{
					display: 'inline-block',
					translate: interpolate(frame, [35, 65], ['0px 281px', '0px 0px'], {
						easing: Easing.spring({damping: 200}),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<SubscribeCTA />
			</Interactive.Div>
			<div style={{marginTop: 80}}>
				<Interactive.Div name="Instagram link">
					<SocialLink icon={<InstagramIcon height={70} />} indexFromLast={4}>
						<Interactive.Div
							name="Instagram handle"
							style={{
								fontSize: 50,
								fontFamily,
								fontWeight: 500,
								marginLeft: 20,
								color: 'black',
							}}
						>
							@remotion
						</Interactive.Div>
					</SocialLink>
				</Interactive.Div>
				<Interactive.Div name="LinkedIn link">
					<SocialLink icon={<LinkedInIcon height={60} />} indexFromLast={3}>
						<Interactive.Div
							name="LinkedIn name"
							style={{
								fontSize: 50,
								fontFamily,
								fontWeight: 500,
								marginLeft: 20,
								color: 'black',
							}}
						>
							Remotion
						</Interactive.Div>
					</SocialLink>
				</Interactive.Div>
				<Interactive.Div name="X link">
					<SocialLink icon={<XIcon height={60} />} indexFromLast={2}>
						<Interactive.Div
							name="X handle"
							style={{
								fontSize: 50,
								fontFamily,
								fontWeight: 500,
								marginLeft: 20,
								color: 'black',
							}}
						>
							@remotion
						</Interactive.Div>
					</SocialLink>
				</Interactive.Div>
				<WebsiteLink />
			</div>
		</Interactive.Div>
	);
};

export const YouTubeEndCard = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#FAFAFA'}} name="Container">
			<LeftSide />
			<Interactive.Div
				name="Top thumbnail"
				style={{
					position: 'absolute',
					top: 135,
					right: 100,
					width: 631,
					height: 361,
					border: '6px solid black',
				}}
			/>
			<Interactive.Div
				name="Bottom thumbnail"
				style={{
					position: 'absolute',
					right: 100,
					bottom: 155,
					width: 631,
					height: 361,
					border: '6px solid black',
				}}
			/>
		</AbsoluteFill>
	);
};
