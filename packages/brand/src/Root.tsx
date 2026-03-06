import './index.css';
import {getVideoMetadata, VideoMetadata} from '@remotion/media-utils';
import {useEffect, useState} from 'react';
import {
	Composition,
	continueRender,
	delayRender,
	Folder,
	staticFile,
} from 'remotion';
import {AnimatedBanner} from './animated-logo/AnimatedBanner';
import {AnimatedLogo} from './animated-logo/AnimatedLogo';
import {AnimatedLogoStringer} from './animated-logo/AnimatedLogoStinger';
import {AnimatedMaster} from './animated-logo/AnimatedMaster';
import {Arcs} from './animated-logo/Arcs';
import {ExplodingLogo} from './animated-logo/ExplodingLogo';
import {FilmRoll} from './animated-logo/film-roll';
import {Banner} from './Brand/Banner';
import {Comp} from './Brand/Composition';
import {TriangleDemo} from './Brand/TriangleToSquare';
import {EmailSignature} from './EmailSignature';
import {
	FlyingCardsLeft,
	flyingCardsLeftSchema,
} from './FlyingCardsLeft/FlyingCardsLeft';
import {LogoCollab, logoCollabSchema} from './LogoCollab/LogoCollab';
import {Logo} from './Logo';
import {LogoWithTitle} from './LogoWithTitle';
import {
	RulesEnumeration,
	rulesEnumerationSchema,
} from './RulesEnumeration/RulesEnumeration';
import {ProductHuntLogo} from './ScalingLogo';
import {ShowcaseVideo} from './showcase-video';
import {StepGuide, stepGuideSchema} from './StepGuide/StepGuide';
import {LowerReference} from './video-elements/lower-reference';
import {MoneyBurn} from './video-elements/money-burn';
import {NumberedChapter} from './video-elements/numbered-chapter';
import {UpperReference} from './video-elements/upper-reference';
import {UpperThird} from './video-elements/UpperThird';
import {FlyingCardBottom} from './vibe-skills/FlyingCardBottom';
import {FlyingCards as VibeSkillsFlyingCards} from './vibe-skills/FlyingCards';
import {VibeSkillsFlyingCardsLeft} from './vibe-skills/FlyingCardsLeft';
import {Prompt, PromptSchema} from './vibe-skills/Prompt';
import {
	WhatIsRemotion,
	whatIsRemotionCalculateMetadata,
	whatIsRemotionSchema,
} from './Compose/WhatIsRemotion';

const muxId = 'EV00V02hvNnfTYYYsTKtIzb7MfMAsZkSXQfDP001V1yC7I';

export const RemotionRoot: React.FC = () => {
	const [handle] = useState(() => delayRender());
	const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(
		null,
	);

	useEffect(() => {
		getVideoMetadata(`https://stream.mux.com/${muxId}/high.mp4`)
			.then((data) => {
				setVideoMetadata(data);
				continueRender(handle);
			})
			.catch((err) => {
				console.log('could not get video metadata', err);
			});
	}, [handle]);

	return (
		<>
			<Folder name="brand-assets">
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
			</Folder>
			<Folder name="vibe-skills">
				<Composition
					id="Prompt"
					component={Prompt}
					durationInFrames={210}
					fps={30}
					width={1920}
					height={1080}
					schema={PromptSchema}
					defaultProps={{
						prompt:
							'the homepage "/" should show the username field,   and once you submit, you get redirected to the "/[username]" route, where you can download   the video.   Use the components from the existing page.    on the user page fetch from the following API:   https://github-contributions-api.jogruber.de/v4/[username] and only once fetched show the   player.',
						thinkingIndex: 40,
					}}
				/>
				<Composition
					id="VibeSkillsFlyingCards"
					component={VibeSkillsFlyingCards}
					durationInFrames={150}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="VibeSkillsFlyingCardsLeft"
					component={VibeSkillsFlyingCardsLeft}
					durationInFrames={150}
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
			<Composition
				component={ShowcaseVideo}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={Math.floor(
					(videoMetadata?.durationInSeconds ?? 1) * 30,
				)}
				id="showcase-video"
				defaultProps={{
					muxId,
					videoMetadata,
				}}
			/>
			<Folder name="animated-logo">
				<Composition
					component={FilmRoll}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={450}
					id="film-roll"
				/>
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
					component={Arcs}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={450}
					id="arcs"
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
					component={LogoWithTitle}
					width={2100}
					height={1080}
					fps={30}
					durationInFrames={1}
					id="LogoWithTitle"
					defaultProps={{
						yOffset: 0,
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
			<Folder name="video-elements">
				<Composition
					id="lower-third-reference"
					component={LowerReference}
					durationInFrames={5 * 30}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="upper-third-reference"
					component={UpperReference}
					durationInFrames={5 * 30}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="upper-third"
					component={UpperThird}
					durationInFrames={5 * 30}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="numbered-chapter"
					component={NumberedChapter}
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
		</>
	);
};
