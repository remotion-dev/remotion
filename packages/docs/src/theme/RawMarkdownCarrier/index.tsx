import React, {useEffect} from 'react';

export const encodeRawMarkdownForCarrier = (raw: string) => {
	return encodeURIComponent(raw);
};

export const decodeRawMarkdownFromCarrier = (encoded: string) => {
	return decodeURIComponent(encoded);
};

export default function RawMarkdownCarrier({raw}: {readonly raw: string}) {
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).__DOC_RAW = raw;
	}, [raw]);

	return (
		<span
			data-raw-markdown={encodeRawMarkdownForCarrier(raw)}
			hidden
			id="__doc_raw"
		/>
	);
}
