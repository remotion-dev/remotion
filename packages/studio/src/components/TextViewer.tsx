import {useEffect, useState} from 'react';

const textStyle: React.CSSProperties = {
	margin: 14,
	fontFamily: 'monospace',
	flex: 1,
	color: 'white',
	whiteSpace: 'pre-wrap',
};

export const TextViewer: React.FC<{src: string}> = ({src}) => {
	const [txt, setTxt] = useState<string>('');
	useEffect(() => {
		fetch(src).then(async (res) => {
			if (!res.ok || !res.body) {
				return;
			}

			const text = await res.text();
			setTxt(text);
		});
	}, [src]);

	return <div style={textStyle}>{txt} </div>;
};
