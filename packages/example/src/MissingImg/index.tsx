import {Img} from 'remotion';

export const MissingImg: React.FC = () => {
	// eslint-disable-next-line @remotion/no-string-assets
	return <Img src="doesnotexist" />;
};
