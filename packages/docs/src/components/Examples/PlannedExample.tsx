import React from 'react';

const container: React.CSSProperties = {
	border: '1px solid var(--ifm-color-emphasis-300)',
	borderRadius: 12,
	padding: 16,
	margin: '24px 0',
	backgroundColor: 'var(--ifm-color-emphasis-100)',
};

const label: React.CSSProperties = {
	fontWeight: 700,
	marginBottom: 8,
};

export const PlannedExample: React.FC<{
	readonly category: string;
	readonly description: string;
}> = ({category, description}) => {
	return (
		<>
			<p>{description}</p>

			<div style={container}>
				<div style={label}>Planned example</div>
				<div>
					This page reserves a spot in the {category} category. The final
					example should follow the shared example format.
				</div>
			</div>

			<h2>Preview</h2>
			<p>
				The implemented page should show a rendered preview, usually as a short
				looping video or still image. It should not require the docs website to
				bundle heavy example dependencies by default.
			</p>

			<h2>Use it</h2>
			<p>
				The implemented page should provide a self-contained, copy-pastable
				TypeScript React component where possible.
			</p>

			<h2>Customize</h2>
			<p>
				The implemented page should explain the most important knobs, such as
				timing, colors, text, dimensions, dependencies, or assets.
			</p>

			<h2>Source</h2>
			<p>
				The implemented page should link to the source code and any required
				assets.
			</p>
		</>
	);
};
