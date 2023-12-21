import {useCallback, useEffect, useState} from 'react';
import {SourceMapConsumer} from 'source-map';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {getOriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {LIGHT_TEXT, VERY_LIGHT_TEXT} from '../../helpers/colors';
import {getLocationOfSequence} from '../../helpers/get-location-of-sequence';
import {openInEditor} from '../../helpers/open-in-editor';
import {Spacing} from '../layout';
import {Spinner} from '../Spinner';

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

	const [hovered, setHovered] = useState(false);

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

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	if (!originalLocation) {
		return null;
	}

	return (
		<div
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			onClick={onClick}
			style={{
				fontSize: 12,
				color: hovered ? LIGHT_TEXT : VERY_LIGHT_TEXT,
				marginLeft: 10,
				cursor: 'pointer',
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
			}}
		>
			{originalLocation.source}:{originalLocation.line}
			<Spacing x={0.5} />
			<Spinner duration={0.5} size={12} />
		</div>
	);
};
