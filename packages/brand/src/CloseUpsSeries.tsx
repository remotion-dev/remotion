import {Series} from 'remotion';
import {CloseUp1Preview} from './CloseUp1';
import {CloseUp2Preview} from './CloseUp2';
import {CloseUp3Preview} from './CloseUp3';
import {CloseUp4Preview} from './CloseUp4';
import {CloseUp5Preview} from './CloseUp5';
import {CloseUp6Preview} from './CloseUp6';
import {CloseUp7Preview} from './CloseUp7';
import {CloseUp8Preview} from './CloseUp8';

export const CloseUpsSeries = () => {
	return (
		<Series>
			<Series.Sequence
				name="Hover over outlines"
				durationInFrames={100}
				premountFor={30}
				trimBefore={284}
			>
				<CloseUp8Preview />
			</Series.Sequence>
			<Series.Sequence name="Trim clip" durationInFrames={54} premountFor={30}>
				<CloseUp1Preview />
			</Series.Sequence>
			<Series.Sequence
				name="Trim clip beginning"
				durationInFrames={70}
				premountFor={30}
			>
				<CloseUp2Preview />
			</Series.Sequence>
			<Series.Sequence
				name="Drag onto canvas"
				durationInFrames={63}
				premountFor={30}
				trimBefore={13}
			>
				<CloseUp3Preview />
			</Series.Sequence>
			<Series.Sequence
				name="Edit easing"
				durationInFrames={80}
				premountFor={30}
			>
				<CloseUp4Preview />
			</Series.Sequence>
			<Series.Sequence
				name="Edit effects"
				durationInFrames={98}
				premountFor={30}
			>
				<CloseUp5Preview />
			</Series.Sequence>
			<Series.Sequence
				name="Rotation control"
				durationInFrames={82}
				premountFor={30}
			>
				<CloseUp6Preview />
			</Series.Sequence>
			<Series.Sequence name="Add effect" durationInFrames={90} premountFor={30}>
				<CloseUp7Preview />
			</Series.Sequence>
		</Series>
	);
};
