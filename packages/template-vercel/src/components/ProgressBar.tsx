import React, { useMemo } from "react";

export const ProgressBar: React.FC<{
	progress: number;
}> = ({ progress }) => {
	const fill: React.CSSProperties = useMemo(() => {
		return {
			width: `${progress * 100}%`,
		};
	}, [progress]);

	return (
		<div>
			<div className="w-full h-2.5 rounded-md overflow-hidden appearance-none bg-unfocused-border-color mt-2.5 mb-6">
				<div
					className="bg-foreground h-2.5"
					style={fill}
				></div>
			</div>
		</div>
	);
};
