import {Series} from 'remotion';
import {BrowserScaleScene} from './BrowserScaleScene';
import {ChatMessageScene} from './ChatMessageScene';
import {MacBookScene} from './MacBookScene';
import {McpCloseUpScene} from './McpCloseUpScene';

export const WebMCPPromo = () => {
	return (
		<Series>
			<Series.Sequence durationInFrames={180} name="MacBook Air">
				<MacBookScene />
			</Series.Sequence>
			<Series.Sequence durationInFrames={120} name="McpCloseUp">
				<McpCloseUpScene />
			</Series.Sequence>
			<Series.Sequence durationInFrames={90} name="Chat message">
				<ChatMessageScene />
			</Series.Sequence>
			<Series.Sequence
				durationInFrames={120}
				name="Browser scale change"
				style={{
					scale: 1.747,
					translate: '-1px -106.4px',
				}}
			>
				<BrowserScaleScene />
			</Series.Sequence>
		</Series>
	);
};
