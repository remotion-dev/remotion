import {FC} from 'react';
import {Series} from 'remotion';
import ReactSvg from '../ReactSvg';
import Tiles from '../Tiles';

const SeriesTesting: FC = () => {
	return (
		<Series>
			<Series.Sequence durationInFrames={10}>
				<Tiles />
			</Series.Sequence>
			<Series.Sequence durationInFrames={50}>
				<ReactSvg transparent={false} />
			</Series.Sequence>
			<Series.Sequence durationInFrames={80}>
				<Tiles />
			</Series.Sequence>
		</Series>
	);
};

export {SeriesTesting};
