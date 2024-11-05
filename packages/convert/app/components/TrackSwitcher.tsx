import type {AudioTrack, VideoTrack} from '@remotion/media-parser';
import React from 'react';
import {Button} from './ui/button';
import {Separator} from './ui/separator';

export const TrackSwitcher: React.FC<{
	readonly sortedTracks: (AudioTrack | VideoTrack)[];
	readonly onTrack: (trackNumber: number | null) => void;
	readonly selectedTrack: number | null;
}> = ({sortedTracks, onTrack, selectedTrack}) => {
	const goToOverview = () => {
		onTrack(null);
	};

	return (
		<div>
			{sortedTracks.length ? (
				<div>
					<div className="flex flex-row">
						<Button
							variant={selectedTrack === null ? 'secondary' : 'link'}
							onClick={goToOverview}
						>
							Overview
						</Button>
						{sortedTracks.map((trk, i) => {
							return (
								<React.Fragment key={trk.trackId}>
									<Separator orientation="vertical" />
									<Button
										variant={selectedTrack === i ? 'secondary' : 'link'}
										onClick={() => onTrack(i)}
									>
										Track {trk.trackId}
									</Button>
								</React.Fragment>
							);
						})}
					</div>
					<div className="h-4" />
				</div>
			) : null}
		</div>
	);
};
