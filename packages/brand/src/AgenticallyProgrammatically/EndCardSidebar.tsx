import {loadFont} from '@remotion/fonts';
import {Audio} from '@remotion/media';
import type {ReactNode} from 'react';
import {
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';

export const publicationPlatformSchema = z.enum(['youtube', 'linkedin', 'x']);
export type PublicationPlatform = z.infer<typeof publicationPlatformSchema>;
export const publicationPlatformControl = {
	type: 'enum',
	default: 'youtube',
	variants: {youtube: {}, linkedin: {}, x: {}},
} as const;

loadFont({
	family: 'Here GT Planar',
	url: 'https://remotion.media/agentically-programmatically/gt-planar-medium-99485baca015.woff2',
	weight: '500',
});

export const EndCardPresenter = ({
	children,
}: {
	readonly children: ReactNode;
}) => {
	const frame = useCurrentFrame();
	return (
		<Interactive.Div
			name="Presenter beside the end card"
			style={{
				position: 'absolute',
				inset: 0,
				translate: interpolate(frame, [906, 924], ['0px 0px', '-470px 0px'], {
					easing: Easing.bezier(0.42, 0, 0.58, 1),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			}}
		>
			{children}
		</Interactive.Div>
	);
};

export const EndCardCaptions = ({children}: {readonly children: ReactNode}) => {
	const frame = useCurrentFrame();
	return (
		<Interactive.Div
			name="Captions beside the end card"
			style={{
				position: 'absolute',
				inset: 0,
				zIndex: 2,
				transformOrigin: '960px 1000px',
				scale: interpolate(frame, [906, 924], [1, 0.82], {
					easing: Easing.bezier(0.42, 0, 0.58, 1),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					output: 'perceptual-scale',
				}),
				translate: interpolate(frame, [906, 924], ['0px 0px', '-420px 0px'], {
					easing: Easing.bezier(0.42, 0, 0.58, 1),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			}}
		>
			{children}
		</Interactive.Div>
	);
};

const EndCardLink = ({
	name,
	children,
	iconPath,
	viewBox,
	iconHeight,
	indexFromLast,
}: {
	readonly name: string;
	readonly children: ReactNode;
	readonly iconPath: string;
	readonly viewBox: string;
	readonly iconHeight: number;
	readonly indexFromLast: number;
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<Interactive.Div
			name={name}
			style={{
				display: 'flex',
				alignItems: 'center',
				padding: '20px 0',
				gap: 50,
				opacity:
					indexFromLast === 1
						? spring({
								fps,
								frame,
								config: {damping: 200},
								delay: 35,
								durationInFrames: 15,
							})
						: interpolate(
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
					width: 140,
					height: 60,
				}}
			>
				<svg height={iconHeight} viewBox={viewBox}>
					<path fill="currentColor" d={iconPath} />
				</svg>
			</div>
			<div>{children}</div>
		</Interactive.Div>
	);
};

const YouTubeOutroMusic = () => {
	const frame = useCurrentFrame();
	return (
		<Audio
			name="Takiti hook — fade in and out"
			src="https://remotion.media/studio-update/takiti-instrumental-lawd-ito-adapted-2026-11-02-448ab724379d.wav"
			trimBefore={472}
			durationInFrames={300}
			volume={interpolate(frame, [0, 18, 269, 299], [0, 0.1, 0.1, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})}
		/>
	);
};

const EndCardSidebarContent = ({
	platform,
}: {
	readonly platform: PublicationPlatform;
}) => {
	const frame = useCurrentFrame();
	const cta = platform === 'youtube' ? 'Subscribe' : 'Follow';
	return (
		<>
			<Interactive.Div
				name={`${cta} and follow Remotion`}
				style={{
					position: 'absolute',
					right: 0,
					top: 0,
					width:
						platform === 'youtube'
							? interpolate(frame, [135, 159], [840, 1920], {
									easing: Easing.bezier(0.42, 0, 0.58, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								})
							: 840,
					height: '100%',
					zIndex: 1,
					backgroundColor: '#f8fafc',
					color: '#000000',
					fontFamily: 'Here GT Planar',
					fontWeight: 500,
					fontSize: 50,
					fontFeatureSettings: '"ss03" 1',
					translate: interpolate(frame, [0, 18], ['840px 0px', '0px 0px'], {
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 80,
						top: 0,
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
					}}
				>
					<Interactive.Div
						name="Call to action"
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 30,
							translate: interpolate(
								frame,
								[35, 65],
								['0px 281px', '0px 0px'],
								{
									easing: Easing.spring({damping: 200}),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
						}}
					>
						<CanvasImage
							name="Remotion channel avatar"
							src="https://remotion.media/elements/social-endcard-remotion-logo.png"
							width={140}
							height={140}
							style={{
								borderRadius: '50%',
								boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.2)',
							}}
						/>
						<Interactive.Div
							name={cta}
							style={{
								height: 140,
								width: 400,
								borderRadius: 70,
								backgroundColor: '#000000',
								color: '#ffffff',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							{cta}
						</Interactive.Div>
					</Interactive.Div>
					<div style={{height: 80}} />
					<EndCardLink
						name="Instagram"
						indexFromLast={4}
						iconHeight={70}
						viewBox="0 0 448 512"
						iconPath="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7 2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
					>
						@remotion
					</EndCardLink>
					{platform !== 'youtube' ? (
						<EndCardLink
							name="YouTube"
							indexFromLast={3}
							iconHeight={60}
							viewBox="0 0 576 512"
							iconPath="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"
						>
							@remotion_dev
						</EndCardLink>
					) : null}
					{platform !== 'linkedin' ? (
						<EndCardLink
							name="LinkedIn"
							indexFromLast={platform === 'youtube' ? 3 : 2}
							iconHeight={60}
							viewBox="0 0 448 512"
							iconPath="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"
						>
							Remotion
						</EndCardLink>
					) : null}
					{platform !== 'x' ? (
						<EndCardLink
							name="X"
							indexFromLast={2}
							iconHeight={60}
							viewBox="0 0 512 512"
							iconPath="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
						>
							@remotion
						</EndCardLink>
					) : null}
					<div style={{height: 80}} />
					<EndCardLink
						name="Website"
						indexFromLast={1}
						iconHeight={60}
						viewBox="0 0 640 512"
						iconPath="M580.2 267.3c56.2-56.2 56.2-147.4 0-203.6S432.8 7.4 376.6 63.7L365.3 75l45.3 45.3 11.3-11.3c31.2-31.2 81.9-31.2 113.1 0s31.2 81.9 0 113.1L421.8 335.2c-31.2 31.2-81.9 31.2-113.1 0c-25.6-25.6-30.3-64.3-13.8-94.6c1.8-3.4 3.9-6.7 6.3-9.8l-51.2-38.4c-4.3 5.7-8.1 11.6-11.4 17.8c-29.5 54.6-21.3 124.2 24.9 170.3c56.2 56.2 147.4 56.2 203.6 0L580.2 267.3zM59.8 244.7c-56.2 56.2-56.2 147.4 0 203.6s147.4 56.2 203.6 0L274.7 437l-45.3-45.3-11.3 11.3c-31.2 31.2-81.9 31.2-113.1 0s-31.2-81.9 0-113.1L218.2 176.8c31.2-31.2 81.9-31.2 113.1 0c25.6 25.6 30.3 64.3 13.8 94.6c-1.8 3.4-3.9 6.7-6.3 9.8l51.2 38.4c4.3-5.7 8.1-11.6 11.4-17.8c29.5-54.6 21.3-124.2-24.9-170.3c-56.2-56.2-147.4-56.2-203.6 0L59.8 244.7z"
					>
						remotion.dev
					</EndCardLink>
				</div>
				{platform === 'youtube' ? (
					<>
						<Interactive.Div
							name="Top recommended video"
							style={{
								position: 'absolute',
								top: 135,
								right: 100,
								width: 631,
								height: 361,
								border: '6px solid black',
								opacity: interpolate(frame, [159, 179], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
							}}
						/>
						<Interactive.Div
							name="Bottom recommended video"
							style={{
								position: 'absolute',
								bottom: 155,
								right: 100,
								width: 631,
								height: 361,
								border: '6px solid black',
								opacity: interpolate(frame, [167, 187], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
							}}
						/>
					</>
				) : null}
			</Interactive.Div>
			{platform === 'youtube' ? (
				<Sequence name="YouTube outro hook" from={135} durationInFrames={300}>
					<YouTubeOutroMusic />
				</Sequence>
			) : null}
		</>
	);
};

export const EndCardSidebar = Interactive.create({
	Component: EndCardSidebarContent,
	layout: 'absolute-fill',
	schema: {platform: publicationPlatformControl},
});
