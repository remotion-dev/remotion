import {FC} from 'react';
import {Stagger} from 'remotion';
import ReactSvg from '../ReactSvg';
import Tiles from '../Tiles';

const StaggerTesting: FC = () => {
	return (
		<Stagger componentDuration={[10, 50, 80]}>
			<Tiles />
			<ReactSvg transparent={false} />
			<Tiles />
		</Stagger>
	);
};

export {StaggerTesting};
