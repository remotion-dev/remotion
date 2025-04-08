import {useCallback, useMemo, useState} from 'react';
import {openOriginalPositionInEditor} from '../../helpers/open-in-editor';
import {getOriginalSourceAttribution} from '../Timeline/TimelineStack/source-attribution';
import {useOriginalFileName} from './get-original-stack-trace';

const label: React.CSSProperties = {
	fontSize: 13,
};

export const ClickableFileName = ({stack}: {readonly stack: string}) => {
	const originalFileName = useOriginalFileName(stack);

	const [titleHovered, setTitleHovered] = useState(false);
	const hoverEffect = titleHovered && originalFileName;

	const onTitlePointerEnter = useCallback(() => {
		setTitleHovered(true);
	}, []);

	const onTitlePointerLeave = useCallback(() => {
		setTitleHovered(false);
	}, []);

	const style: React.CSSProperties = useMemo(() => {
		return {
			...label,
			cursor: originalFileName ? 'pointer' : undefined,
			borderBottom: hoverEffect ? '1px solid #fff' : 'none',
		};
	}, [originalFileName, hoverEffect]);

	const onClick = useCallback(async () => {
		if (!originalFileName) {
			return;
		}

		await openOriginalPositionInEditor(originalFileName);
	}, [originalFileName]);

	return (
		<span
			style={style}
			onClick={onClick}
			onPointerEnter={onTitlePointerEnter}
			onPointerLeave={onTitlePointerLeave}
		>
			{originalFileName
				? getOriginalSourceAttribution(originalFileName)
				: 'Loading...'}
		</span>
	);
};
