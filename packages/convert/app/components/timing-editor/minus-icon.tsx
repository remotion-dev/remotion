import type {SVGProps} from 'react';

export const MinusIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			fill="currentcolor"
			viewBox="0 0 640 640"
			width={20}
			height={20}
			{...props}
		>
			<path d="M96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320z" />
		</svg>
	);
};
