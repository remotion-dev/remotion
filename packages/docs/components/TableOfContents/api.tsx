import React from 'react';
import {TableOfContents as AnimatedEmojiTableOfContents} from '../../docs/animated-emoji/TableOfContents';
import {TableOfContents as CaptionsTableOfContents} from '../../docs/captions/TableOfContents';
import {TableOfContents as EnableScssTableOfContents} from '../../docs/enable-scss/TableOfContents';
import {TableOfContents as FontsTableOfContents} from '../../docs/fonts-api/TableOfContents';
import {TableOfContents as InstallWhisperCppTableOfContents} from '../../docs/install-whisper-cpp/install-whisper-cpp';
import {TableOfContents as LicensingTableOfContents} from '../../docs/licensing/TableOfContents';
import {TableOfContents as MediaParserTableOfContents} from '../../docs/media-parser/TableOfContents';
import {TableOfContents as OpenAiWhisperTableOfContents} from '../../docs/openai-whisper/TableOfContents';
import {PlayerTableOfContents} from '../../docs/player/TableOfContents';
import {TableOfContents as SkiaTableOfContents} from '../../docs/skia/TableOfContents';
import {TableOfContents as StudioTableOfContents} from '../../docs/studio/TableOfContents';
import {TableOfContents as TailwindV4TableOfContents} from '../../docs/tailwind-v4/TableOfContents';
import {TableOfContents as TailwindTableOfContents} from '../../docs/tailwind/TableOfContents';
import {TableOfContents as ThreeTableOfContents} from '../../docs/three/TableOfContents';
import {TableOfContents as WebcodecsTableOfContents} from '../../docs/webcodecs/TableOfContents';
import {TableOfContents as AnimationUtilsTableOfContents} from '../TableOfContents/animation-utils';
import {TableOfContents as BundlerTableOfContents} from '../TableOfContents/bundler';
import {TableOfContents as CloudrunTableOfContents} from '../TableOfContents/cloudrun';
import {TableOfContents as GifTableOfContents} from '../TableOfContents/gif';
import {TableOfContents as GoogleFontsTableOfContents} from '../TableOfContents/google-fonts';
import {TableOfContents as LambdaTableOfContents} from '../TableOfContents/lambda';
import {TableOfContents as LayoutUtilsTableOfContents} from '../TableOfContents/LayoutUtils';
import {TableOfContents as LottieTableOfContents} from '../TableOfContents/lottie';
import {TableOfContents as MediaUtilsTableOfContents} from '../TableOfContents/media-utils';
import {TableOfContents as MotionBlurTableOfContents} from '../TableOfContents/motion-blur';
import {TableOfContents as NoiseTableOfContents} from '../TableOfContents/noise';
import {TableOfContents as PathsTableOfContents} from '../TableOfContents/paths';
import {TableOfContents as PreloadTableOfContents} from '../TableOfContents/preload';
import {TableOfContents as RemotionTableOfContents} from '../TableOfContents/remotion';
import {TableOfContents as RendererTableOfContents} from '../TableOfContents/renderer';
import {TableOfContents as RiveTableOfContents} from '../TableOfContents/rive';
import {TableOfContents as ShapesTableOfContents} from '../TableOfContents/shapes';
import {TableOfContents as TransitionsTableOfContents} from '../TableOfContents/transitions';
import {TableOfContents as ZodTypesTableOfContents} from '../TableOfContents/zod-types';
import {Grid} from './Grid';
import {TOCItem} from './TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/cli">
					<strong>Command line</strong>
					<div>
						Reference for the <code>npx remotion</code> commands
					</div>
				</TOCItem>
				<TOCItem link="/docs/config">
					<strong>Configuration file</strong>
					<div>
						Reference for the <code>remotion.config.ts</code> file
					</div>
				</TOCItem>
			</Grid>
			<h2>remotion</h2>
			<p>
				Core APIs: <code>useCurrentFrame()</code>, <code>interpolate()</code>,
				etc.
			</p>
			<RemotionTableOfContents />
			<h2>@remotion/bundler</h2>
			<p>Create a Webpack bundle from Node.JS </p>
			<BundlerTableOfContents />
			<h2>@remotion/player</h2>
			<p>Play a Remotion video in the browser.</p>
			<PlayerTableOfContents />
			<h2>@remotion/lambda</h2>
			<p>Render videos and stills on AWS Lambda</p>
			<LambdaTableOfContents />
			<h2>@remotion/cloudrun</h2>
			<p>Render videos and stills on GCP Cloud Run</p>
			<CloudrunTableOfContents />
			<h2>@remotion/captions</h2>
			<p>Common operations for subtitles.</p>
			<CaptionsTableOfContents />
			<h2>@remotion/gif</h2>
			<p>Include a GIF in your video.</p>
			<GifTableOfContents />
			<h2>@remotion/media-utils</h2>
			<p>Obtain info about video and audio.</p>
			<MediaUtilsTableOfContents />
			<h2>@remotion/animation-utils</h2>
			<p>Obtain info about video and audio.</p>
			<AnimationUtilsTableOfContents />
			<h2>@remotion/tailwind</h2>
			<p>Webpack override for using TailwindCSS v3</p>
			<TailwindTableOfContents />
			<h2>@remotion/tailwind-v4</h2>
			<p>Webpack override for using TailwindCSS v4</p>
			<TailwindV4TableOfContents />
			<h2>@remotion/enable-scss</h2>
			<p>Webpack override for enabling SASS/SCSS</p>
			<EnableScssTableOfContents />
			<h2>@remotion/three</h2>
			<p>Create 3D videos using React Three Fiber</p>
			<ThreeTableOfContents />
			<h2>@remotion/skia</h2>
			<p>Low-level graphics using React Native Skia</p>
			<SkiaTableOfContents />
			<h2>@remotion/lottie</h2>
			<p>Include a Lottie animation in your video</p>
			<LottieTableOfContents apisOnly />
			<h2>@remotion/preload</h2>
			<p>Preload media for the Player</p>
			<PreloadTableOfContents />
			<h2>@remotion/renderer</h2>
			<p>Render video, audio and stills from Node.JS or Bun</p>
			<RendererTableOfContents />
			<h2>@remotion/paths</h2>
			<p>Manipulate and obtain info about SVG paths</p>
			<PathsTableOfContents />
			<h2>@remotion/noise</h2>
			<p>Generate noise effects</p>
			<NoiseTableOfContents />
			<h2>@remotion/shapes</h2>
			<p>Generate SVG shapes</p>
			<ShapesTableOfContents />
			<h2>@remotion/studio</h2>
			<p>APIs for controlling theRemotion Studio</p>
			<StudioTableOfContents />
			<h2>@remotion/transitions</h2>
			<p>Transition between scenes</p>
			<TransitionsTableOfContents apisOnly />
			<h2>@remotion/layout-utils</h2>
			<p>Layout helpers</p>
			<LayoutUtilsTableOfContents />
			<h2>@remotion/install-whisper-cpp</h2>
			<p>Whisper.cpp installation and transcription</p>
			<InstallWhisperCppTableOfContents />
			<h2>@remotion/openai-whisper</h2>
			<p>Work with transcriptions from OpenAI Whisper</p>
			<OpenAiWhisperTableOfContents />
			<h2>@remotion/animated-emoji</h2>
			<p>Google Fonts Animated Emojis as Remotion Components</p>
			<AnimatedEmojiTableOfContents />
			<h2>@remotion/google-fonts</h2>
			<p>Load Google Fonts onto a page.</p>
			<GoogleFontsTableOfContents />
			<h2>@remotion/rive</h2>
			<p>Embed Rive animations in Remotion</p>
			<RiveTableOfContents />
			<h2>@remotion/zod-types</h2>
			<p>Zod types enabling Remotion Studio UI</p>
			<ZodTypesTableOfContents />
			<h2>@remotion/motion-blur</h2>
			<p>Apply motion blur effects to components</p>
			<MotionBlurTableOfContents />
			<h2>@remotion/fonts</h2>
			<p>Load font files onto a page.</p>
			<FontsTableOfContents />
			<h2>@remotion/media-parser</h2>
			<p>A pure JavaScript library for parsing video files</p>
			<MediaParserTableOfContents />
			<h2>@remotion/webcodecs</h2>
			<p>Converting media using WebCodecs</p>
			<WebcodecsTableOfContents />
			<h2>@remotion/licensing</h2>
			<p>Report and query company license usage</p>
			<LicensingTableOfContents />
		</div>
	);
};
