import {
	fontFamily as endcardFont,
	loadFont as loadEndcard,
} from '@remotion/google-fonts/Inter';
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

loadEndcard('normal', {
	weights: ['500'],
});

const LinkedInIcon: React.FC<{height: number}> = ({height}) => {
	return (
		<svg height={height} viewBox="0 0 448 512">
			<path
				fill="black"
				d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"
			/>
		</svg>
	);
};

const YouTubeIcon: React.FC<{height: number}> = ({height}) => {
	return (
		<svg height={height} viewBox="0 0 576 512">
			<path
				fill="black"
				d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"
			/>
		</svg>
	);
};

const LinkIcon: React.FC<{height: number}> = ({height}) => {
	return (
		<svg height={height} viewBox="0 0 640 512">
			<path
				fill="black"
				d="M580.2 267.3c56.2-56.2 56.2-147.4 0-203.6S432.8 7.4 376.6 63.7L365.3 75l45.3 45.3 11.3-11.3c31.2-31.2 81.9-31.2 113.1 0s31.2 81.9 0 113.1L421.8 335.2c-31.2 31.2-81.9 31.2-113.1 0c-25.6-25.6-30.3-64.3-13.8-94.6c1.8-3.4 3.9-6.7 6.3-9.8l-51.2-38.4c-4.3 5.7-8.1 11.6-11.4 17.8c-29.5 54.6-21.3 124.2 24.9 170.3c56.2 56.2 147.4 56.2 203.6 0L580.2 267.3zM59.8 244.7c-56.2 56.2-56.2 147.4 0 203.6s147.4 56.2 203.6 0L274.7 437l-45.3-45.3-11.3 11.3c-31.2 31.2-81.9 31.2-113.1 0s-31.2-81.9 0-113.1L218.2 176.8c31.2-31.2 81.9-31.2 113.1 0c25.6 25.6 30.3 64.3 13.8 94.6c-1.8 3.4-3.9 6.7-6.3 9.8l51.2 38.4c4.3-5.7 8.1-11.6 11.4-17.8c29.5-54.6 21.3-124.2-24.9-170.3c-56.2-56.2-147.4-56.2-203.6 0L59.8 244.7z"
			/>
		</svg>
	);
};

const InstagramIcon: React.FC<{height: number}> = ({height}) => {
	return (
		<svg height={height} viewBox="0 0 448 512">
			<path
				fill="black"
				d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7 2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
			/>
		</svg>
	);
};

const SocialLink: React.FC<{
	children: React.ReactNode;
	icon: React.ReactNode;
	indexFromLast: number;
}> = ({children, icon, indexFromLast}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const opacity = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: 35 + ((indexFromLast - 1) / 4) * (30 - 15),
		durationInFrames: 15,
	});

	return (
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
					}}
				>
					<LinkIcon height={60} />
				</div>
				<div style={{width: 30}} />
				<Interactive.Div
					name="Website"
					style={{
						fontSize: 50,
						fontFamily: endcardFont,
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

const FollowButton = () => {
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
				fontFamily: endcardFont,
				fontWeight: 500,
			}}
			name={'Follow button'}
		>
			{'Follow'}
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

const FollowCTA = () => {
	return (
		<div style={{display: 'inline-flex', alignItems: 'center'}}>
			<Avatar />
			<div style={{width: 30}} />
			<FollowButton />
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
				<FollowCTA />
			</Interactive.Div>
			<div style={{marginTop: 80}}>
				<SocialLink icon={<InstagramIcon height={70} />} indexFromLast={4}>
					<Interactive.Div
						name="Instagram handle"
						style={{
							fontSize: 50,
							fontFamily: endcardFont,
							fontWeight: 500,
							marginLeft: 20,
							color: 'black',
						}}
					>
						@remotion
					</Interactive.Div>
				</SocialLink>
				<SocialLink icon={<LinkedInIcon height={60} />} indexFromLast={3}>
					<Interactive.Div
						name="LinkedIn name"
						style={{
							fontSize: 50,
							fontFamily: endcardFont,
							fontWeight: 500,
							marginLeft: 20,
							color: 'black',
						}}
					>
						Remotion
					</Interactive.Div>
				</SocialLink>
				<SocialLink icon={<YouTubeIcon height={60} />} indexFromLast={2}>
					<Interactive.Div
						name="YouTube handle"
						style={{
							fontSize: 50,
							fontFamily: endcardFont,
							fontWeight: 500,
							marginLeft: 20,
							color: 'black',
						}}
					>
						@remotion_dev
					</Interactive.Div>
				</SocialLink>
				<WebsiteLink />
			</div>
		</Interactive.Div>
	);
};

export const SocialEndCard = () => {
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
