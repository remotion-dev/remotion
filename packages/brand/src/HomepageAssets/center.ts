import {getBoundingBox, translatePath} from '@remotion/paths';

export const centerPath = (path: string) => {
	const bBox = getBoundingBox(path);
	const buttonWidth = bBox.x2 - bBox.x1;
	const buttonHeight = bBox.y2 - bBox.y1;

	const centeredButton = translatePath(
		path,
		-buttonWidth / 2,
		-buttonHeight / 2
	);
	return centeredButton;
};
