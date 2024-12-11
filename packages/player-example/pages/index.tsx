import React from 'react';
import App from '../src/App';
import CarSlideshow from '../src/CarSlideshow';

function Index() {
	return (
		<React.StrictMode>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
				}}
			>
				<App component={CarSlideshow} durationInFrames={500} />
			</div>
		</React.StrictMode>
	);
}

export default Index;
