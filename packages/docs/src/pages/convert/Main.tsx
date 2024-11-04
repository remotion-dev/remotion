import React, {useState} from 'react';
import ConvertUI from './components/ConvertUi';
import {Probe} from './components/Probe';

const src =
	'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const Index = () => {
	const [probeDetails, setProbeDetails] = useState(false);

	return (
		<div className="font-sans p-4 flex justify-center items-center h-screen bg-slate-50 gap-16">
			<Probe
				src={src}
				probeDetails={probeDetails}
				setProbeDetails={setProbeDetails}
			/>
			{probeDetails ? null : <ConvertUI src={src} />}
		</div>
	);
};
