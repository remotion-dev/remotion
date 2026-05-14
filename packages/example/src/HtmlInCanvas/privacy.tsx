import React from 'react';
import {AbsoluteFill, HtmlInCanvas, IFrame, Img} from 'remotion';

// Demonstrates the "Privacy-preserving painting" rules from
// https://github.com/WICG/html-in-canvas#privacy-preserving-painting
//
// Each row contains content that the spec says must NOT leak into the
// painted snapshot:
//   • Cross-origin iframe content
//   • Cross-origin <img> without CORS
//   • :visited link styling
//   • Spellcheck markers
//   • System colors (forced-colors / theme)
//
// Right column (HtmlInCanvas paint) should show those bits redacted/blank;
// left column (plain DOM) shows the full content for comparison.

const Section: React.FC<{
	readonly title: string;
	readonly children: React.ReactNode;
}> = ({title, children}) => (
	<div style={{marginBottom: 14}}>
		<div
			style={{
				fontSize: 12,
				color: '#666',
				marginBottom: 4,
				fontFamily: 'sans-serif',
			}}
		>
			{title}
		</div>
		{children}
	</div>
);

const VISITED_LINK_CSS = `
	.privacy-link { color: #0000ee; }
	.privacy-link:visited { color: #ff00ff; }
`;

const SensitiveContent: React.FC = () => (
	<div
		style={{
			fontFamily: 'sans-serif',
			fontSize: 16,
			color: 'black',
			padding: 20,
			backgroundColor: 'white',
			width: 560,
		}}
	>
		<style>{VISITED_LINK_CSS}</style>

		<Section title="Cross-origin <iframe> (should paint blank)">
			<IFrame
				title="cross-origin"
				src="https://example.com"
				width={500}
				height={120}
				style={{border: '1px solid #888'}}
			/>
		</Section>

		<Section title="Cross-origin <img> without CORS (should paint blank)">
			<Img
				src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png"
				alt="cross-origin"
				width={200}
			/>
		</Section>

		<Section title=":visited link (visited color must not leak)">
			<a className="privacy-link" href="https://www.google.com">
				google.com
			</a>{' '}
			·{' '}
			<a
				className="privacy-link"
				href="https://this-is-almost-certainly-unvisited.example/abc123"
			>
				unvisited.example
			</a>
		</Section>

		<Section title="Spellcheck markers (no red squigglies in canvas)">
			<input
				type="text"
				defaultValue="Speeling errrors should not show in canvas"
				spellCheck
				style={{width: 460, padding: 6, fontSize: 14}}
			/>
		</Section>

		<Section title="System color (color: ButtonText)">
			<span style={{color: 'ButtonText', fontWeight: 'bold'}}>
				Rendered with the SystemColor keyword
			</span>
		</Section>
	</div>
);

export const HtmlInCanvasPrivacy: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#eee',
				padding: 30,
				flexDirection: 'row',
				gap: 24,
				fontFamily: 'sans-serif',
				color: 'black',
			}}
		>
			<div style={{flex: 1}}>
				<h2 style={{margin: '0 0 12px 0'}}>Live DOM (reference)</h2>
				<SensitiveContent />
			</div>

			<div style={{flex: 1}}>
				<h2 style={{margin: '0 0 12px 0'}}>HtmlInCanvas paint (redacted)</h2>
				<HtmlInCanvas
					width={600}
					height={760}
					style={{border: '1px dashed #888'}}
					onPaint={({canvas, element, elementImage}) => {
						const ctx = canvas.getContext('2d');
						if (!ctx) {
							throw new Error('Failed to acquire 2D context');
						}

						ctx.reset();
						ctx.drawElementImage(elementImage, 0, 0);

						// Push the live DOM off-screen so the canvas pixels (which
						// have the redactions applied) are visible. CSS transforms
						// on canvas children don't re-trigger the `paint` event, so
						// this is safe to do inside the handler.
						element.style.transform = 'translate(-99999px, 0)';
					}}
				>
					<SensitiveContent />
				</HtmlInCanvas>
			</div>
		</AbsoluteFill>
	);
};
