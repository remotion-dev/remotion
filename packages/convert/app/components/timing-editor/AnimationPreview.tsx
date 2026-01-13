import React from 'react';

export const AnimationPreview: React.FC<{
	readonly id: string;
	readonly animation: string;
}> = ({id, animation}) => {
	return (
		<div style={{textAlign: 'center', paddingBottom: 20}}>
			<div
				style={{
					height: 65,
					width: 80,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<div
					id={id}
					style={{
						height: 50,
						width: 50,
						backgroundColor: 'white',
						borderRadius: 10,
					}}
				/>
			</div>
			<div
				style={{
					fontSize: 13,
					color: 'rgb(101 101 106)',
				}}
			>
				{animation}
			</div>
		</div>
	);
};
