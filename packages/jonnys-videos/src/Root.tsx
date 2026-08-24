import {Folder} from 'remotion';
import {DiscoLightShowRoot} from './disco-light-show/Root';
import {HowCanRemotionBeFreeRoot} from './how-can-remotion-be-free/Root';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Folder name="DiscoLightShow">
				<DiscoLightShowRoot />
			</Folder>
			<Folder name="HowCanRemotionBeFree">
				<HowCanRemotionBeFreeRoot />
			</Folder>
		</>
	);
};
