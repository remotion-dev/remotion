import type {MetaFunction} from '@remix-run/node';
import {useState} from 'react';
import ConvertUI from '~/components/ConvertUi';
import {Probe} from '~/components/Probe';

export const meta: MetaFunction = () => {
	return [
		{title: 'Remotion Convert'},
		{name: 'description', content: 'Fast video conersion in the browser.'},
	];
};

const src =
	'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.vp9.webm';

const Index = () => {
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

export default Index;
