import React from 'react';
import {AbsoluteFill, Composition, Folder, useCurrentScale} from 'remotion';
import {BarChart} from './BarChart';
import {EffectKeyframeE2e} from './EffectKeyframeE2e';
import {
	ErrorOverlayRepro,
	UnsymbolicatedErrorOverlayRepro,
} from './ErrorOverlayE2e/ErrorOverlayRepro';
import {HookOrderChangeE2e} from './HookOrderChangeE2e/HookOrderChangeRepro';
import {InspectorControlLayoutE2e} from './InspectorControlLayoutE2e';
import {Issue8216} from './Issue8216/Issue8216';
import {LightLeakExample} from './LightLeak';
import {LostNodePathRepro} from './LostNodePathE2e/LostNodePathRepro';
import {MacCursorsExample} from './MacCursors';
import {NewVideoComp} from './NewVideo';
import {RotationKeyframeE2e} from './RotationKeyframeE2e';
import {SchemaTest, schemaTestSchema} from './SchemaTest';
import {TimelineNegativeFromResize} from './TimelineNegativeFromResize';
import {TimelineVirtualizationTestbed} from './TimelineVirtualizationTestbed';
import {VisualControls} from './VisualControls';
import {VisualMode3D} from './VisualMode3D';
import {AffineFrameClock} from './VisualModeTests/AffineFrameClock';
import {OutlineSelectionCases} from './VisualModeTests/OutlineSelectionCases';
import {SequenceShiftRepro} from './VisualModeTests/SequenceShiftRepro';

const UseCurrentScaleOnLoad: React.FC = () => {
	const scale = useCurrentScale();
	const measuredElement = React.useRef<HTMLDivElement>(null);
	const [correctedWidth, setCorrectedWidth] = React.useState<number | null>(
		null,
	);

	React.useLayoutEffect(() => {
		if (!measuredElement.current) {
			return;
		}

		setCorrectedWidth(
			Math.round(measuredElement.current.getBoundingClientRect().width / scale),
		);
	}, [scale]);

	return (
		<AbsoluteFill>
			<div ref={measuredElement} style={{width: 100}} />
			<div data-testid="use-current-scale-corrected-width">
				{correctedWidth}
			</div>
		</AbsoluteFill>
	);
};

export const E2eTestRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="use-current-scale-on-load"
				component={UseCurrentScaleOnLoad}
				width={1920}
				height={1080}
				fps={30}
				durationInFrames={30}
			/>
			<Folder name="Schema">
				<Composition
					id="schema-test"
					component={SchemaTest}
					width={1200}
					height={630}
					fps={30}
					durationInFrames={150}
					schema={schemaTestSchema}
					defaultProps={{
						title: 'sdasds',
						delay: 5.2,
						color: 'rgba(223, 42, 42, 0.46)',
						list: [{name: 'first', age: 12}],
						matrix: [0, 1, 1, 0] as const,
						description: 'Sample description \nOn multiple lines',
						country: 'Armenia' as const,
						dropdown: 'a' as const,
						superSchema: [
							{type: 'a' as const, a: {a: 'hi'}},
							{type: 'b' as const, b: {b: 'hi'}},
						],
						discriminatedUnion: {type: 'auto' as const},
						tuple: ['foo', 42, {a: 'hi'}],
					}}
				/>
			</Folder>
			<Composition
				id="AnimatedBarChart"
				component={BarChart}
				durationInFrames={180}
				fps={30}
				width={1280}
				height={720}
			/>
			<Folder name="visual-controls">
				<Composition
					id="visual-controls"
					component={VisualControls}
					width={1920}
					height={2400}
					fps={30}
					durationInFrames={900}
				/>
				<Composition
					id="effect-keyframe-e2e"
					component={EffectKeyframeE2e}
					width={1920}
					height={1080}
					fps={30}
					durationInFrames={90}
				/>
			</Folder>
			<Composition
				id="package-absolute-fill"
				component={LightLeakExample}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={90}
			/>
			<Composition
				id="mac-cursors"
				component={MacCursorsExample}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={90}
			/>
			<Folder name="lost-node-path">
				<Composition
					id="lost-node-path-e2e"
					component={LostNodePathRepro}
					width={1920}
					height={1080}
					fps={30}
					durationInFrames={90}
				/>
			</Folder>
			<Folder name="error-overlay">
				<Composition
					id="error-overlay-e2e"
					component={ErrorOverlayRepro}
					width={400}
					height={400}
					fps={30}
					durationInFrames={30}
				/>
				<Composition
					id="error-overlay-unsymbolicated-e2e"
					component={UnsymbolicatedErrorOverlayRepro}
					width={400}
					height={400}
					fps={30}
					durationInFrames={30}
				/>
			</Folder>
			<Folder name="hook-order-change">
				<HookOrderChangeE2e />
			</Folder>
			<Composition
				id="issue-8216"
				component={Issue8216}
				width={1280}
				height={720}
				fps={30}
				durationInFrames={90}
			/>
			<Composition
				id="visual-mode-3d"
				component={VisualMode3D}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={120}
			/>
			<Composition
				id="rotation-keyframe-e2e"
				component={RotationKeyframeE2e}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={90}
			/>
			<Composition
				id="affine-frame-clock"
				component={AffineFrameClock}
				width={1280}
				height={720}
				fps={30}
				durationInFrames={60}
			/>
			<Composition
				id="outline-selection-cases"
				component={OutlineSelectionCases}
				width={1920}
				height={1080}
				fps={30}
				durationInFrames={2340}
			/>
			<Composition
				id="sequence-shift-repro"
				component={SequenceShiftRepro}
				width={1280}
				height={720}
				fps={30}
				durationInFrames={60}
			/>
			<Composition
				id="timeline-virtualization-testbed"
				component={TimelineVirtualizationTestbed}
				width={1280}
				height={720}
				fps={30}
				durationInFrames={30}
			/>
			<Composition
				id="timeline-negative-start"
				component={TimelineNegativeFromResize}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={90}
			/>
			<Composition
				id="inspector-control-layout-e2e"
				component={InspectorControlLayoutE2e}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={90}
			/>
			<NewVideoComp />
		</>
	);
};
