import React, {useContext, useMemo} from 'react';
import {CompositionManager, useVideoConfig} from 'remotion';

export const TimelineElements: React.FC = () => {
	const {sequences} = useContext(CompositionManager);
  const videoConfig = useVideoConfig();
  
  const sorted = useMemo(() => {
    sortby
  }, [])

  const sequenceWithOverlaps = useMemo(() => {
    return sequences.
  }, [])

	return (
		<div>
			{sequences.map((s) => {
				return (
					<div
						key={s.id}
						style={{
							backgroundColor: '#03d7fc',
							borderRadius: 4,
							height: 80,
							marginLeft: (s.from / videoConfig.durationInFrames) * 100 + '%',
							width: (s.duration / videoConfig.durationInFrames) * 100 + '%',
						}}
					/>
				);
			})}
		</div>
	);
};
