import {useCallback, useEffect, useState} from 'react';
import {SourceMapConsumer} from 'source-map';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {getOriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {VERY_LIGHT_TEXT} from '../../helpers/colors';
import {getLocationOfSequence} from '../../helpers/get-location-of-sequence';
import {openInEditor} from '../../helpers/open-in-editor';

// TODO: Use local version
// @ts-expect-error
SourceMapConsumer.initialize({
	'lib/mappings.wasm': 'https://unpkg.com/source-map@0.7.3/lib/mappings.wasm',
});

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
			fetch(`${location.fileName}.map`)
				.then((res) => res.json())
				.then((sourceMap) => {
					return new Promise((resolve) => {
						SourceMapConsumer.with(sourceMap, null, (consumer) => {
							resolve(consumer);
						});
					});
				})
				.then((map) => {
					return getOriginalPosition(
						map as SourceMapConsumer,
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
