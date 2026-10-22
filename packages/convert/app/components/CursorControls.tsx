import {Slider} from '@remotion/design';
import React from 'react';
import {ConvertUiSection} from './ConvertUiSection';

export const CursorControls: React.FC<{
	readonly available: boolean;
	readonly showCursor: boolean;
	readonly setShowCursor: React.Dispatch<React.SetStateAction<boolean>>;
	readonly cursorScale: number;
	readonly setCursorScale: React.Dispatch<React.SetStateAction<number>>;
	readonly cursorPressedScale: number;
	readonly setCursorPressedScale: React.Dispatch<React.SetStateAction<number>>;
}> = ({
	available,
	showCursor,
	setShowCursor,
	cursorScale,
	setCursorScale,
	cursorPressedScale,
	setCursorPressedScale,
}) => {
	if (!available) {
		return null;
	}

	return (
		<div>
			<ConvertUiSection active={showCursor} setActive={setShowCursor}>
				Show cursor
			</ConvertUiSection>
			{showCursor ? (
				<div className="mt-4">
					<Slider
						aria-label="Cursor scale"
						min={0.25}
						max={3}
						step={0.05}
						value={cursorScale}
						onChange={setCursorScale}
					/>
					<div className="flex flex-row text-sm text-gray-700 pt-2">
						<div className="flex-1">Cursor scale</div>
						<div className="tabular-nums">{cursorScale.toFixed(2)}×</div>
					</div>
					<Slider
						className="mt-4"
						aria-label="Pressed cursor scale"
						min={0.25}
						max={1}
						step={0.05}
						value={cursorPressedScale}
						onChange={setCursorPressedScale}
					/>
					<div className="flex flex-row text-sm text-gray-700 pt-2">
						<div className="flex-1">Pressed cursor scale</div>
						<div className="tabular-nums">{cursorPressedScale.toFixed(2)}×</div>
					</div>
				</div>
			) : null}
		</div>
	);
};
