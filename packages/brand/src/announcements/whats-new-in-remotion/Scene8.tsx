import {Video} from '@remotion/media';
import {AbsoluteFill, Sequence, interpolate, useVideoConfig} from 'remotion';
import {assetUrl} from './assets';
import {CodeBRoll} from './CodeBRoll';
import {SILENCES} from './Composition';
import {NumberedChapter} from './NumberedChapter';
import {SlideInOverlay, useSlideInProgress} from './SlideInOverlay';

const FILE = 'whats8.mov';

const CODE_BEFORE = `
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);
`.trim();

const CODE_AFTER = `
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);
Config.setExperimentalRspackEnabled(true);
`.trim();

export const Scene8: React.FC = () => {
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);

	const overlayProgress = useSlideInProgress({startAt: 0.5, holdDuration: 2.5});
	const videoX = interpolate(overlayProgress, [0, 1], [0, -20]);

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `translateX(${videoX}%)`}}>
				<Video
					src={assetUrl(FILE)}
					trimBefore={trimBefore}
					trimAfter={trimAfter}
				/>
			</AbsoluteFill>
			<SlideInOverlay startAt={0.5} holdDuration={2.5}>
				<NumberedChapter chapterNumber={7} chapterTitle="Rspack" />
			</SlideInOverlay>
			<Sequence from={180} durationInFrames={Math.round(4 * fps)} layout="none">
				<CodeBRoll
					code={CODE_AFTER}
					previousCode={CODE_BEFORE}
					lang="ts"
					durationSeconds={4}
					topExplainer="remotion.config.ts"
				/>
			</Sequence>
		</AbsoluteFill>
	);
};
