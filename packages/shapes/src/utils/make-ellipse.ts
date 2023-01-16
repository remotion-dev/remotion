import type {ShapeInfo} from './shape-info';

const rxParam = {
	name: 'rx' as const,
	description: 'The x-radius of the ellipse',
	exampleValue: 10 as number,
};

const ryParam = {
	name: 'ry' as const,
	description: 'The y-radius of the ellipse',
	exampleValue: 10 as number,
};

const options = [rxParam, ryParam] as const;

type Values = typeof options[number];

export type MakeEllipseOptions = {
	[key in Values['name']]: Values['exampleValue'];
};

export const makeEllipse = ({rx, ry}: MakeEllipseOptions): ShapeInfo => {
	return {
		width: rx * 2,
		height: ry * 2,
		path: `M ${rx} ${0} a ${rx} ${ry} 0 1 0 1 0`,
	};
};
