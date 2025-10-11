import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/audio/importing">
					<strong>{'Importing audio'}</strong>
					<div>Add audio to your compositions</div>
				</TOCItem>
				<TOCItem link="/docs/audio/delaying">
					<strong>{'Delaying audio'}</strong>
					<div>Delay the start time of audio elements</div>
				</TOCItem>
				<TOCItem link="/docs/audio/from-video">
					<strong>{'Creating audio from video'}</strong>
					<div>Use audio from videos</div>
				</TOCItem>
				<TOCItem link="/docs/audio/volume">
					<strong>{'Controlling volume'}</strong>
					<div>Control the volume of audio elements</div>
				</TOCItem>
				<TOCItem link="/docs/audio/muting">
					<strong>{'Muting audio'}</strong>
					<div>Mute audio elements</div>
				</TOCItem>
				<TOCItem link="/docs/audio/speed">
					<strong>{'Controlling speed'}</strong>
					<div>Change the speed of audio elements</div>
				</TOCItem>
				<TOCItem link="/docs/audio/pitch">
					<strong>{'Controlling pitch'}</strong>
					<div>Change the pitch of audio elements</div>
				</TOCItem>
				<TOCItem link="/docs/audio/visualization">
					<strong>{'Visualizing audio'}</strong>
					<div>Visualize audio elements</div>
				</TOCItem>
				<TOCItem link="/docs/audio/exporting">
					<strong>{'Exporting audio'}</strong>
					<div>Export audio</div>
				</TOCItem>
				<TOCItem link="/docs/audio/order-of-operations">
					<strong>{'Order of operations'}</strong>
					<div>Control the order of operations for audio elements</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
