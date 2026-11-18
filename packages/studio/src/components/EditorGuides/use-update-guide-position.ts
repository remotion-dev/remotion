import {useCallback, useContext} from 'react';
import {
	EditorShowGuidesRefContext,
	persistGuidesList,
} from '../../state/editor-guides';

export const useUpdateGuidePosition = () => {
	const guidesRef = useContext(EditorShowGuidesRefContext);
	return useCallback(
		({
			guideId,
			position,
			persist,
		}: {
			guideId: string;
			position: number;
			persist: boolean;
		}) => {
			guidesRef?.current.setGuidesList((guides) => {
				const next = guides.map((guide) =>
					guide.id === guideId
						? {...guide, position: Math.round(position), show: true}
						: guide,
				);
				if (persist) persistGuidesList(next);
				return next;
			});
		},
		[guidesRef],
	);
};
