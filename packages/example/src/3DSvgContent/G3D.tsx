import {getBoundingBox, scalePath, translatePath} from '@remotion/paths';
import React, {useMemo} from 'react';
import {SvgExtrusion} from '../3DContext/Extrusion';
import {FrontFaceG} from '../3DContext/FrontFaceG';
import {PathProvider} from '../3DContext/path-context';
import {useTransformations} from '../3DContext/transformation-context';
import {isBacksideVisible} from '../3DContext/viewing-frontside';

export const G3D: React.FC<
	{
		readonly d: string;
		readonly children: React.ReactNode;
		readonly backFace: string;
		readonly depth: number;
		readonly strokeWidth?: number;
	} & React.SVGAttributes<SVGGElement>
> = ({d, children, depth, strokeWidth, backFace}) => {
	const isFrontFacing = isBacksideVisible(useTransformations());
	const backFaceEl = <path d={d} fill={backFace} />;

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
			{!isFrontFacing ? (
				<FrontFaceG type="front" depth={depth}>
					{children}
				</FrontFaceG>
			) : (
				<FrontFaceG type="back" depth={depth}>
					{backFaceEl}
				</FrontFaceG>
			)}
		</PathProvider>
	);
};
