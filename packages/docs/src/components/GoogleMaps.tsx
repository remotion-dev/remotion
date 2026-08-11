import React from 'react';
import styles from './GoogleMaps.module.css'; // Assuming you have a separate CSS module for this component

const GoogleMaps = () => {
	return (
		<div className={styles.mapContainer}>
			<div
				style={{
					maxWidth: '968px',
					transition: 'none',
					overflow: 'hidden',
					width: '100%',
					height: '500px',
				}}
			>
				<div
					id="my-map-canvas"
					style={{height: '100%', width: '100%', maxWidth: '100%'}}
				>
					<iframe
						style={{height: '100%', width: '100%', border: '0'}}
						src="https://www.google.com/maps/embed/v1/place?q=Remotion,+Hohlstrasse+186,+8004+Zurich&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
					/>
				</div>
			</div>
		</div>
	);
};

export default GoogleMaps;
