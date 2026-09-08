import type {SVGProps} from 'react';

export const UploadIcon: React.FC<
	SVGProps<SVGSVGElement> & {readonly color: string}
> = ({color, ...props}) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
			<path
				fill={color}
				d="M240 54.6L240 336c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-281.4-84.7 84.7c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l112-112c6.2-6.2 16.4-6.2 22.6 0l112 112c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L240 54.6zM160 320l-96 0c-17.7 0-32 14.3-32 32l0 64c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32l-96 0 0-32 96 0c35.3 0 64 28.7 64 64l0 64c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l96 0 0 32zm160 64a24 24 0 1 1 48 0 24 24 0 1 1-48 0z"
			/>
		</svg>
	);
};
