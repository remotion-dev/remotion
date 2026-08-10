import React from 'react';
import {ConvertUiSection} from './ConvertUiSection';
import {Slider} from './ui/slider';

export const CursorControls: React.FC<{
	readonly available: boolean;
	readonly showCursor: boolean;
	readonly setShowCursor: React.Dispatch<React.SetStateAction<boolean>>;
	readonly cursorScale: number;
	readonly setCursorScale: React.Dispatch<React.SetStateAction<number>>;
}> = ({available, showCursor, setShowCursor, cursorScale, setCursorScale}) => {
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
						value={[cursorScale]}
						onValueChange={(value) => setCursorScale(value[0])}
					/>
					<div className="flex flex-row text-sm text-gray-700 pt-2">
						<div className="flex-1">Cursor scale</div>
						<div className="tabular-nums">{cursorScale.toFixed(2)}×</div>
					</div>
				</div>
			) : null}
		</div>
	);
};
