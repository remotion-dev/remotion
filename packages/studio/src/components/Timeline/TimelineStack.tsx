import {useCallback, useEffect, useState} from 'react';
import {NoReactInternals} from 'remotion/no-react';
import {SourceMapConsumer} from 'source-map';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {getOriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {VERY_LIGHT_TEXT} from '../../helpers/colors';
import {getLocationOfSequence} from '../../helpers/get-location-of-sequence';
import {openInEditor} from '../../helpers/open-in-editor';

export const TimelineStack: React.FC<{
	stack: string;
}> = ({stack}) => {
	const [originalLocation, setOriginalLocation] =
		useState<OriginalPosition | null>(null);

	const onClick = useCallback(() => {
		if (!originalLocation) {
			return;
		}

		openInEditor({
			originalColumnNumber: originalLocation.column,
			originalFileName: originalLocation.source,
			originalFunctionName: null,
			originalLineNumber: originalLocation.line,
			originalScriptCode: null,
		}).catch(() => {
			// TODO: Show error notification
		});
	}, [originalLocation]);

	useEffect(() => {
		const location = getLocationOfSequence(stack);

		if (location) {
			fetch('/' + NoReactInternals.bundleMapName)
				.then((res) => res.json())
				.then((sourceMap) => {
					const map = new SourceMapConsumer(sourceMap);
					return getOriginalPosition(
						map,
						location.lineNumber as number,
						location.columnNumber as number,
					);
				})
				.then((frame) => {
					setOriginalLocation(frame);
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}, [stack]);

	if (!originalLocation) {
		return null;
	}

	return (
		<div
			onClick={onClick}
			style={{
				fontSize: 12,
				color: VERY_LIGHT_TEXT,
				marginLeft: 10,
				cursor: 'pointer',
			}}
		>
			{originalLocation.source}:{originalLocation.line}
		</div>
	);
};
