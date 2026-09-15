import {Composition, Folder} from 'remotion';
import {ThreeDCheck} from './3DCheck';
import {AnimatedBanner} from './animated-logo/AnimatedBanner';
import {AnimatedLogo} from './animated-logo/AnimatedLogo';
import {AnimatedLogoStringer} from './animated-logo/AnimatedLogoStinger';
import {WhatsNewInRemotion} from './announcements/whats-new-in-remotion/Root';
import {AppIcons} from './AppIcons';
import {
	ApplicationRenderButton,
	ApplicationSimpleApp,
	ApplicationVideoEditor,
	Applications,
} from './Applications';
import {Banner} from './Brand/Banner';
import {Comp} from './Brand/Composition';
import {TriangleDemo} from './Brand/TriangleToSquare';
import {CanvasCaptureAnnouncement} from './CanvasCaptureAnnouncement/CanvasCaptureAnnouncement';
import {CanvasCaptureShort} from './CanvasCaptureShort/CanvasCaptureShort';
import {CloseUp1} from './CloseUp1';
import {CloseUp2} from './CloseUp2';
import {CloseUp3} from './CloseUp3';
import {CloseUp4} from './CloseUp4';
import {CloseUp5} from './CloseUp5';
import {CloseUp6} from './CloseUp6';
import {CloseUp7} from './CloseUp7';
import {CloseUp8} from './CloseUp8';
import {CloseUpsSeries} from './CloseUpsSeries';
import {
	WhatIsRemotion,
	whatIsRemotionCalculateMetadata,
	whatIsRemotionSchema,
} from './Compose/WhatIsRemotion';
import {DesignSystems, designSystemsDurationInFrames} from './DesignSystems';
import {
	DesignSystemsResponsive,
	designSystemsResponsiveDurationInFrames,
} from './DesignSystemsResponsive';
import {
	DocsPagesShowcase,
	INSTAGRAM_POST_HEIGHT,
	INSTAGRAM_POST_WIDTH,
	calculateDocsPagesShowcaseMetadata,
	docsPagesShowcaseDefaultProps,
	docsPagesShowcaseSchema,
} from './DocsPagesShowcase';
import {
	CornerPinEffectShowcase,
	cornerPinEffectShowcaseDurationInFrames,
} from './effects/CornerPinEffectShowcase';
import {EffectsAnnouncement} from './effects/EffectsAnnouncement';
import {
	HEIGHT as EFFECT_SHOWCASE_HEIGHT,
	WIDTH as EFFECT_SHOWCASE_WIDTH,
} from './effects/EffectShowcaseScaffold';
import {BillboardForeground} from './effects/experiments/BillboardForeground';
import {FxIconComposition} from './effects/FxIconComposition';
import {Goal} from './effects/Goal';
import {MetallicSwirl} from './effects/MetallicSwirl';
import {NewsHeadline} from './effects/NewsHeadline';
import {
	PatternEffectShowcase,
	patternEffectShowcaseDurationInFrames,
} from './effects/PatternEffectShowcase';
import {
	RoughNotationShowcase,
	roughNotationShowcaseDurationInFrames,
} from './effects/RoughNotationShowcase';
import {
	StarburstEffectShowcase,
	starburstEffectShowcaseDurationInFrames,
} from './effects/StarburstEffectShowcase';
import {Thermometer} from './effects/Thermometer';
import {
	ZigzagLinearBlurShowcase,
	zigzagLinearBlurShowcaseDurationInFrames,
} from './effects/ZigzagLinearBlurShowcase';
import {EmailSignature} from './EmailSignature';
import {CodingPrompt, codingPromptSchema} from './HomepageAssets/CodingPrompt';
import {
	ExpertsGraphic,
	expertsGraphicDurationInFrames,
} from './HomepageAssets/ExpertsGraphic';
import {FolderTreeComposition} from './HomepageAssets/FolderTree';
import {LicenseQuestionsGraphic} from './HomepageAssets/LicenseQuestionsGraphic';
import {Map} from './HomepageAssets/Map';
import {
	HomepageAssetMaster,
	homepageAssetMasterDurationInFrames,
	homepageAssetMasterSchema,
} from './HomepageAssets/Master';
import {NpmIniVideo} from './HomepageAssets/NpmInitVideo/NpmInitVideo';
import {RemotionTriangleComposition} from './HomepageAssets/RemotionTriangle';
import {
	OuterRenderProgress,
	renderProgressDurationInFrames,
} from './HomepageAssets/RenderProgress';
import {OuterStudio, studioDurationInFrames} from './HomepageAssets/Studio';
import {TemplateRecorderEndcardComposition} from './HomepageAssets/TemplateRecorderEndcard';
import './index.css';
import {Logo} from './Logo';
import {LogoHorn, calculateLogoHornMetadata} from './LogoHorn';
import {PreviewToolbarIcons} from './PreviewToolbarIcons';
import {ProductHuntLogo} from './ScalingLogo';
import {SfxShowcase, sfxShowcaseDurationInFrames} from './Sfx/SfxShowcase';
import {ShipCard, shipCardDurationInFrames} from './ShipCard';
import {
	HTML_IN_CANVAS_ALL_EFFECTS_DURATION,
	HtmlInCanvasAllEffects,
	calculateHtmlInCanvasAllEffectsMetadata,
	htmlInCanvasAllEffectsDefaultProps,
	htmlInCanvasAllEffectsSchema,
} from './Showcase/HtmlInCanvasAllEffects';
import {
	Skills2AnnouncementComposition,
	skills2AnnouncementSchema,
} from './Skills2Announcement';
import {Skills2CodeChange} from './Skills2CodeChange';
import {Skills2CrazyContext} from './Skills2CrazyContext';
import {Skills2Gesture} from './Skills2Gesture';
import {Skills2Pick} from './Skills2Pick';
import {Skills2Router} from './Skills2Router';
import {Skills2TableBang} from './Skills2TableBang';
import {Skills2TableBangComp} from './Skills2TableBangComp';
import {SvgLogoCompositions} from './SvgLogos';
import {Codex} from './video-elements/Codex';
import {
	FlyingCardsLeft,
	flyingCardsLeftSchema,
} from './video-elements/flying-cards-left';
import {FlyingCardBottom} from './video-elements/FlyingCardBottom';
import {FlyingCards as VibeSkillsFlyingCards} from './video-elements/FlyingCards';
import {LowerReference} from './video-elements/lower-reference';
import {MoneyBurn} from './video-elements/money-burn';
import {
	NumberedChapter,
	numberedChapterSchema,
} from './video-elements/numbered-chapter';
import {Prompt, PromptSchema} from './video-elements/Prompt';
import {StepGuide, stepGuideSchema} from './video-elements/step-guide';
import {
	StudioDeviceFrame,
	StudioReference,
	studioReferenceSchema,
} from './video-elements/Studio';
import {StudioCodeHandoff} from './video-elements/StudioCodeHandoff';
import {TextEditor, textEditorSchema} from './video-elements/TextEditor';
import {GithubRepo, githubRepoSchema} from './video-elements/upper-reference';
import {UpperThird, upperThirdSchema} from './video-elements/UpperThird';
import {
	MacBookAppScene,
	MacBookDesktopScene,
	MacBookLoopScene,
	MacBookScene,
} from './WebMCPPromo/MacBookScene';
import {WebMCPPromo2} from './WebMCPPromo2';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Folder name="Logo">
				<Folder name="AnimatedLogo">
					<Composition
						component={AnimatedLogo}
						width={1080}
						height={1080}
						fps={30}
						durationInFrames={450}
						id="AnimatedLogo"
						defaultProps={{
							theme: 'light',
						}}
					/>
					<Composition
						component={AnimatedBanner}
						width={1080}
						height={500}
						fps={30}
						durationInFrames={60}
						id="AnimatedLogoBannerLight"
						defaultProps={{
							theme: 'light' as const,
						}}
					/>
					<Composition
						component={EmailSignature}
						width={500}
						height={160}
						fps={30}
						durationInFrames={80}
						id="EmailSignature"
					/>
					<Composition
						component={AnimatedBanner}
						width={1080}
						height={500}
						fps={30}
						durationInFrames={60}
						id="AnimatedLogoBannerDark"
						defaultProps={{
							theme: 'dark' as const,
						}}
					/>
					<Composition
						component={AnimatedLogoStringer}
						width={1920}
						height={1080}
						fps={30}
						durationInFrames={80}
						id="AnimatedLogoStinger"
					/>
				</Folder>
				<Composition
					component={Logo}
					width={820}
					height={820}
					fps={30}
					durationInFrames={1}
					id="Logo"
					defaultProps={{
						size: 1100,
					}}
				/>
				<Composition
					component={Logo}
					width={820}
					height={820}
					fps={30}
					durationInFrames={1}
					id="LogoWhite"
					defaultProps={{
						color: 'white',
						size: 1100,
					}}
				/>
				<SvgLogoCompositions />
				<Composition
					component={ProductHuntLogo}
					width={240}
					height={240}
					fps={30}
					durationInFrames={90}
					id="scaling-logo"
				/>
			</Folder>
			<Folder name="HomepageAssets">
				<Composition
					id="ExpertsGraphic"
					component={ExpertsGraphic}
					durationInFrames={expertsGraphicDurationInFrames}
					fps={30}
					width={1080}
					height={1080}
				/>
				<Composition
					id="LicenseQuestionsGraphic"
					component={LicenseQuestionsGraphic}
					durationInFrames={180}
					fps={30}
					width={1080}
					height={1080}
				/>
				<Composition
					id="NpmInitVideo"
					component={NpmIniVideo}
					durationInFrames={600}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="RenderProgress"
					component={OuterRenderProgress}
					durationInFrames={renderProgressDurationInFrames}
					fps={30}
					width={1080}
					height={1080}
				/>
				<Composition
					id="Studio"
					component={OuterStudio}
					durationInFrames={studioDurationInFrames}
					fps={25}
					width={1080}
					height={1080}
				/>
				<FolderTreeComposition />
				<RemotionTriangleComposition />
				<TemplateRecorderEndcardComposition />
				<Composition
					id="CodingPrompt"
					component={CodingPrompt}
					durationInFrames={120}
					fps={30}
					width={1920}
					height={1080}
					schema={codingPromptSchema}
					defaultProps={{
						promptLine1: 'Animate from',
						promptLine2: 'LA to NY',
					}}
				/>
				<Composition
					id="map"
					component={Map}
					durationInFrames={120}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="MakeVideosAgentically"
					component={HomepageAssetMaster}
					durationInFrames={homepageAssetMasterDurationInFrames}
					fps={30}
					width={1080}
					height={1080}
					schema={homepageAssetMasterSchema}
					defaultProps={{
						promptLine1: 'Animate from',
						promptLine2: 'LA to NY',
					}}
				/>
				<Composition
					id="WhatIsRemotion"
					component={WhatIsRemotion}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={273}
					schema={whatIsRemotionSchema}
					defaultProps={{fade: false, whiteBackground: false, reel: false}}
					calculateMetadata={whatIsRemotionCalculateMetadata}
				/>
				<Composition
					id="DesignSystems"
					component={DesignSystems}
					durationInFrames={designSystemsDurationInFrames}
					fps={30}
					width={1080}
					height={1080}
				/>
				<Composition
					id="DesignSystemsResponsive"
					component={DesignSystemsResponsive}
					durationInFrames={designSystemsResponsiveDurationInFrames}
					fps={30}
					width={1350}
					height={796}
				/>
				<Composition
					id="ApplicationSimpleApp"
					component={ApplicationSimpleApp}
					durationInFrames={240}
					fps={30}
					width={1080}
					height={1080}
				/>
				<Composition
					id="ApplicationVideoEditor"
					component={ApplicationVideoEditor}
					durationInFrames={240}
					fps={30}
					width={1080}
					height={1080}
				/>
				<Composition
					id="ApplicationRenderButton"
					component={ApplicationRenderButton}
					durationInFrames={240}
					fps={30}
					width={1080}
					height={1080}
				/>
				<Composition
					id="Applications"
					component={Applications}
					durationInFrames={180}
					fps={30}
					width={1080}
					height={1080}
				/>
			</Folder>

			<Folder name="Showcases">
				<Composition
					id="SoundEffectShowcases"
					component={SfxShowcase}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={sfxShowcaseDurationInFrames}
				/>
				<Composition
					id="HtmlInCanvasTransitions"
					component={HtmlInCanvasAllEffects}
					fps={30}
					height={1080}
					width={1920}
					durationInFrames={HTML_IN_CANVAS_ALL_EFFECTS_DURATION}
					schema={htmlInCanvasAllEffectsSchema}
					defaultProps={htmlInCanvasAllEffectsDefaultProps}
					calculateMetadata={calculateHtmlInCanvasAllEffectsMetadata}
				/>
			</Folder>

			<Folder name="VideoElements">
				<Composition
					id="StudioCodeHandoff"
					component={StudioCodeHandoff}
					durationInFrames={240}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="CodexUI"
					component={Codex}
					durationInFrames={1}
					fps={30}
					width={1193}
					height={1040}
				/>
				<Composition
					id="TextEditorUI"
					component={TextEditor}
					durationInFrames={1}
					fps={30}
					width={1399}
					height={1362}
					schema={textEditorSchema}
					defaultProps={{
						code: `import {Video} from '@remotion/media';
import {interpolate, useVideoConfig} from 'remotion';
import {assetUrl} from './assets';
import {SILENCES} from './Composition';
import type {EndCardPlatform} from './EndCard';
import {EndCard} from './EndCard';
import {SlideInOverlay, useSlideInProgress} from './SlideInOverlay';

const FILE = 'whats11.mov';

export const Scene11: React.FC<{platform: EndCardPlatform}> = ({platform}) => {
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);
	const sceneDuration = silence.trailingStart - silence.leadingEnd;

	const overlayStartAt = sceneDuration - 7 - 1;
	const overlayProgress = useSlideInProgress({
		startAt: overlayStartAt,
		holdDuration: 9999,
	});
	const videoX = interpolate(overlayProgress, [0, 1], [0, -20]);

	return (
		<>
			<Video
				style={{transform: \`translateX(\${videoX}%)\`}}
				src={assetUrl(FILE)}
				trimBefore={trimBefore}
				trimAfter={trimAfter}
			/>
			<SlideInOverlay startAt={overlayStartAt} holdDuration={9999}>
				<EndCard platform={platform} />
			</SlideInOverlay>
		</>
	);
};
`,
						fileName: 'Scene11.tsx',
						height: 1362,
						highlightedLines: '39',
						width: 1399,
					}}
					calculateMetadata={({props}) => ({height: props.height, width: props.width})}
				/>
				<Composition
					id="StudioUI"
					component={StudioReference}
					durationInFrames={742}
					fps={30}
					width={1600}
					height={900}
					schema={studioReferenceSchema}
					defaultProps={{
						viewportWidth: 1600,
						responsivenessProgress: 0,
					}}
					calculateMetadata={({props}) => ({width: props.viewportWidth})}
				/>
				<Composition
					id="StudioUIDeviceFrame"
					component={StudioDeviceFrame}
					durationInFrames={742}
					fps={30}
					width={1920}
					height={1080}
					schema={studioReferenceSchema}
					defaultProps={{
						viewportWidth: 1600,
						responsivenessProgress: 0,
					}}
				/>
				<Composition
					id="StepGuide"
					component={StepGuide}
					schema={stepGuideSchema}
					defaultProps={{
						stepNumber: 1,
						titleLine1: 'Setting up the project',
						titleLine2: '',
						assetSrc:
							'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=800&fit=crop',
						assetPosition: 'left' as const,
					}}
					durationInFrames={90}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="YouTubeReference"
					component={LowerReference}
					durationInFrames={5 * 30}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="GitHubRepoReference"
					component={GithubRepo}
					schema={githubRepoSchema}
					defaultProps={{
						repoName: 'remotion-dev/remotion',
					}}
					durationInFrames={5 * 30}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="UpperThird"
					component={UpperThird}
					schema={upperThirdSchema}
					defaultProps={{
						title: 'Title',
						subtitle: 'remotion.dev',
					}}
					durationInFrames={5 * 30}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="NumberedChapter"
					component={NumberedChapter}
					schema={numberedChapterSchema}
					defaultProps={{
						chapterNumber: 1,
						chapterTitle: 'Chapter Title',
					}}
					durationInFrames={36}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="MoneyBurn"
					component={MoneyBurn}
					durationInFrames={36}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Prompt"
					component={Prompt}
					durationInFrames={210}
					fps={30}
					width={1920}
					height={1080}
					schema={PromptSchema}
					defaultProps={{
						prompt: 'Use Remotion Best Practices.',
						thinkingIndex: 40,
					}}
					calculateMetadata={() => {
						return {
							defaultCodec: 'prores',
							defaultProResProfile: '4444',
							defaultPixelFormat: 'yuva444p10le',
							defaultVideoImageFormat: 'png',
						};
					}}
				/>
				<Composition
					id="FlyingCardsRight"
					component={VibeSkillsFlyingCards}
					durationInFrames={150}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="FlyingCardsLeft"
					component={FlyingCardsLeft}
					schema={flyingCardsLeftSchema}
					defaultProps={{
						cards: ['Jonny Burger', '@JNYBGR'],
					}}
					durationInFrames={90}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="FlyingCardBottom"
					component={FlyingCardBottom}
					durationInFrames={150}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="3DCheck"
					component={ThreeDCheck}
					width={300}
					height={300}
					fps={30}
					durationInFrames={1000}
				/>
			</Folder>
			<Folder name="Recorder">
				<Composition
					id="LightMode"
					component={Comp}
					durationInFrames={120}
					fps={30}
					width={1080}
					height={1080}
					defaultProps={{
						theme: 'light',
					}}
				/>
				<Composition
					id="LightModeBanner"
					component={Banner}
					durationInFrames={120}
					fps={30}
					width={1080}
					height={540}
					defaultProps={{
						theme: 'light',
					}}
				/>
				<Composition
					id="DarkMode"
					component={Comp}
					durationInFrames={120}
					fps={30}
					width={1080}
					height={1080}
					defaultProps={{
						theme: 'dark',
					}}
				/>
				<Composition
					id="DarkModeBanner"
					component={Banner}
					durationInFrames={120}
					fps={30}
					width={1080}
					height={540}
					defaultProps={{
						theme: 'dark',
					}}
				/>
				<Composition
					id="TriangleToSquare"
					component={TriangleDemo}
					durationInFrames={240}
					fps={30}
					width={1080}
					height={1080}
					defaultProps={{theme: 'light'}}
				/>
			</Folder>

			<Folder name="CloseUps">
				<CloseUp1 />
				<CloseUp2 />
				<CloseUp3 />
				<CloseUp4 />
				<CloseUp5 />
				<CloseUp6 />
				<CloseUp7 />
				<CloseUp8 />
				<Composition
					id="CloseUpsSeries"
					component={CloseUpsSeries}
					durationInFrames={637}
					fps={60}
					width={1920}
					height={1080}
				/>
			</Folder>

			<Folder name="StudioAssets">
				<Composition
					id="app-icons"
					component={AppIcons}
					durationInFrames={1}
					fps={30}
					width={2048}
					height={720}
				/>
				<Composition
					id="preview-toolbar-icons"
					component={PreviewToolbarIcons}
					durationInFrames={1}
					fps={30}
					width={3200}
					height={520}
				/>
			</Folder>
			<Folder name="SocialMediaAnnouncements">
				<Folder name="whats-new-in-remotion">
					<WhatsNewInRemotion />
				</Folder>
				<Folder name="effect-showcases">
					<Composition
						id="corner-pin-effect-showcase"
						component={CornerPinEffectShowcase}
						durationInFrames={cornerPinEffectShowcaseDurationInFrames}
						fps={30}
						width={1080}
						height={1350}
					/>
					<Composition
						id="pattern-effect-showcase"
						component={PatternEffectShowcase}
						width={1080}
						height={1350}
						fps={30}
						durationInFrames={patternEffectShowcaseDurationInFrames}
					/>
					<Composition
						id="starburst-effect-showcase"
						component={StarburstEffectShowcase}
						durationInFrames={starburstEffectShowcaseDurationInFrames}
						fps={30}
						width={1080}
						height={1350}
					/>
					<Composition
						id="zigzag-linear-blur-effect-showcase"
						component={ZigzagLinearBlurShowcase}
						durationInFrames={zigzagLinearBlurShowcaseDurationInFrames}
						fps={30}
						width={1080}
						height={1350}
					/>
				</Folder>
				<Folder name="skills-2-0">
					<Composition
						id="Skills2Router"
						component={Skills2Router}
						durationInFrames={456}
						fps={30}
						width={1344}
						height={1700}
					/>
					<Composition
						id="Skills2CodeChange"
						component={Skills2CodeChange}
						durationInFrames={180}
						fps={30}
						width={1920}
						height={1920}
					/>
					<Composition
						id="Skills2CrazyContext"
						component={Skills2CrazyContext}
						durationInFrames={120}
						fps={30}
						width={1920}
						height={1400}
					/>
					<Composition
						id="Skills2Announcement"
						component={Skills2AnnouncementComposition}
						durationInFrames={180}
						fps={30}
						width={1071}
						height={102}
						schema={skills2AnnouncementSchema}
						defaultProps={{
							title: '/react-best-practices',
						}}
					/>
					<Composition
						id="Skills2Gesture"
						component={Skills2Gesture}
						durationInFrames={456}
						fps={30}
						width={1344}
						height={1700}
					/>
					<Composition
						id="Skills2Pick"
						component={Skills2Pick}
						durationInFrames={78}
						fps={30}
						width={1920}
						height={1080}
					/>
					<Composition
						id="Skills2TableBangComp"
						component={Skills2TableBangComp}
						durationInFrames={120}
						fps={30}
						width={1344}
						height={1700}
					/>
					<Composition
						id="Skills2Hand"
						component={Skills2TableBang}
						durationInFrames={78}
						fps={10}
						width={1344}
						height={1126}
					/>
				</Folder>

				<Folder name="webmcp">
					<Composition
						id="WebMCPPromo-MacBook-Loop"
						component={MacBookLoopScene}
						durationInFrames={800}
						fps={60}
						width={1920}
						height={1080}
					/>
					<Composition
						id="WebMCPPromo-MacBook"
						component={MacBookScene}
						durationInFrames={800}
						fps={60}
						width={1920}
						height={1080}
					/>
					<Composition
						id="WebMCPPromo-MacBook-Desktop"
						component={MacBookDesktopScene}
						durationInFrames={1200}
						fps={60}
						width={1920}
						height={1080}
					/>
					<Composition
						id="WebMCPPromo-MacBook-App"
						component={MacBookAppScene}
						durationInFrames={1200}
						fps={60}
						width={1320}
						height={827}
					/>
					<WebMCPPromo2 />
				</Folder>
				<Folder name="canvas-capture-announcement">
					<Composition
						id="CanvasCaptureAnnouncement"
						component={CanvasCaptureAnnouncement}
						durationInFrames={5248}
						fps={30}
						width={1920}
						height={1080}
					/>
					<Composition
						id="CanvasCaptureShort"
						component={CanvasCaptureShort}
						durationInFrames={1250}
						fps={30}
						width={1080}
						height={1920}
					/>
				</Folder>

				<Folder name="effects">
					<Composition
						id="effects-announcement"
						component={EffectsAnnouncement}
						width={1280}
						height={720}
						fps={30}
						durationInFrames={200}
					/>
					<Composition
						id="thermometer"
						component={EffectsAnnouncement}
						width={1280}
						height={720}
						fps={30}
						durationInFrames={200}
					/>
					<Composition
						id="news-headline"
						component={NewsHeadline}
						width={1280}
						height={720}
						fps={30}
						durationInFrames={200}
					/>
					<Composition
						id="thermo"
						component={Thermometer}
						width={1080}
						height={1080}
						fps={30}
						durationInFrames={200}
					/>
					<Composition
						id="goal"
						component={Goal}
						width={1280}
						height={720}
						fps={30}
						durationInFrames={120}
					/>
					<Composition
						id="metallic-swirl"
						component={MetallicSwirl}
						width={1280}
						height={720}
						fps={30}
						durationInFrames={200}
					/>
					<Composition
						id="fx-icon"
						component={FxIconComposition}
						width={1080}
						height={1080}
						fps={30}
						durationInFrames={90}
					/>
					<Composition
						id="ShipCard"
						component={ShipCard}
						durationInFrames={shipCardDurationInFrames}
						fps={30}
						width={EFFECT_SHOWCASE_WIDTH}
						height={EFFECT_SHOWCASE_HEIGHT}
					/>
					<Composition
						id="billboard-foreground"
						component={BillboardForeground}
						width={1080}
						height={675}
						fps={30}
						durationInFrames={120}
					/>
					<Composition
						id="logo-horn"
						component={LogoHorn}
						width={1080}
						height={1080}
						fps={30}
						durationInFrames={90}
						calculateMetadata={calculateLogoHornMetadata}
					/>
				</Folder>
				<Composition
					id="1000-documentation-pages"
					component={DocsPagesShowcase}
					width={INSTAGRAM_POST_WIDTH}
					height={INSTAGRAM_POST_HEIGHT}
					fps={30}
					durationInFrames={90}
					schema={docsPagesShowcaseSchema}
					defaultProps={docsPagesShowcaseDefaultProps}
					calculateMetadata={calculateDocsPagesShowcaseMetadata}
				/>
				<Composition
					id="rough-notation"
					component={RoughNotationShowcase}
					durationInFrames={roughNotationShowcaseDurationInFrames}
					fps={30}
					width={1080}
					height={1080}
				/>
			</Folder>
		</>
	);
};
