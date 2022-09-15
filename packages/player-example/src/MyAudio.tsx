import {Audio} from 'remotion';
import React, {useEffect, useRef, useState} from 'react';

const src =
	'https://staging_b.backend.studio.vime.ai/v1/api/videos/preview?text=%3Cmstts:express-as%20style=%27neutral%27%3ELorem%20Ipsum%20is%20simply%20dummy%20text%20of%20the%20printing%20and%20typesetting%20industry.%20Lorem%20Ipsum%20has%20been%3C/mstts:express-as%3E&voiceId=sara';

export const getData = async (src: string) => {
	const response = await fetch(src);
	if (!response.ok) {
		throw new Error(`HTTP error, status = ${response.status}`);
	}
	const buffer = await response.blob();
	return URL.createObjectURL(buffer);
};

export const MyAudio: React.FC = () => {
	const [state, setState] = useState<string | null>(null);
	const ref = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		getData(src)
			.then((arrBuffer) => {
				setState(arrBuffer);
				if (ref.current && state) {
					ref.current.src = state;
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}, [state]);

	if (state) {
		return <audio ref={ref} controls />;
	}

	return null;
};
