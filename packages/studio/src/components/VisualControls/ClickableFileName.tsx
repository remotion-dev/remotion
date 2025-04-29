import {useCallback, useMemo, useState} from 'react';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {LIGHT_COLOR} from '../../helpers/colors';
import {openOriginalPositionInEditor} from '../../helpers/open-in-editor';
import {SCHEMA_EDITOR_FIELDSET_PADDING} from '../RenderModal/SchemaEditor/Fieldset';
import {getOriginalSourceAttribution} from '../Timeline/TimelineStack/source-attribution';

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

const container: React.CSSProperties = {
	paddingLeft: SCHEMA_EDITOR_FIELDSET_PADDING,
	paddingTop: SCHEMA_EDITOR_FIELDSET_PADDING / 2,
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
			fontSize: 12,
			cursor: originalFileName.type === 'loaded' ? 'pointer' : undefined,
			borderBottom: hoverEffect ? '1px solid #fff' : 'none',
			color: hoverEffect ? '#fff' : LIGHT_COLOR,
		};
	}, [originalFileName, hoverEffect]);

	const onClick = useCallback(async () => {
		if (originalFileName.type !== 'loaded') {
			return;
		}

		await openOriginalPositionInEditor(originalFileName.originalFileName);
	}, [originalFileName]);

	return (
		<div style={container}>
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
		</div>
	);
};
