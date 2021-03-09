import {Video} from 'remotion';

const Features: React.FC = () => {
	const tray = require('./tray.webm');
	const watermelon = require('./watermelon.webm');
	const textstickers = require('./textstickers.webm');
	return (
		<div
			style={{
				flex: 1,
				backgroundColor: 'white',
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
			}}
		>
			<Video src={tray} style={{height: 400, width: 400}} />
			<Video src={textstickers} style={{height: 700, width: 700}} />
			<Video src={watermelon} style={{height: 700, width: 700}} />
		</div>
	);
};

export default Features;
