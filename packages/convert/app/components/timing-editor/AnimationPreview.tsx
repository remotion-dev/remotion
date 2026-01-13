import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@remotion/design';
import React from 'react';
import {ReplayButton} from './ReplayButton';

export type AnimationType = 'Scale' | 'Translate' | 'Opacity';

export const AnimationPreview: React.FC<{
	readonly id: string;
	readonly animation: AnimationType;
	readonly onAnimationChange: (animation: AnimationType) => void;
	readonly onReplay: () => void;
}> = ({id, animation, onAnimationChange, onReplay}) => {
	return (
		<div className="text-center pb-5 w-full h-full flex flex-col">
			<div className="flex justify-center items-center flex-1">
				<div
					id={id}
					className="font-brand font-black text-[10vw] md:text-[5vw]"
					style={{
						borderRadius: 10,
					}}
				>
					Hello World
				</div>
			</div>
			<div className="flex flex-row gap-2 justify-center items-center">
				<Select
					value={animation}
					onValueChange={(v) => {
						onAnimationChange(v as AnimationType);
						onReplay();
					}}
				>
					<SelectTrigger className="w-[120px] rounded-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="Scale">Scale</SelectItem>
						<SelectItem value="Translate">Translate</SelectItem>
						<SelectItem value="Opacity">Opacity</SelectItem>
					</SelectContent>
				</Select>
				<ReplayButton onReplay={onReplay} />
			</div>
		</div>
	);
};
