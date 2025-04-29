import {useCallback, useMemo, useState} from 'react';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {openOriginalPositionInEditor} from '../../helpers/open-in-editor';
import {getOriginalSourceAttribution} from '../Timeline/TimelineStack/source-attribution';

const label: React.CSSProperties = {
	fontSize: 13,
};

export type OriginalFileNameState =
	| {
			type: 'loaded';
			originalFileName: OriginalPosition;
	  }
	| {
			type: 'error';
			error: Error;
	  }
	| {
			type: 'loading';
	  };

export const ClickableFileName = ({
	originalFileName,
}: {
	readonly originalFileName: OriginalFileNameState;
}) => {
	const [titleHovered, setTitleHovered] = useState(false);
	const hoverEffect = titleHovered && originalFileName.type === 'loaded';

	const onTitlePointerEnter = useCallback(() => {
		setTitleHovered(true);
	}, []);

	const onTitlePointerLeave = useCallback(() => {
		setTitleHovered(false);
	}, []);

	const style: React.CSSProperties = useMemo(() => {
		return {
			...label,
			cursor: originalFileName.type === 'loaded' ? 'pointer' : undefined,
			borderBottom: hoverEffect ? '1px solid #fff' : 'none',
		};
	}, [originalFileName, hoverEffect]);

	const onClick = useCallback(async () => {
		if (originalFileName.type !== 'loaded') {
			return;
		}

		await openOriginalPositionInEditor(originalFileName.originalFileName);
	}, [originalFileName]);

	return (
		<span
			style={style}
			onClick={onClick}
			onPointerEnter={onTitlePointerEnter}
			onPointerLeave={onTitlePointerLeave}
		>
			{originalFileName.type === 'loaded'
				? getOriginalSourceAttribution(originalFileName.originalFileName)
				: originalFileName.type === 'loading'
					? 'Loading...'
					: 'Error loading'}
		</span>
	);
};
