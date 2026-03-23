import './index.css';
import {Composition, Folder, staticFile} from 'remotion';
import {AnimatedBanner} from './animated-logo/AnimatedBanner';
import {AnimatedLogo} from './animated-logo/AnimatedLogo';
import {AnimatedLogoStringer} from './animated-logo/AnimatedLogoStinger';
import {AnimatedMaster} from './animated-logo/AnimatedMaster';
import {ExplodingLogo} from './animated-logo/ExplodingLogo';
import {Banner} from './Brand/Banner';
import {Comp} from './Brand/Composition';
import {TriangleDemo} from './Brand/TriangleToSquare';
import {
	WhatIsRemotion,
	whatIsRemotionCalculateMetadata,
	whatIsRemotionSchema,
} from './Compose/WhatIsRemotion';
import {EmailSignature} from './EmailSignature';
import {Logo} from './Logo';
import {LogoCollab, logoCollabSchema} from './LogoCollab/LogoCollab';
import {
	RulesEnumeration,
	rulesEnumerationSchema,
} from './RulesEnumeration/RulesEnumeration';
import {ProductHuntLogo} from './ScalingLogo';
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
import {GithubRepo, githubRepoSchema} from './video-elements/upper-reference';
import {UpperThird, upperThirdSchema} from './video-elements/UpperThird';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Folder name="static-logo">
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
				<Composition
					component={ExplodingLogo}
					width={1920}
					height={1080}
					fps={30}
					durationInFrames={200}
					id="ExplodingLogo"
					defaultProps={{
						theme: 'light',
					}}
				/>
			</Folder>
			<Composition
				id="WhatIsRemotion"
				component={WhatIsRemotion}
				width={1080}
				fps={30}
				durationInFrames={273}
				schema={whatIsRemotionSchema}
				defaultProps={{fade: false, whiteBackground: false, reel: false}}
				calculateMetadata={whatIsRemotionCalculateMetadata}
			/>
			<Composition
				component={ProductHuntLogo}
				width={240}
				height={240}
				fps={30}
				durationInFrames={90}
				id="scaling-logo"
			/>
			<Folder name="animated-logo">
				<Composition
					component={AnimatedLogo}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={450}
					id="animated-logo"
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
					id="animated-logo-banner-light"
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
					id="email-signature"
				/>
				<Composition
					component={AnimatedBanner}
					width={1080}
					height={500}
					fps={30}
					durationInFrames={60}
					id="animated-logo-banner-dark"
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
					id="animated-logo-stinger"
				/>
				<Composition
					component={AnimatedMaster}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={450}
					id="animated-master"
				/>
			</Folder>
			<Folder name="video-elements">
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
					id="lower-third-reference"
					component={LowerReference}
					durationInFrames={5 * 30}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="github-repo"
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
					id="upper-third"
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
					id="numbered-chapter"
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
					id="money-burn"
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
			</Folder>
			<Folder name="recorder">
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
					id="TriangletoSwquare"
					component={TriangleDemo}
					durationInFrames={240}
					fps={30}
					width={1080}
					height={1080}
					defaultProps={{theme: 'light'}}
				/>
			</Folder>
			<Folder name="brand-assets">
				<Composition
					id="LogoCollab"
					component={LogoCollab}
					schema={logoCollabSchema}
					defaultProps={{
						partnerLogoUrl: staticFile('logo/external/opencode.svg'),
						theme: 'light' as const,
						partnerLogoScale: 1,
						remotionLogoScale: 2.6,
						partnerLogoX: -36,
						remotionLogoX: -8,
					}}
					durationInFrames={90}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="RulesEnumeration"
					component={RulesEnumeration}
					schema={rulesEnumerationSchema}
					defaultProps={{
						heading: 'AI Best Practices',
						rules: [
							{
								title: 'Tell the agent to use Remotion Best Practices skill',
								description:
									'Be explicit, so that the agent picks it up correctly.',
							},
							{
								title: 'Do one thing at a time',
								description:
									'Do not ask for 5 or 10 changes in one message. Otherwise, the AI gets confused.',
							},
							{
								title: 'Use Remotion documentation',
								description:
									'You can copy the page or add .md to the end of the URL to get a Markdown version and feed it to your AI agent.',
							},
						],
						theme: 'light' as const,
					}}
					durationInFrames={120}
					fps={30}
					width={1920}
					height={1080}
				/>
			</Folder>
		</>
	);
};
