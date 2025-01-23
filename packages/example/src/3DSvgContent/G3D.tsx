import React from 'react';
import {SvgExtrusion} from '../3DContext/Extrusion';
import {FrontFaceG} from '../3DContext/FrontFaceG';
import {PathProvider} from '../3DContext/path-context';

export const G3D: React.FC<
	{
		readonly d: string;
		readonly children: React.ReactNode;
		readonly depth: number;
	} & React.SVGAttributes<SVGGElement>
> = ({d, children, depth}) => {
	return (
		<PathProvider d={d}>
			<SvgExtrusion depth={depth} />
			<FrontFaceG depth={depth}>{children}</FrontFaceG>
		</PathProvider>
	);
};
