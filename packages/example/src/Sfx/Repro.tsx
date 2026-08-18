import {Audio} from '@remotion/media';
import {ding} from '@remotion/sfx';

export const Repro: React.FC = () => {
	return <Audio src={ding} />;
};
