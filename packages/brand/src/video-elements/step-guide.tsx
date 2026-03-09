import {
	AbsoluteFill,
	Img,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {Video} from '@remotion/media';
import {z} from 'zod';
import {loadFont} from '@remotion/fonts';

const fontFamily = 'GTPlanar';

loadFont({
	family: fontFamily,
	url: staticFile('GT Planar/GT-Planar-Medium.woff2'),
	weight: '500',
});

loadFont({
	family: fontFamily,
	url: staticFile('GT Planar/GT-Planar-Bold.woff2'),
	weight: '700',
});

export const stepGuideSchema = z.object({
	stepNumber: z.number().min(1).max(99),
	titleLine1: z.string(),
	titleLine2: z.string(),
	assetSrc: z.string().optional(),
	assetType: z.enum(['image', 'video']).optional(),
	assetPosition: z.enum(['left', 'right']),
});

type StepGuideProps = z.infer<typeof stepGuideSchema>;

const COLORS = {
	brand: '#0B84F3',
	white: '#FFFFFF',
	black: '#000000',
} as const;

const FONT_STYLE = {
	fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
	fontFeatureSettings: "'ss03' 1",
} as const;

const StepBadge = ({
	stepNumber,
	progress,
}: {
	readonly stepNumber: number;
	readonly progress: number;
}) => {
	const scale = progress;
	const opacity = progress;

	return (
		<div
			style={{
				width: 120,
				height: 120,
				borderRadius: '50%',
				backgroundColor: COLORS.brand,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				transform: `scale(${scale})`,
				opacity,
			}}
		>
			<span
				style={{
					...FONT_STYLE,
					fontSize: 64,
					fontWeight: 500,
					color: COLORS.white,
					lineHeight: 1,
				}}
			>
				{stepNumber}
			</span>
		</div>
	);
};

const StepTitle = ({
	line1,
	line2,
	progressLine1,
	progressLine2,
}: {
	readonly line1: string;
	readonly line2: string;
	readonly progressLine1: number;
	readonly progressLine2: number;
}) => {
	const slideDistance = 30;

	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
			<span
				style={{
					...FONT_STYLE,
					fontSize: 64,
					fontWeight: 700,
					color: COLORS.black,
					lineHeight: 1.1,
					opacity: progressLine1,
					transform: `translateY(${(1 - progressLine1) * slideDistance}px)`,
				}}
			>
				{line1}
			</span>
			<span
				style={{
					...FONT_STYLE,
					fontSize: 64,
					fontWeight: 700,
					color: COLORS.black,
					lineHeight: 1.1,
					opacity: progressLine2,
					transform: `translateY(${(1 - progressLine2) * slideDistance}px)`,
				}}
			>
				{line2}
			</span>
		</div>
	);
};

const AssetFrame = ({
	src,
	type,
	progress,
}: {
	readonly src: string;
	readonly type: 'image' | 'video';
	readonly progress: number;
}) => {
	const scale = 0.9 + progress * 0.1;
	const opacity = progress;

	const containerStyle: React.CSSProperties = {
		width: 580,
		height: 650,
		borderRadius: 16,
		overflow: 'hidden',
		boxShadow: '0 25px 80px rgba(0, 0, 0, 0.15)',
		transform: `scale(${scale})`,
		opacity,
		backgroundColor: COLORS.white,
	};

	const mediaStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	};

	return (
		<div style={containerStyle}>
			{type === 'image' ? (
				<Img src={src} style={mediaStyle} />
			) : (
				<Video src={src} style={mediaStyle} muted />
			)}
		</div>
	);
};

export const StepGuide: React.FC<StepGuideProps> = ({
	stepNumber,
	titleLine1,
	titleLine2,
	assetSrc,
	assetType,
	assetPosition,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const assetDelay = 0;
	const badgeDelay = 8;
	const titleLine1Delay = 15;
	const titleLine2Delay = 23;

	const assetProgress = spring({
		frame: frame - assetDelay,
		fps,
		config: {damping: 200},
	});

	const badgeProgress = spring({
		frame: frame - badgeDelay,
		fps,
		config: {damping: 15},
	});

	const titleLine1Progress = spring({
		frame: frame - titleLine1Delay,
		fps,
		config: {damping: 200},
	});

	const titleLine2Progress = spring({
		frame: frame - titleLine2Delay,
		fps,
		config: {damping: 200},
	});

	const hasAsset = assetSrc && assetType;
	const isAssetLeft = assetPosition === 'left';

	const assetElement = hasAsset ? (
		<AssetFrame src={assetSrc} type={assetType} progress={assetProgress} />
	) : null;

	const stepInfoElement = (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				gap: 40,
			}}
		>
			<StepBadge stepNumber={stepNumber} progress={badgeProgress} />
			<StepTitle
				line1={titleLine1}
				line2={titleLine2}
				progressLine1={titleLine1Progress}
				progressLine2={titleLine2Progress}
			/>
		</div>
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLORS.white,
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				gap: hasAsset ? 100 : 0,
				padding: 80,
			}}
		>
			{isAssetLeft ? (
				<>
					{assetElement}
					{stepInfoElement}
				</>
			) : (
				<>
					{stepInfoElement}
					{assetElement}
				</>
			)}
		</AbsoluteFill>
	);
};
