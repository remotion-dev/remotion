import type {SVGProps} from 'react';
import React from 'react';

// Font Awesome Pro v7.3.1, Copyright 2026 Fonticons, Inc.
// https://fontawesome.com/license (Commercial License)
export const DuplicateIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" {...props}>
			<path
				fill={color}
				d="M352 544L128 544C110.3 544 96 529.7 96 512L96 288C96 270.3 110.3 256 128 256L176 256L176 224L128 224C92.7 224 64 252.7 64 288L64 512C64 547.3 92.7 576 128 576L352 576C387.3 576 416 547.3 416 512L416 464L384 464L384 512C384 529.7 369.7 544 352 544zM288 384C270.3 384 256 369.7 256 352L256 128C256 110.3 270.3 96 288 96L512 96C529.7 96 544 110.3 544 128L544 352C544 369.7 529.7 384 512 384L288 384zM224 352C224 387.3 252.7 416 288 416L512 416C547.3 416 576 387.3 576 352L576 128C576 92.7 547.3 64 512 64L288 64C252.7 64 224 92.7 224 128L224 352z"
			/>
		</svg>
	);
};
