import type {M3uStream} from './get-streams';

export const fetchM3u8Stream = async (stream: M3uStream) => {
	const res = await fetch(stream.url);
	const json = await res.json();
	console.log(json);
};
