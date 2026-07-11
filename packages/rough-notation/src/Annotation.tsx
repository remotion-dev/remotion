import React, {useMemo} from 'react';
import type {ResolvedOptions} from 'roughjs/bin/core';
import type {z} from 'zod';
import {createAnnotation} from './create-annotation';
import type {annotationConfig} from './types';

type AnnotationComponentProps = Readonly<
	{
		children: React.ReactNode;
		progress: number;
		seed?: number;
		roughOptions?: Partial<ResolvedOptions>;
	} & z.input<typeof annotationConfig>
>;

export const AnnotationOnTop: React.FC<AnnotationComponentProps> = ({
	children,
	...props
}) => {
	const annotation = useMemo(() => {
		return createAnnotation();
	}, []);

	return (
		<annotation.Container>
			<annotation.Tracker>{children}</annotation.Tracker>
			<annotation.Annotation {...props} />
		</annotation.Container>
	);
};

export const AnnotationBehind: React.FC<AnnotationComponentProps> = ({
	children,
	...props
}) => {
	const annotation = useMemo(() => {
		return createAnnotation();
	}, []);

	return (
		<annotation.Container>
			<annotation.Annotation {...props} />
			<annotation.Tracker>{children}</annotation.Tracker>
		</annotation.Container>
	);
};
