import type {Caption} from '@remotion/captions';
import {Video} from '@remotion/media';
import {Interactive, useCurrentFrame, useVideoConfig} from 'remotion';
import {ReviewCaptions} from './ReviewCaptions';

export type SetupSceneProps = {
	readonly src: string;
	readonly stepIndex: number;
	readonly title: string;
	readonly detail: string;
	readonly sourceName: string;
	readonly sourceStartSeconds: number;
	readonly captions: Caption[];
};

const SourceClock = ({startSeconds}: {readonly startSeconds: number}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const sourceFrame = Math.round(startSeconds * fps) + frame;
	const minutes = Math.floor(sourceFrame / fps / 60);
	const seconds = Math.floor(sourceFrame / fps) % 60;
	const frames = sourceFrame % fps;

	return (
		<div
			style={{
				position: 'absolute',
				left: 24,
				top: 24,
				padding: '12px 16px',
				borderRadius: 8,
				backgroundColor: '#101419e6',
				fontFamily: 'SFMono-Regular, Menlo, monospace',
				fontSize: 24,
				fontVariantNumeric: 'tabular-nums',
				color: '#ffffff',
			}}
		>
			<span style={{color: '#b4bec7', marginRight: 16}}>SOURCE</span>
			{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}:
			{String(frames).padStart(2, '0')}
		</div>
	);
};

const SetupStep = ({
	index,
	activeIndex,
	children,
}: {
	readonly index: number;
	readonly activeIndex: number;
	readonly children: string;
}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 18,
			minHeight: 78,
			padding: '0 20px',
			borderRadius: 12,
			backgroundColor: index === activeIndex ? '#d6fa59' : '#181e25',
			color: index === activeIndex ? '#11170a' : '#bdc6d0',
		}}
	>
		<div
			style={{
				width: 34,
				flexShrink: 0,
				fontSize: 18,
				fontFamily: 'SFMono-Regular, Menlo, monospace',
				opacity: 0.7,
			}}
		>
			{String(index + 1).padStart(2, '0')}
		</div>
		<div style={{fontSize: 27, fontWeight: index === activeIndex ? 700 : 500}}>
			{children}
		</div>
	</div>
);

const SetupSceneInner = ({
	src,
	stepIndex,
	title,
	detail,
	sourceName,
	sourceStartSeconds,
	captions,
}: SetupSceneProps) => {
	const {fps} = useVideoConfig();

	return (
		<>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundColor: '#101419',
					color: '#f5f7fa',
					fontFamily: 'Arial, Helvetica, sans-serif',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 64,
						right: 64,
						top: 50,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						fontSize: 22,
						letterSpacing: 3,
						fontWeight: 700,
					}}
				>
					<div style={{color: '#d6fa59'}}>DISCO / SETUP</div>
					<div style={{color: '#96a3af', fontSize: 19, letterSpacing: 1}}>
						{sourceName}
					</div>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 64,
						top: 104,
						width: 1792,
						fontSize: 56,
						fontWeight: 700,
						letterSpacing: -1.5,
						lineHeight: 1.12,
					}}
				>
					{title}
				</div>
				<div
					style={{
						position: 'absolute',
						left: 64,
						top: 210,
						width: 1280,
						height: 720,
						overflow: 'hidden',
						borderRadius: 16,
						backgroundColor: '#000000',
					}}
				>
					<Video
						name="Setup source footage"
						src={src}
						trimBefore={Math.round(sourceStartSeconds * fps)}
						style={{width: '100%', height: '100%'}}
					/>
					<SourceClock startSeconds={sourceStartSeconds} />
				</div>
				<ReviewCaptions
					name="Working transcript"
					captions={captions}
					sourceStartSeconds={sourceStartSeconds}
				/>
				<div
					style={{
						position: 'absolute',
						left: 1392,
						top: 210,
						width: 464,
					}}
				>
					<div
						style={{
							color: '#96a3af',
							fontSize: 18,
							letterSpacing: 2,
							fontWeight: 700,
							marginBottom: 24,
						}}
					>
						CONNECTION ORDER
					</div>
					<div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
						<SetupStep index={0} activeIndex={stepIndex}>
							Laptop
						</SetupStep>
						<SetupStep index={1} activeIndex={stepIndex}>
							USB-C adapter
						</SetupStep>
						<SetupStep index={2} activeIndex={stepIndex}>
							ENTTEC USB to DMX
						</SetupStep>
						<SetupStep index={3} activeIndex={stepIndex}>
							3 → 5-pin converter
						</SetupStep>
						<SetupStep index={4} activeIndex={stepIndex}>
							First device
						</SetupStep>
						<SetupStep index={5} activeIndex={stepIndex}>
							Daisy chain devices
						</SetupStep>
						<SetupStep index={6} activeIndex={stepIndex}>
							DMX terminator
						</SetupStep>
					</div>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 64,
						top: 962,
						width: 1792,
						fontSize: 28,
						lineHeight: 1.4,
						color: '#b4bec7',
					}}
				>
					{detail}
				</div>
			</div>
		</>
	);
};

export const SetupScene = Interactive.create({
	Component: SetupSceneInner,
	layout: 'absolute-fill',
	schema: {
		...Interactive.captionsSchema,
		src: {
			type: 'asset',
			assetType: 'video',
			default: '',
			description: 'Source video',
		},
		stepIndex: {
			type: 'number',
			default: 0,
			min: 0,
			max: 6,
			integer: true,
			keyframable: false,
			hiddenFromList: false,
			description: 'Active setup step (0–6)',
		},
		title: {
			type: 'string',
			default: 'Get the laptop out',
			description: 'Scene title',
		},
		detail: {
			type: 'string',
			default: '',
			description: 'Scene notes',
		},
		sourceName: {
			type: 'string',
			default: '',
			description: 'Source recording label',
		},
		sourceStartSeconds: {
			type: 'number',
			default: 0,
			min: 0,
			step: 0.1,
			keyframable: false,
			hiddenFromList: false,
			description: 'Source in point (seconds)',
		},
	},
});
