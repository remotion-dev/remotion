import {Checkbox} from './ui/checkbox';

export const ConvertAdvancedSettings: React.FC<{
	canPixelManipulate: boolean;
	flipHorizontal: boolean;
	flipVertical: boolean;
	setFlipVertical: React.Dispatch<React.SetStateAction<boolean>>;
	setFlipHorizontal: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
	canPixelManipulate,
	flipHorizontal,
	setFlipHorizontal,
	flipVertical,
	setFlipVertical,
}) => {
	return (
		<>
			{canPixelManipulate ? (
				<>
					<div className="flex flex-row">
						<Checkbox
							checked={flipHorizontal}
							id="flipHorizontal"
							onCheckedChange={() => setFlipHorizontal((e) => !e)}
						/>
						<div className="w-2" />
						<div className="grid gap-1.5 leading-none">
							<label
								htmlFor="flipHorizontal"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Flip video horizontally
							</label>
						</div>
					</div>
					<div className="flex flex-row">
						<Checkbox
							checked={flipVertical}
							id="flipVertical"
							onCheckedChange={() => setFlipVertical((e) => !e)}
						/>
						<div className="w-2" />
						<div className="grid gap-1.5 leading-none">
							<label
								htmlFor="flipVertical"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Flip video vertically
							</label>
						</div>
					</div>
				</>
			) : null}
		</>
	);
};
