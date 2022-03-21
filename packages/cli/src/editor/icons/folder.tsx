import React, {SVGProps} from 'react';

// TODO: Replace folder icon
export const CollapsedFolderIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg viewBox="0 0 512 512" {...props}>
			<g>
				<path fill="white" d="M0 0h512v512H0z" />
			</g>
		</svg>
	);
};

export const ExpandedFolderIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg viewBox="0 0 512 512" {...props}>
			<g>
				<path fill="white" d="M0 0h512v512H0z" />
			</g>
		</svg>
	);
};
