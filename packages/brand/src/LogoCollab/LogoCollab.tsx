import {
	AbsoluteFill,
	Img,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';

export const logoCollabSchema = z.object({
	partnerLogoUrl: z.string(),
	theme: z.enum(['light', 'dark']),
	partnerLogoScale: z.number().min(0.1).max(3).default(1),
	remotionLogoScale: z.number().min(0.1).max(3).default(1),
	partnerLogoX: z.number().min(-500).max(500).default(0),
	remotionLogoX: z.number().min(-500).max(500).default(0),
});

type LogoCollabProps = z.infer<typeof logoCollabSchema>;

const COLORS = {
	brand: '#0B84F3',
	light: {bg: '#FFFFFF', text: '#000000'},
	dark: {bg: '#2E2E2E', text: '#FFFFFF'},
};

const REMOTION_LOGO = {
	light: staticFile('logo/remotion/withtitle.png'),
	dark: staticFile('logo/remotion/withtitle-dark.png'),
};

export const LogoCollab: React.FC<LogoCollabProps> = ({
	partnerLogoUrl,
	theme,
	partnerLogoScale,
	remotionLogoScale,
	partnerLogoX,
	remotionLogoX,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const themeColors = COLORS[theme];

	const partnerDelay = 0;
	const plusDelay = 15;
	const remotionDelay = 25;

	const partnerProgress = spring({
		frame: frame - partnerDelay,
		fps,
		config: {damping: 200},
	});

	const plusProgress = spring({
		frame: frame - plusDelay,
		fps,
		config: {damping: 200},
	});

	const remotionProgress = spring({
		frame: frame - remotionDelay,
		fps,
		config: {damping: 200},
	});

	const logoHeight = 80;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: themeColors.bg,
				fontFamily: 'GTPlanar, sans-serif',
				fontFeatureSettings: "'ss03' 1",
			}}
		>
			<span
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					fontSize: 48,
					fontWeight: 500,
					color: COLORS.brand,
					opacity: plusProgress,
					lineHeight: 1,
				}}
			>
				+
			</span>

			<Img
				src={partnerLogoUrl}
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: `translate(calc(-100% - 50px + ${partnerLogoX}px), -50%) scale(${(0.9 + partnerProgress * 0.1) * partnerLogoScale})`,
					transformOrigin: 'right center',
					opacity: partnerProgress,
					height: logoHeight,
					objectFit: 'contain',
				}}
			/>

			<Img
				src={REMOTION_LOGO[theme]}
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: `translate(calc(50px + ${remotionLogoX}px), -50%) scale(${(0.9 + remotionProgress * 0.1) * remotionLogoScale})`,
					transformOrigin: 'left center',
					opacity: remotionProgress,
					height: logoHeight,
					objectFit: 'contain',
				}}
			/>
		</AbsoluteFill>
	);
};
