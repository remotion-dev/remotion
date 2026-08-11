import type {
	AvihBox,
	ListBox,
	RiffBox,
	RiffStructure,
	StrhBox,
} from './riff-box';

export const isRiffAvi = (structure: RiffStructure): boolean => {
	return structure.boxes.some(
		(box) => box.type === 'riff-header' && box.fileType === 'AVI',
	);
};

export const getHdlrBox = (structure: RiffStructure): ListBox | null => {
	return structure.boxes.find(
		(box) => box.type === 'list-box' && box.listType === 'hdrl',
	) as ListBox | null;
};

export const getAvihBox = (structure: RiffStructure): AvihBox | null => {
	const hdlrBox = getHdlrBox(structure);

	if (!hdlrBox) {
		return null;
	}

	return hdlrBox.children.find(
		(box) => box.type === 'avih-box',
	) as AvihBox | null;
};

export const getStrlBoxes = (structure: RiffStructure): ListBox[] => {
	const hdlrBox = getHdlrBox(structure);

	if (!hdlrBox) {
		return [];
	}

	return hdlrBox.children.filter(
		(box) => box.type === 'list-box' && box.listType === 'strl',
	) as ListBox[];
};

export const getStrhBox = (strlBoxChildren: RiffBox[]): StrhBox | null => {
	return strlBoxChildren.find(
		(box) => box.type === 'strh-box',
	) as StrhBox | null;
};
