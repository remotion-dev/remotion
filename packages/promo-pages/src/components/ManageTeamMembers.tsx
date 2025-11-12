import {Button, Input} from '@remotion/design';
import React from 'react';

const Row: React.FC<{}> = () => {
	return (
		<div className="flex flex-row gap-2">
			<Input placeholder="Enter username" className="w-full block flex-1" />
			<Button className="rounded-full h-14 w-14 justify-center items-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 384 512"
					className="h-4"
				>
					<path
						fill="currentcolor"
						d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"
					/>
				</svg>
			</Button>
		</div>
	);
};

export const ManageTeamMembers: React.FC = () => {
	return (
		<>
			<h2>Manage team members</h2>
			<p className="font-brand">Add a new team member to your team.</p>
			{new Array(3).fill(true).map((_, index) => {
				return (
					// eslint-disable-next-line react/no-array-index-key
					<React.Fragment key={index}>
						<Row />
						<div className="h-2" />
					</React.Fragment>
				);
			})}
			<div className="h-4" />
			<div className="flex flex-row justify-end">
				<Button className="bg-brand text-white">Save</Button>
			</div>
		</>
	);
};
