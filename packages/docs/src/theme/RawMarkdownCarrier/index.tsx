import React, {useEffect} from 'react';

export default function RawMarkdownCarrier({raw}: {readonly raw: string}) {
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).__DOC_RAW = raw;
	}, [raw]);

	return (
		<script
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={{__html: JSON.stringify(raw)}}
			id="__doc_raw"
			type="application/json"
		/>
	);
}
