import React, {useEffect, useState} from 'react';
import {RemTextarea} from './NewComposition/RemTextarea';

const jsonStyle: React.CSSProperties = {
	marginTop: 14,
	marginBottom: 14,
	fontFamily: 'monospace',
	flex: 1,
};

export const JSONViewer: React.FC<{
	readonly src: string;
}> = ({src}) => {
	const [json, setJson] = useState<string | null>(null);

	useEffect(() => {
		fetch(src)
			.then((res) => res.json())
			.then((jsonRes) => {
				setJson(JSON.stringify(jsonRes, null, 2));
			});
	}, [src]);

	return (
		<RemTextarea
			value={json ?? undefined}
			status="ok"
			onChange={() => {
				return null;
			}}
			style={jsonStyle}
		/>
	);
};
