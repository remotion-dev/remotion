import {Img} from 'remotion';
import img from './img.png';

export const MissingImg: React.FC = () => {
	return (
		<>
			<Img src={img} />
			<Img src="./img.png" />
		</>
	);
};
