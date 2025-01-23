import {getBoundingBox, scalePath, translatePath} from '@remotion/paths';
import React, {useMemo} from 'react';
import {SvgExtrusion} from '../3DContext/Extrusion';
import {FrontFaceG} from '../3DContext/FrontFaceG';
import {PathProvider} from '../3DContext/path-context';

export const G3D: React.FC<
	{
		readonly d: string;
		readonly children: React.ReactNode;
		readonly depth: number;
		readonly strokeWidth?: number;
	} & React.SVGAttributes<SVGGElement>
> = ({d, children, depth, strokeWidth}) => {
	const scaledPath = useMemo(() => {
		if (!strokeWidth) {
			return d;
		}

		const sizeOfPath = getBoundingBox(d);
		const scaleX = (sizeOfPath.width + (strokeWidth ?? 0)) / sizeOfPath.width;
		const scaleY = (sizeOfPath.height + (strokeWidth ?? 0)) / sizeOfPath.height;

		return translatePath(
			scalePath(d, scaleX, scaleY),
			-(strokeWidth ?? 0) / 2,
			-(strokeWidth ?? 0) / 2,
		);
	}, [d, strokeWidth]);

	return (
		<PathProvider d={scaledPath}>
			{depth > 0 ? <SvgExtrusion depth={depth} /> : null}
			<FrontFaceG depth={depth}>{children}</FrontFaceG>
		</PathProvider>
	);
};
