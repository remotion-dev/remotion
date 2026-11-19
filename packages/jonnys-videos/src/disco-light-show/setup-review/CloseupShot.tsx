import {Video} from '@remotion/media';
import {Interactive, useCurrentFrame, useVideoConfig} from 'remotion';

export type CloseupShotProps = {
	readonly src: string;
	readonly sourceStartSeconds: number;
	readonly sourceName: string;
	readonly title: string;
	readonly detail: string;
	readonly category: string;
};

const CloseupSourceClock = ({
	startSeconds,
	sourceName,
}: {
	readonly startSeconds: number;
	readonly sourceName: string;
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const sourceFrame = Math.round(startSeconds * fps) + frame;
	const totalSeconds = Math.floor(sourceFrame / fps);

	return (
		<div
			style={{
				position: 'absolute',
				left: 48,
				top: 40,
				padding: '16px 22px',
				borderRadius: 10,
				backgroundColor: '#101419ed',
				color: '#ffffff',
				fontFamily: 'SFMono-Regular, Menlo, monospace',
				fontSize: 24,
				fontVariantNumeric: 'tabular-nums',
				display: 'flex',
				alignItems: 'center',
				gap: 24,
			}}
		>
			<span style={{color: '#b4bec7'}}>{sourceName}</span>
			<span>
				{String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:
				{String(totalSeconds % 60).padStart(2, '0')}:
				{String(sourceFrame % fps).padStart(2, '0')}
			</span>
		</div>
	);
};

const CloseupShotInner = ({
	src,
	sourceStartSeconds,
	sourceName,
	title,
	detail,
	category,
}: CloseupShotProps) => {
	const {fps} = useVideoConfig();

	return (
		<>
			<Video
				name="Close-up source footage"
				src={src}
				trimBefore={Math.round(sourceStartSeconds * fps)}
				style={{width: '100%', height: '100%', backgroundColor: '#101419'}}
			/>
			<CloseupSourceClock
				startSeconds={sourceStartSeconds}
				sourceName={sourceName}
			/>
			<div
				style={{
					position: 'absolute',
					right: 48,
					top: 40,
					padding: '16px 22px',
					borderRadius: 10,
					backgroundColor: '#d6fa59',
					color: '#11170a',
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 22,
					fontWeight: 700,
					letterSpacing: 1,
				}}
			>
				{category}
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					padding: '80px 48px 38px',
					background:
						'linear-gradient(transparent, rgba(16, 20, 25, 0.92) 38%, #101419)',
					fontFamily: 'Arial, Helvetica, sans-serif',
					color: '#ffffff',
				}}
			>
				<div
					style={{
						fontSize: 50,
						fontWeight: 700,
						lineHeight: 1.1,
						letterSpacing: -1,
						marginBottom: 14,
					}}
				>
					{title}
				</div>
				<div style={{fontSize: 27, lineHeight: 1.3, color: '#bdc6d0'}}>
					{detail}
				</div>
			</div>
		</>
	);
};

export const CloseupShot = Interactive.create({
	Component: CloseupShotInner,
	layout: 'absolute-fill',
	schema: {
		src: {
			type: 'asset',
			assetType: 'video',
			default: '',
			description: 'Source video',
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
		sourceName: {
			type: 'string',
			default: '',
			description: 'Source recording',
		},
		title: {
			type: 'string',
			default: 'Setup detail',
			description: 'Shot title',
		},
		detail: {
			type: 'string',
			default: '',
			description: 'Shot notes',
		},
		category: {
			type: 'string',
			default: 'CLOSE-UP',
			description: 'Shot category',
		},
	},
});
