import React from 'react';

export type Expert = {
	name: string;
	image: string;
	website: string | null;
	description: React.ReactNode;
	x: string | null;
	github: string | null;
	linkedin: string | null;
	email: string | null;
	videocall: string | null;
	discord: {
		username: string;
		userId: string;
	} | null;
	slug: string;
	since: number;
};

export const experts: Expert[] = [
	{
		slug: 'stephen-sullivan',
		name: 'Stephen Sullivan',
		image: '/img/freelancers/stephen.png',
		website: null,
		x: null,
		github: null,
		linkedin: 'in/sterv/',
		email: 'stephen@middy.com',
		videocall: null,
		discord: {
			username: 'stervdotcom',
			userId: '613828260534550719',
		},
		since: new Date('2022-08-15').getTime(),
		description: (
			<div>
				I made:{' '}
				<a target={'_blank'} href="https://middy.com">
					middy.com
				</a>
				!
			</div>
		),
	},
	{
		slug: 'mohit-yadav',
		name: 'Mohit Yadav',
		image: '/img/freelancers/mohit.jpeg',
		website: null,
		x: 'Just_Moh_it',
		github: 'Just-Moh-it',
		linkedin: 'in/just-moh-it/',
		email: 'yo@mohitya.dev',
		videocall: null,
		discord: {
			username: 'justmohit',
			userId: '616199379530940426',
		},
		since: new Date('2022-08-15').getTime(),
		description: (
			<div>
				I made:{' '}
				<a target={'_blank'} href="https://mockoops.mohitya.dev">
					Mockoops
				</a>
				! <br />
				My services: SaaS platform from scratch including SSR, creating
				individual videos and templates, and creating integrations for Remotion
				with existing infrastructure.
			</div>
		),
	},
	{
		slug: 'yehor-misiats',
		name: 'Yehor Misiats',
		image: '/img/freelancers/yehor.jpeg',
		website: null,
		x: 'isatelllte',
		github: 'satelllte',
		linkedin: 'in/satelllte/',
		email: 'lunaerxs@gmail.com',
		videocall: null,
		discord: {
			username: 'satelllte',
			userId: '564382615105306634',
		},
		since: new Date('2022-09-16').getTime(),

		description: (
			<div>
				I made:{' '}
				<a
					target={'_blank'}
					href="https://github.com/satelllte/remotion-audio-visualizer"
				>
					Minimalistic audio visualizations
				</a>
				{' and '}
				<a
					target={'_blank'}
					href="https://github.com/satelllte/remotion-template"
				>
					Template for crafting programmatic videos
				</a>
				.
			</div>
		),
	},
	{
		slug: 'benjamin-jameson',
		name: 'Benjamin Jameson',
		image: '/img/freelancers/benjamin.jpeg',
		x: null,
		github: 'BenjaminJameson',
		linkedin: null,
		email: 'ben@captok.ai',
		videocall: null,
		discord: {
			username: 'ben201000',
			userId: '833862694372245515',
		},
		since: new Date('2022-11-03').getTime(),
		description: (
			<div>
				Creator of{' '}
				<a target={'_blank'} href="https://www.captok.ai">
					CapTok
				</a>
				<br />I specialize in creating serverless AI web applications using AWS,
				Javascript and Python.
			</div>
		),
		website: null,
	},
	{
		slug: 'karel-nagel',
		name: 'Karel Nagel',
		image: '/img/freelancers/karel.jpeg',
		website: 'https://asius.ai/',
		x: 'AsiusAI',
		github: 'karelnagel',
		linkedin: 'in/karelnagel/',
		since: new Date('2022-08-22').getTime(),
		email: 'karel@asius.ai',
		videocall: null,
		discord: null,
		description: (
			<div>
				I have created Remotion videos for many companies and helped them with
				deployment, some examples are visible{' '}
				<a target={'_blank'} href="https://asius.ai/#portfolio">
					here
				</a>
				. Additionally, I am the creator of the{' '}
				<a target={'_blank'} href="https://github.com/karelnagel/remotion-sst">
					remotion-sst
				</a>{' '}
				package, which simplifies the deployment of Remotion Lambda to AWS using
				SST.
				<br />I am available for contract opportunities in Remotion projects and
				web development.
			</div>
		),
	},
	{
		slug: 'alex-fernandez',
		name: 'Alex Fernandez',
		image: '/img/freelancers/alex.jpeg',
		website: null,
		x: null,
		github: 'alexfernandez803',
		linkedin: 'in/alex-f-17a5bb56/',
		email: 'alex.frndz@gmail.com',
		videocall: 'https://cal.com/remotion-expert-alex-fernandez',
		discord: {
			username: 'alex12345670000',
			userId: '1046357837976182894',
		},
		since: new Date('2022-12-02').getTime(),
		description: (
			<div>
				I am an experienced integration developer using Mulesoft, a backend
				developer and on the side frontend and animation enthusiast.
			</div>
		),
	},
	{
		slug: 'matthew-mcgillivray',
		name: 'Matt McGillivray',
		image: '/img/freelancers/umungo.png',
		website: 'https://mattm9y.com',
		x: null,
		github: 'UmungoBungo',
		linkedin: 'in/matthew-mcgillivray-68295a55',
		email: 'mm@mattm9y.com',
		videocall: 'https://cal.com/remotion-expert-matt-mcgillivray',
		discord: {
			username: 'umungobungo',
			userId: '225141342894948352',
		},
		since: new Date('2023-01-30').getTime(),
		description: (
			<div>
				<p>
					Are you kicking off a project or feature that will have Remotion at
					the core, and you want to get it right from the start? Or perhaps you
					want to migrate from an expensive After Effects or MoviePy solution,
					to offer your users a free live preview, with cheap rendering costs
					while also keeping animation quality high.
					<br />
					<br />
					I&apos;ve worked extensively on the Remotion core repository itself,
					helping Jonny and the team by building the{' '}
					<a
						target={'_blank'}
						href="https://www.npmjs.com/package/@remotion/cloudrun"
					>
						@remotion/cloudrun package
					</a>{' '}
					and making many many tiny improvements to the documentation to help
					other developers move as fast as possible. I&apos;ve helped many
					companies ensure they get started with a strong foundation, as well as
					launch with a buttoned-up solution that can be depended upon;
					<ul>
						<li>
							<a target={'_blank'} href="https://www.memento.com/">
								Memento
							</a>
						</li>
						<li>
							<a target={'_blank'} href="https://beaconstreetstudios.com/">
								Beacon Street Studios
							</a>
						</li>
						<li>
							<a target={'_blank'} href="https://minvo.pro/">
								Minvo
							</a>
						</li>
						<li>+ many more.</li>
					</ul>
					95% of my time is spent in the Remotion ecosystem, and I am able to
					work independently or integrate into existing teams across your full
					stack. On the front-end, I craft thoughtful, responsive UIs tailored
					to user goals. For back-end work, I deploy cloud resources in
					repeatable patterns and shape easy-to-use, transparent APIs.
					<br />
					<br />I{"'"}m available for one-off consulting sessions with your
					whole team, or for longer engagements working inside your codebase.
				</p>
			</div>
		),
	},
	{
		slug: 'ray-lotmar',
		name: 'Ray Lotmar',
		image: '/img/freelancers/ray.jpeg',
		website: null,
		x: 'romrif',
		github: 'rayBlock',
		linkedin: 'in/raymond-lotmar/',
		email: 'ray@blocklab.ch',
		videocall: 'https://cal.com/remotion-expert-ray-lotmar',
		discord: {
			username: 'ray_block',
			userId: '402806969980944384',
		},
		since: new Date('2023-01-30').getTime(),
		description: (
			<div>
				I made{' '}
				<a target={'_blank'} href="https://www.romrif.com/">
					Romrif
				</a>
				!<br />I build Websites & Videos with Remotion. I{"'"}m alway interested
				in the latest Tech and love building stuff. Feel free to contact me - I
				{"'"}m available for hire.
			</div>
		),
	},
	{
		slug: 'lorenzo-bertolini',
		name: 'Lorenzo Bertolini',
		image: '/img/freelancers/lorenzo.jpeg',
		website: 'https://www.lorenzobertolini.com/',
		x: 'MagoDiSegrate',
		github: 'encho',
		linkedin: 'in/lorenzobertolini/',
		email: 'ciao@lorenzobertolini.com',
		videocall: null,
		discord: {
			username: 'lorenzobertolini',
			userId: '933408520789950516',
		},
		since: new Date('2023-03-14').getTime(),
		description: (
			<div>
				I made:{' '}
				<a target={'_blank'} href="https://www.dataflics.com/">
					DataFlics
				</a>{' '}
				and{' '}
				<a target={'_blank'} href="https://nerdy.finance/">
					Nerdy Finance
				</a>
				! This is my personal website:{' '}
				<a target={'_blank'} href="https://www.lorenzobertolini.com/">
					Lorenzo Bertolini
				</a>
				<br />
				Reach out to me for data-driven video generation, data visualization,
				and web app prototyping with React.js and d3.js.
			</div>
		),
	},
	{
		slug: 'antoine-caron',
		name: 'Antoine Caron',
		image: '/img/freelancers/antoine.jpeg',
		website: 'https://blog.slashgear.dev/',
		x: 'Slashgear_',
		github: 'Slashgear',
		linkedin: 'in/antoine-caron-slash/',
		email: 'antoine395.caron+remotion@gmail.com',
		videocall: null,
		discord: {
			username: 'antoinecaron.',
			userId: '199566011849113600',
		},
		since: new Date('2023-03-17').getTime(),
		description: (
			<div>
				<p>
					I made:{' '}
					<a
						target={'_blank'}
						href="https://social-video-generator.vercel.app/"
					>
						Social Video Generator
					</a>
					, with Mickaël Alves
				</p>
			</div>
		),
	},
	{
		slug: 'mickael-alves',
		name: 'Mickaël Alves',
		image: '/img/freelancers/mickael.jpeg',
		website: 'https://mickaelalvs.dev/',
		x: 'mickaelalvs',
		github: 'mickaelalvs',
		linkedin: 'in/mickaelalves/',
		email: 'alves.mckl@gmail.com',
		videocall: null,
		discord: {
			username: 'cruuzazul',
			userId: '455697698050277378',
		},
		since: new Date('2023-03-17').getTime(),
		description: (
			<div>
				<p>
					I made:{' '}
					<a
						target={'_blank'}
						href="https://social-video-generator.vercel.app/"
					>
						Social Video Generator
					</a>
					, with Antoine Caron
				</p>
			</div>
		),
	},
	{
		slug: 'pranav-kulkarni',
		name: 'Pranav Kulkarni',
		image: '/img/freelancers/pranav.jpg',
		website: 'https://pranava.dev/',
		x: 'thecmdrunner',
		github: 'thecmdrunner',
		linkedin: 'in/pranavk7/',
		email: 'hey@pranava.dev',
		videocall: null,
		discord: {
			username: 'thecmdrunner',
			userId: '768013898385063936',
		},
		since: new Date('2023-07-03').getTime(),
		description: (
			<div>
				Launched apps that combine Remotion & AI for generative video -{' '}
				<a target={'_blank'} href="https://maxroom.co/">
					MaxRoom
				</a>{' '}
				and{' '}
				<a target={'_blank'} href="https://swiftube.vercel.app/">
					Swiftube
				</a>
				.
				<br />
				Looking at leveraging the power of Remotion for your projects?
				Let&apos;s join forces!
			</div>
		),
	},
	{
		slug: 'rahul-bansal',
		name: 'Rahul Bansal',
		image: '/img/freelancers/rahul.png',
		website: 'https://bansalrahul.com/',
		x: 'BansalRahul14',
		github: 'rahulbansal16',
		linkedin: 'in/rahulbansalrb/',
		email: 'bansalrahul14@gmail.com',
		videocall: 'https://cal.com/remotion-expert-rahul-bansal',
		discord: {
			username: 'raxrb',
			userId: '564805165211713536',
		},
		since: new Date('2023-08-04').getTime(),
		description: (
			<div>
				I can help you with building products using Remotion, Firebase, Antd,
				and Typescripts. I have made{' '}
				<a target={'_blank'} href="https://app.blinkcuts.com/">
					Blinkcuts
				</a>{' '}
				an AI video editor for short talking head videos. I have worked in
				companies like Microsoft and early-stage startups like Directi. I can
				build products super fast from scratch. Looking forward to helping you.
			</div>
		),
	},
	{
		slug: 'pramod-kumar',
		name: 'Pramod Kumar',
		image: '/img/freelancers/pramod.jpg',
		website: null,
		x: 'pramodk73',
		github: 'pskd73',
		linkedin: 'in/pramod-kumar-1a135b74/',
		email: 'pramodkumar.damam73@gmail.com',
		videocall: 'https://cal.com/remotion-expert-pramod-kumar',
		discord: {
			username: 'pskd73',
			userId: '517057574483525655',
		},
		since: new Date('2024-03-10').getTime(),
		description: (
			<div>
				I have been building software for the last 10 years across multiple
				technologies with strong software architecture skills. I have built two
				products that are based on Remotion.{' '}
				<a target={'_blank'} href="https://slickwid.com">
					SlickWid
				</a>{' '}
				a quick way to make videos for your social media, and{' '}
				<a target={'_blank'} href="https://motionshot.app">
					MotionShot
				</a>{' '}
				through which you can make informative walkthrough guides for your
				products, tutorials, and how-tos. <br />I made{' '}
				<a
					target={'_blank'}
					href="https://github.com/pskd73/remotion-animate-text"
				>
					remotion-animate-text
				</a>{' '}
				for Remotion to animate text. I build products in public on X and
				currently building{' '}
				<a target={'_blank'} href="https://crawlchat.app">
					CrawlChat
				</a>
				. I love helping the community. Feel free to reach out. Looking forward!
			</div>
		),
	},
	{
		slug: 'ayush-soni',
		name: 'Ayush Soni',
		image: '/img/freelancers/ayush.png',
		website: 'https://ayushsoni.com/',
		x: 'ayysoni',
		github: null,
		linkedin: 'in/ayushsoni1001/',
		email: 'hi@ayushsoni.com',
		videocall: 'https://cal.com/remotion-expert-ayush-soni',
		discord: {
			username: 'ayushsoni',
			userId: '624968675916513310',
		},
		since: new Date('2024-03-17').getTime(),
		description: (
			<div>
				I{"'"}ve been coding and building cool projects since 5th grade
				(software and hardware both) across multiple technologies. Currently I
				{"'"}m building{' '}
				<a target={'_blank'} href="https://www.typeframes.com/">
					Typeframes
				</a>{' '}
				using Remotion, it is a tool to create videos. I build products in
				public on X. I{"'"}d love to hear your story.
			</div>
		),
	},
	{
		slug: 'andrei-terteci',
		name: 'Andrei Terteci',
		image: '/img/freelancers/andrei.png',
		website: null,
		x: 'andrei_terteci',
		github: null,
		linkedin: 'in/andrei-terteci-935331151/',
		email: 'hello@andreiterteci.com',
		videocall: 'https://cal.com/remotion-expert-andrei-terteci',
		discord: {
			username: 'andreiterteci',
			userId: '710924274361172078',
		},
		since: new Date('2024-03-17').getTime(),
		description: (
			<div>
				I made{' '}
				<a target={'_blank'} href="https://www.krumzi.com/">
					Krumzi
				</a>{' '}
				- using Remotion. <br />I{"'"}m a full-stack developer with 5+ years of
				experience, specializing in building SaaS products. I mostly work with
				React and Next.js, and for the past 2 years, I{"'"}ve been using
				Remotion to build video-based products. I focus on shipping fast,
				delivering value, and creating things people actually enjoy using.
			</div>
		),
	},
	{
		slug: 'sam-bowen-hughes',
		name: 'Sam Bowen Hughes',
		image: '/img/freelancers/sam-bowen-hughes.jpeg',
		website: null,
		x: null,
		github: 'sambowenhughes',
		linkedin: 'in/sambowenhughes/',
		email: 'sam@reactvideoeditor.com',
		videocall: 'https://calendly.com/reactvideoeditor/30min',
		discord: {
			username: '.samelliott',
			userId: '862593906972688385',
		},
		since: new Date('2025-06-03').getTime(),
		description: (
			<div>
				<p>
					Experienced engineer with 10+ years building advanced software
					products. Creator of{' '}
					<a target="_blank" href="https://reactvideoeditor.com">
						React Video Editor
					</a>
					and{' '}
					<a target="_blank" href="https://clippkit.com">
						Clippkit
					</a>
					.
				</p>

				<p>
					I work with companies building products with{' '}
					<strong>Remotion at their core</strong>. Custom video editors,
					automated video generation tools, and scalable rendering pipelines.
				</p>

				<ul>
					<li>
						<strong>Custom video editors</strong> built with Remotion
					</li>
					<li>
						<strong>Automated video generation</strong> systems
					</li>
					<li>
						<strong>Rendering infrastructure</strong> and media pipelines
					</li>
					<li>
						<strong>UI/UX and full-stack product development</strong>
					</li>
				</ul>

				<p>
					If you{"'"}re building software around video, or just need a reliable
					engineering partner who moves fast and builds things right, feel free
					to reach out.
				</p>
			</div>
		),
	},
	{
		name: 'Shankhadeep Dey',
		image: '/img/freelancers/shankhadeep.png',
		website: 'https://shankhadeep.dev',
		x: 'iamshankhadeep',
		github: 'iamshankhadeep',
		linkedin: 'in/iamshankhadeep/',
		email: 'shankhadeepdey99@gmail.com',
		slug: 'iamshankhadeep',
		videocall: 'https://cal.com/iamshankhadeep',
		discord: {
			username: 'iamshankhadeep',
			userId: '441576588937527306',
		},
		since: new Date('2021-02-13').getTime(),
		description: (
			<div>
				I created @remotion/player and @remotion/lambda with Jonny. I have 5+
				years of experience in building products using Remotion, React, Next.js,
				and Typescript. I have worked in companies like Camcorder and
				early-stage startups like a funnel builder marketplace. I can build
				products super fast from scratch. Looking forward to helping you.
			</div>
		),
	},
	{
		slug: 'amir-tadrisi',
		name: 'Amir Tadrisi',
		image: '/img/freelancers/amir.jpeg',
		website: 'https://vidbuilder.ai',
		x: 'amirtds',
		github: 'amirtds',
		linkedin: 'in/amirtadrisi/',
		email: 'amir@cubite.io',
		videocall: null,
		discord: {
			username: 'aioppsos1565',
			userId: '709545234882756711',
		},
		since: new Date('2025-01-01').getTime(),
		description: (
			<div>
				<p>
					Founder of{' '}
					<a target={'_blank'} href="https://vidbuilder.ai">
						VidBuilder.ai
					</a>{' '}
					and hands-on Remotion expert for companies that need premium,
					custom-built <strong>explainer</strong> and{' '}
					<strong>educational</strong> videos. When a team needs the best
					partner to own their video pipeline end-to-end, I&apos;m the person
					they call.
				</p>
				<ul>
					<li>
						<strong>Discovery:</strong> I interview stakeholders, study brand
						guidelines, and map each storyboard beat to measurable product or
						education goals.
					</li>
					<li>
						<strong>Custom engineering:</strong> I build a dedicated Remotion
						codebase with component systems tailored to your content, allowing
						rapid iteration on visuals, motion, and data integrations.
					</li>
					<li>
						<strong>Collaborative delivery:</strong> Every client receives a
						private VidBuilder.ai workspace so their team can tweak scripts,
						colors, and clips without incurring new engineering costs.
					</li>
				</ul>
				<p>
					Whether you&apos;re launching a new onboarding journey, explainer or
					demo videos for your SaaS product, or an internal academy, I&apos;m
					here to help.
				</p>
			</div>
		),
	},
	{
		slug: 'pablito-silva',
		name: 'Pablito Silva',
		image: '/img/freelancers/pablito.png',
		website: 'https://pablituuu.space/',
		x: null,
		github: 'pablituuu',
		linkedin: 'in/pablito-jean-pool-silva-inca-735a03192/',
		email: 'pablito.silvainca@gmail.com',
		videocall: null,
		discord: {
			username: 'pablituuu',
			userId: '513743221109555206',
		},
		since: new Date('2026-02-13').getTime(),
		description: (
			<div>
				Creator of{' '}
				<a target={'_blank'} href="https://react-video-editor-mu.vercel.app/">
					Pablituuu Studio
				</a>
				, a premium AI-powered video editor.
				<br />I specialize in building complex Remotion applications integrated
				with AI services like Gemini (for video analysis and highlights) and
				Deepgram (for automated captions). I also focus on high-performance
				canvas interactions using Fabric.js and cost-effective AI workflows.
			</div>
		),
	},
	{
		slug: 'hai-nguyen',
		name: 'Hai Nguyen',
		image: '/img/freelancers/hai.jpg',
		website: 'https://haingt.dev',
		x: 'haingt_dev',
		github: 'haingt-dev',
		linkedin: 'in/haingt-dev/',
		email: 'hai@haingt.dev',
		videocall: null,
		discord: {
			username: 'haingt.dev',
			userId: '384392709902827522',
		},
		since: new Date('2026-04-02').getTime(),
		description: (
			<div>
				Built a full{' '}
				<a
					target={'_blank'}
					href="https://github.com/haingt-dev/Bookie/tree/master/projects/ai-book-video"
				>
					AI video production pipeline
				</a>{' '}
				using Remotion 4.0 — orchestrating self-hosted TTS (viXTTS), Gemini API
				image generation, SRT-driven subtitle timing, and Ken Burns motion
				presets. The pipeline produces complete book-to-video content in about
				an hour (1-person operation) with editorial design overlays,
				cross-dissolve transitions, and audio spectrum visualization.
				GPU-accelerated rendering on Linux.
				<br />
				Available for AI-powered video pipelines, multi-API media orchestration,
				and Remotion integrations with existing backend infrastructure.
			</div>
		),
	},
	{
		slug: 'ashok-reddy',
		name: 'Ashok Reddy',
		image: '/img/freelancers/ashok.png',
		website: null,
		x: 'indieashok',
		github: 'ashokDevs',
		linkedin: 'in/ashok-reddy-kakumanu-8a3078247/',
		email: 'ashok17748@gmail.com',
		videocall: null,
		discord: {
			username: '.8gates',
			userId: '668293302767845376',
		},
		since: new Date('2026-04-30').getTime(),
		description: (
			<div>
				I built many trending templates at{' '}
				<a target={'_blank'} href="https://vubo.ai">
					Vubo
				</a>
				, along with automations and AI-generated media pipelines using
				Remotion. I specialize in creating custom video templates, AI-powered
				video generation workflows, and integrations with existing
				infrastructure.
				<br />
				Available for hourly and project/milestone-based engagements.
			</div>
		),
	},
	{
		slug: 'huang-chi-chang',
		name: 'Huang Chi Chang',
		image: '/img/freelancers/huang-chi-chang.jpg',
		website: 'https://swift-clip.vercel.app/',
		x: null,
		github: 'zz41354899',
		linkedin: null,
		email: 'zz41354899@gmail.com',
		videocall: null,
		discord: {
			username: 'Nocts',
			userId: '444852671191580672',
		},
		since: new Date('2026-05-05').getTime(),
		description: (
			<div>
				I&apos;m a Product Designer and Indie Hacker based in Taiwan. I
				specialize in using Remotion to automate video production, building
				dynamic templates and automated rendering pipelines.
				<br />
				My project,{' '}
				<a target={'_blank'} href="https://swift-clip.vercel.app/">
					SwiftClip
				</a>
				, is a tool designed to streamline professional video creation through
				programmatic workflows.
			</div>
		),
	},
];
