import React, {SVGProps, useEffect, useState} from 'react';
import {
	ErrorRecord,
	getErrorRecord,
} from '../react-overlay/listen-to-runtime-errors';
import {ErrorDisplay} from './ErrorDisplay';
import {ErrorTitle} from './ErrorTitle';

const container: React.CSSProperties = {
	width: '100%',
	maxWidth: 1000,
	paddingLeft: 14,
	paddingRight: 14,
	marginLeft: 'auto',
	marginRight: 'auto',
	fontFamily: 'SF Pro Text, sans-serif',
	paddingTop: '5vh',
};

export const ErrorLoader: React.FC<{
	error: Error;
}> = ({error}) => {
	const [symbolicated, setSymbolicated] = useState<ErrorRecord | null>(null);

	useEffect(() => {
		getErrorRecord(error)
			.then((err) => {
				return setSymbolicated(err);
			})
			.catch((err) => {
				// TODO Handle
				console.log(err);
			});
	}, [error]);

	if (!symbolicated) {
		return (
			<div style={container}>
				<ErrorTitle symbolicating name={error.name} message={error.message} />
			</div>
		);
	}

	return (
		<div style={container}>
			<ErrorDisplay display={symbolicated} />
		</div>
	);
};
