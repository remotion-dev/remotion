import React, {useCallback} from 'react';
import {MultiSelectItem} from './MultiSelect';

const Mirror: React.FC<{
	readonly label: string;
	readonly children: React.ReactNode;
	readonly active: boolean;
	readonly onClick: () => void;
	readonly disabled: boolean;
}> = ({label, children, active, onClick, disabled}) => {
	return (
		<MultiSelectItem disabled={disabled} active={active} onClick={onClick}>
			<div
				style={{height: 40, width: 40}}
				className="flex items-center justify-center"
			>
				{children}
			</div>
			<div className="h-2" />
			<div className="text-center font-brand font-medium">{label}</div>
		</MultiSelectItem>
	);
};

export const MirrorComponents: React.FC<{
	readonly flipVertical: boolean;
	readonly flipHorizontal: boolean;
	readonly setFlipVertical: React.Dispatch<React.SetStateAction<boolean>>;
	readonly setFlipHorizontal: React.Dispatch<React.SetStateAction<boolean>>;
	readonly canPixelManipulate: boolean;
}> = ({
	flipHorizontal,
	flipVertical,
	setFlipHorizontal,
	setFlipVertical,
	canPixelManipulate,
}) => {
	const toggleHorizontal = useCallback(
		() => setFlipHorizontal((prev) => !prev),
		[setFlipHorizontal],
	);
	const toggleVertical = useCallback(
		() => setFlipVertical((prev) => !prev),
		[setFlipVertical],
	);

	return (
		<div>
			<div className="flex flex-row gap-2 mt-3 mb-3">
				<Mirror
					active={flipHorizontal && canPixelManipulate}
					label="Horizontal"
					disabled={!canPixelManipulate}
					onClick={toggleHorizontal}
				>
					<svg style={{height: 24, width: 24}} viewBox="0 0 512 512">
						<path
							fill="currentcolor"
							d="M256 0c-13.3 0-24 10.7-24 24l0 464c0 13.3 10.7 24 24 24s24-10.7 24-24l0-464c0-13.3-10.7-24-24-24zM492.2 98.4c-12-5-25.7-2.2-34.9 6.9l-128 128c-12.5 12.5-12.5 32.8 0 45.3l128 128c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-256c0-12.9-7.8-24.6-19.8-29.6zm-472.5 0C7.8 103.4 0 115.1 0 128L0 384c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9z"
						/>
					</svg>
				</Mirror>
				<Mirror
					active={flipVertical && canPixelManipulate}
					label="Vertical"
					disabled={!canPixelManipulate}
					onClick={toggleVertical}
				>
					<svg style={{height: 24, width: 24}} viewBox="0 0 512 512">
						<path
							fill="currentcolor"
							d="M0 256c0-13.3 10.7-24 24-24l464 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 280c-13.3 0-24-10.7-24-24zM98.4 19.8C103.4 7.8 115.1 0 128 0L384 0c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9zm0 472.5c-5-12-2.2-25.7 6.9-34.9l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c9.2 9.2 11.9 22.9 6.9 34.9s-16.6 19.8-29.6 19.8l-256 0c-12.9 0-24.6-7.8-29.6-19.8z"
						/>
					</svg>
				</Mirror>
			</div>
			{canPixelManipulate ? null : (
				<div className="text-gray-700 text-sm">
					Re-encode the video stream in order to apply rotation.
				</div>
			)}
		</div>
	);
};
