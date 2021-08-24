import React, {useCallback, useContext} from 'react';
import {useIsStill} from '../helpers/is-current-selected-still';
import {TimelineIcon} from '../icons/timeline';
import {
	persistRichTimelineOption,
	RichTimelineContext,
} from '../state/rich-timeline';
import {ControlButton} from './ControlButton';

const tooltip =
	'Enable rich timeline. Go to remotion.dev/docs/timeline for more information.';

export const RichTimelineToggle: React.FC = () => {
	const {richTimeline, setRichTimeline} = useContext(RichTimelineContext);
	const isStill = useIsStill();

	const onClick = useCallback(() => {
		setRichTimeline((c) => {
			persistRichTimelineOption(!c);
			return !c;
		});
	}, [setRichTimeline]);

	if (isStill) {
		return null;
	}

	return (
		<ControlButton title={tooltip} aria-label={tooltip} onClick={onClick}>
			<TimelineIcon
				style={{
					width: 16,
					height: 16,
					color: richTimeline ? 'var(--blue)' : 'white',
				}}
			/>
		</ControlButton>
	);
};
