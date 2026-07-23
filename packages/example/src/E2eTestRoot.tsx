import React from 'react';
import {Composition, Folder} from 'remotion';
import {EffectKeyframeE2e} from './EffectKeyframeE2e';
import {ErrorOverlayRepro} from './ErrorOverlayE2e/ErrorOverlayRepro';
import {HookOrderChangeE2e} from './HookOrderChangeE2e/HookOrderChangeRepro';
import {Issue8216} from './Issue8216/Issue8216';
import {LostNodePathRepro} from './LostNodePathE2e/LostNodePathRepro';
import {NewVideoComp} from './NewVideo';
import {SchemaTest, schemaTestSchema} from './SchemaTest';
import {VisualControls} from './VisualControls';

export const E2eTestRoot: React.FC = () => {
	return (
		<>
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
			<NewVideoComp />
		</>
	);
};
