import {Folder} from 'remotion';
import {DiscoLightShowRoot} from './disco-light-show/Root';

export const RemotionRoot: React.FC = () => {
	return (
		<Folder name="DiscoLightShow">
			<DiscoLightShowRoot />
		</Folder>
	);
};
