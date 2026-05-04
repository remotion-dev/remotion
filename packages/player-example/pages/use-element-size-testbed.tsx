import {Player} from '@remotion/player';
import React from 'react';
import {UseElementSizeTestbedComposition} from '../src/UseElementSizeTestbedComposition';

/**
 * Manual testbed for GitHub issue #7183 and PRs #7184 / #7185 (useElementSize
 * under transformed ancestors).
 *
 * Run from repo root: `bunx turbo run dev --filter=@remotion/player-example`
 * Open: http://localhost:3000/use-element-size-testbed
 *
 * Compare before/after: checkout `main` vs the PR branch and reload. After the
 * fix, the 3D plate should stay visually filled (TOP/BOTTOM bands flush with the
 * plate); before, the composition shifts vertically inside the plate.
 */
const plate: React.CSSProperties = {
	width: 320,
	height: 180,
	border: '2px solid #666',
	boxSizing: 'border-box',
	backgroundColor: '#222',
};

const playerCommon = {
	component: UseElementSizeTestbedComposition,
	compositionWidth: 1920,
	compositionHeight: 1080,
	durationInFrames: 300,
	fps: 30,
	acknowledgeRemotionLicense: true as const,
	controls: true,
	style: {width: '100%', height: '100%'} as const,
};

const UseElementSizeTestbedPage: React.FC = () => {
	return (
		<div
			style={{
				padding: 24,
				fontFamily: 'system-ui, sans-serif',
				maxWidth: 900,
				lineHeight: 1.5,
			}}
		>
			<h1 style={{marginTop: 0}}>useElementSize / #7183 testbed</h1>
			<p>
				Reproduction from{' '}
				<a href="https://github.com/remotion-dev/remotion/issues/7183">
					issue #7183
				</a>
				: Player inside a 320×180 plate with 3D rotation. Before the fix,
				<code> useElementSize </code>
				can report an inflated height (post-transform AABB), which drives a
				non-zero <code>centerY</code> and vertical letterboxing. Red/green
				stripes should sit flush with the top and bottom of each outlined plate
				when sizing is correct.
			</p>
			<p style={{color: '#555', fontSize: 14}}>
				Tip: toggle between <code>main</code> and the PR branch (
				<a href="https://github.com/remotion-dev/remotion/pull/7185">#7185</a>
				) to compare before and after.
			</p>

			<h2>Control — no parent transform</h2>
			<p style={{marginTop: 0, fontSize: 14, color: '#444'}}>
				Expected: TOP/BOTTOM bands align with the plate; no empty strip above
				the composition.
			</p>
			<div style={plate}>
				<Player {...playerCommon} />
			</div>

			<h2>Original repro — rotateY + rotateX + preserve-3d</h2>
			<p style={{marginTop: 0, fontSize: 14, color: '#444'}}>
				Same as the snippet in #7183. Before fix: wrong vertical centering
				inside the plate.
			</p>
			<div
				style={{
					...plate,
					transform: 'rotateY(45deg) rotateX(-15deg)',
					transformStyle: 'preserve-3d',
				}}
			>
				<Player {...playerCommon} />
			</div>

			<h2>Extra: non-uniform 2D scale</h2>
			<p style={{marginTop: 0, fontSize: 14, color: '#444'}}>
				<code>scaleX(2) scaleY(3)</code> — also called out in the PR behaviour
				matrix. The transformed bounds are large; scroll the dashed area if
				needed.
			</p>
			<div
				style={{
					overflow: 'auto',
					maxWidth: '100%',
					padding: 24,
					border: '1px dashed #bbb',
				}}
			>
				<div
					style={{
						...plate,
						transform: 'scaleX(2) scaleY(3)',
						transformOrigin: 'center center',
					}}
				>
					<Player {...playerCommon} />
				</div>
			</div>

			<h2>Extra: perspective + rotateX</h2>
			<p style={{marginTop: 0, fontSize: 14, color: '#444'}}>
				Matches the “perspective + rotateX” case from the PR write-up.
			</p>
			<div
				style={{
					...plate,
					perspective: '1000px',
					transformStyle: 'preserve-3d',
				}}
			>
				<div
					style={{
						width: '100%',
						height: '100%',
						transform: 'rotateX(15deg)',
						transformStyle: 'preserve-3d',
					}}
				>
					<Player {...playerCommon} />
				</div>
			</div>
		</div>
	);
};

export default UseElementSizeTestbedPage;
