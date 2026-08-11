import type {InputTrack} from 'mediabunny';
import React from 'react';
import {Button} from './ui/button';
import {Separator} from './ui/separator';

export const TrackSwitcher: React.FC<{
	readonly sortedTracks: InputTrack[];
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
							variant={selectedTrack === null ? 'secondary' : 'ghost'}
							className="rounded-none"
							onClick={goToOverview}
						>
							Overview
						</Button>
						{sortedTracks.map((trk, i) => {
							return (
								<React.Fragment key={trk.id}>
									<Separator orientation="vertical" />
									<Button
										className="rounded-none"
										variant={selectedTrack === i ? 'secondary' : 'ghost'}
										onClick={() => onTrack(i)}
									>
										Track {trk.id} ({trk.type === 'audio' ? 'Audio' : 'Video'})
									</Button>
								</React.Fragment>
							);
						})}
					</div>
				</div>
			) : null}
		</div>
	);
};
