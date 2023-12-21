import {useCallback, useEffect, useState} from 'react';
import {SourceMapConsumer} from 'source-map';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {getOriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {SOURCE_MAP_ENDPOINT} from '../../error-overlay/react-overlay/utils/source-map-endpoint';
import {LIGHT_TEXT, VERY_LIGHT_TEXT} from '../../helpers/colors';
import {getLocationOfSequence} from '../../helpers/get-location-of-sequence';
import {openInEditor} from '../../helpers/open-in-editor';
import {Spacing} from '../layout';
import {sendErrorNotification} from '../Notifications/NotificationCenter';
import {Spinner} from '../Spinner';

// @ts-expect-error
SourceMapConsumer.initialize({
	'lib/mappings.wasm': SOURCE_MAP_ENDPOINT,
});

export const TimelineStack: React.FC<{
	stack: string;
}> = ({stack}) => {
	const [originalLocation, setOriginalLocation] =
		useState<OriginalPosition | null>(null);

	const [hovered, setHovered] = useState(false);
	const [opening, setOpening] = useState(false);

	const onClick = useCallback(async () => {
		if (!originalLocation) {
			return;
		}

		setOpening(true);
		try {
			await openInEditor({
				originalColumnNumber: originalLocation.column,
				originalFileName: originalLocation.source,
				originalFunctionName: null,
				originalLineNumber: originalLocation.line,
				originalScriptCode: null,
			});
		} catch (err) {
			sendErrorNotification((err as Error).message);
		} finally {
			setOpening(false);
		}
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
				color: opening
					? VERY_LIGHT_TEXT
					: hovered
					? LIGHT_TEXT
					: VERY_LIGHT_TEXT,
				marginLeft: 10,
				cursor: 'pointer',
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
			}}
		>
			{originalLocation.source}:{originalLocation.line}
			{opening ? (
				<>
					<Spacing x={0.5} />
					<Spinner duration={0.5} size={12} />
				</>
			) : null}
		</div>
	);
};
