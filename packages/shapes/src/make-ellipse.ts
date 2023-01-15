export type MakeEllipseOptions = {
	rx?: number | string;
	ry?: number | string;
};

export const makeEllipse = ({rx = 50, ry = 50}: MakeEllipseOptions) => {
	return `M ${rx} ${0} a ${rx} ${ry} 0 1 0 1 0`;
};
