import React, {useEffect} from 'react';

export const serializeRawMarkdownForScript = (raw: string) => {
	return JSON.stringify(raw).replace(/</g, '\\u003c');
};

export default function RawMarkdownCarrier({raw}: {readonly raw: string}) {
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).__DOC_RAW = raw;
	}, [raw]);

	return (
		<script
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={{__html: serializeRawMarkdownForScript(raw)}}
			id="__doc_raw"
			type="application/json"
		/>
	);
}
