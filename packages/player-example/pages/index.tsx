import Link from 'next/link';

const examples = [
	{
		href: '/player',
		name: 'Player and thumbnail',
		description:
			'The original Player testbed with custom controls and thumbnails.',
	},
	{
		href: '/canvas',
		name: 'Canvas layers',
		description: 'A Player with a live list of mounted timeline layers.',
	},
	{
		href: '/audio',
		name: 'Audio',
		description: 'Switch between compositions containing audio.',
	},
	{
		href: '/audio-switching',
		name: 'Audio switching',
		description: 'Switch compositions and prefetched audio sources.',
	},
	{
		href: '/autoplay-muted-video',
		name: 'Autoplay muted video',
		description: 'Autoplay a muted video in the Player.',
	},
	{
		href: '/autoplay-unmuted-video',
		name: 'Autoplay unmuted video',
		description: 'Exercise browser autoplay blocking and fallback behavior.',
	},
	{
		href: '/fullscreen',
		name: 'Fullscreen',
		description: 'A Player that fills the browser viewport.',
	},
	{
		href: '/video-ssr',
		name: 'Video SSR',
		description: 'Render a video Player through Next.js server-side rendering.',
	},
	{
		href: '/issue-7183',
		name: 'Issue #7183',
		description: 'Player measurement inside a 3D-transformed parent.',
	},
] as const;

function Index() {
	return (
		<main
			style={{
				fontFamily: 'sans-serif',
				margin: '40px auto',
				maxWidth: 760,
				padding: '0 20px',
			}}
		>
			<h1>Player examples</h1>
			<p>Choose a focused example:</p>
			<ul style={{lineHeight: 1.5, paddingLeft: 24}}>
				{examples.map((example) => (
					<li key={example.href} style={{marginBottom: 16}}>
						<Link href={example.href}>{example.name}</Link>
						<div style={{color: '#555'}}>{example.description}</div>
					</li>
				))}
			</ul>
		</main>
	);
}

export default Index;
