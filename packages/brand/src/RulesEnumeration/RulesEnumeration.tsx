import {
	AbsoluteFill,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
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

const ruleSchema = z.object({
	title: z.string(),
	description: z.string(),
});

export const rulesEnumerationSchema = z.object({
	heading: z.string(),
	rules: z.array(ruleSchema).min(1).max(5),
	theme: z.enum(['light', 'dark']),
});

type RulesEnumerationProps = z.infer<typeof rulesEnumerationSchema>;

const COLORS = {
	brand: '#0B84F3',
	white: '#FFFFFF',
	black: '#000000',
	darkBg: '#2E2E2E',
} as const;

const FONT_STYLE = {
	fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
	fontFeatureSettings: "'ss03' 1",
} as const;

const getThemeColors = (theme: 'light' | 'dark') => ({
	bg: theme === 'dark' ? COLORS.darkBg : COLORS.white,
	text: theme === 'dark' ? COLORS.white : COLORS.black,
	cardBg: theme === 'dark' ? '#3A3A3A' : COLORS.white,
});

const NumberBadge = ({
	number,
	progress,
}: {
	readonly number: number;
	readonly progress: number;
}) => {
	const scale = progress;
	const opacity = progress;

	return (
		<div
			style={{
				width: 48,
				height: 48,
				borderRadius: '50%',
				backgroundColor: COLORS.brand,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				transform: `scale(${scale})`,
				opacity,
				flexShrink: 0,
			}}
		>
			<span
				style={{
					...FONT_STYLE,
					fontSize: 24,
					fontWeight: 700,
					color: COLORS.white,
					lineHeight: 1,
				}}
			>
				{number}
			</span>
		</div>
	);
};

const RuleCard = ({
	number,
	title,
	description,
	progress,
	theme,
}: {
	readonly number: number;
	readonly title: string;
	readonly description: string;
	readonly progress: number;
	readonly theme: 'light' | 'dark';
}) => {
	const colors = getThemeColors(theme);
	const slideDistance = 40;
	const cardOpacity = progress;
	const cardTranslateY = (1 - progress) * slideDistance;

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				gap: 20,
				opacity: cardOpacity,
				transform: `translateY(${cardTranslateY}px)`,
			}}
		>
			<NumberBadge number={number} progress={progress} />
			<div
				style={{
					backgroundColor: colors.cardBg,
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					gap: 8,
				}}
			>
				<span
					style={{
						...FONT_STYLE,
						fontSize: 32,
						fontWeight: 700,
						color: colors.text,
						lineHeight: 1.2,
						textDecoration: 'none',
					}}
				>
					{title}
				</span>
				<span
					style={{
						...FONT_STYLE,
						fontSize: 22,
						fontWeight: 500,
						color: colors.text,
						opacity: 0.6,
						lineHeight: 1.4,
					}}
				>
					{description}
				</span>
			</div>
		</div>
	);
};

const Heading = ({
	text,
	progress,
	theme,
}: {
	readonly text: string;
	readonly progress: number;
	readonly theme: 'light' | 'dark';
}) => {
	const colors = getThemeColors(theme);
	const slideDistance = 30;

	return (
		<div
			style={{
				opacity: progress,
				transform: `translateY(${(1 - progress) * slideDistance}px)`,
			}}
		>
			<span
				style={{
					...FONT_STYLE,
					fontSize: 64,
					fontWeight: 700,
					color: colors.text,
					lineHeight: 1.1,
				}}
			>
				{text}
			</span>
		</div>
	);
};

export const RulesEnumeration: React.FC<RulesEnumerationProps> = ({
	heading,
	rules,
	theme,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const colors = getThemeColors(theme);

	const headingDelay = 0;
	const ruleBaseDelay = 20;
	const ruleStaggerDelay = 12;

	const headingProgress = spring({
		frame: frame - headingDelay,
		fps,
		config: {damping: 200},
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: colors.bg,
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				padding: 120,
				gap: 120,
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
					width: 320,
					flexShrink: 0,
				}}
			>
				<Heading text={heading} progress={headingProgress} theme={theme} />
			</div>

			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 48,
					flex: 1,
				}}
			>
				{rules.map((rule, index) => {
					const ruleProgress = spring({
						frame: frame - ruleBaseDelay - index * ruleStaggerDelay,
						fps,
						config: {damping: 200},
					});

					return (
						<RuleCard
							key={rule.title}
							number={index + 1}
							title={rule.title}
							description={rule.description}
							progress={ruleProgress}
							theme={theme}
						/>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
