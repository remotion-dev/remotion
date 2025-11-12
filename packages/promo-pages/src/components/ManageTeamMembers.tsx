import {Button, Input} from '@remotion/design';
import React, {useCallback, useState} from 'react';

type Member = {
	id: string;
	name: string;
};

function generateId() {
	return Math.random().toString(36).substr(2, 9);
}

const initialMembers: Member[] = [
	{id: generateId(), name: 'alice'},
	{id: generateId(), name: 'bob'},
];

const Row: React.FC<{
	readonly value: string;
	readonly onChange: (val: string) => void;
	readonly onDelete?: () => void;
	readonly disableDelete?: boolean;
}> = ({value, onChange, onDelete, disableDelete}) => {
	return (
		<div className="flex flex-row gap-2">
			<Input
				placeholder="Enter username"
				className="w-full block flex-1"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			<Button
				className="rounded-full h-14 w-14 justify-center items-center"
				onClick={onDelete}
				type="button"
				disabled={disableDelete}
				aria-label="Delete member"
			>
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
	const [members, setMembers] = useState<Member[]>(initialMembers);

	// One extra row for adding new member
	const displayedMembers = [...members, {id: 'NEW', name: ''}];

	const updateMember = useCallback(
		(idx: number, value: string) => {
			// If it's last "NEW" row, add as new member if not empty
			if (idx === members.length) {
				if (value.trim() !== '') {
					setMembers((prev) => [...prev, {id: generateId(), name: value}]);
				}
			} else {
				setMembers((prev) =>
					prev.map((m, i) => (i === idx ? {...m, name: value} : m)),
				);
			}
		},
		[members.length],
	);

	const deleteMember = useCallback((idx: number) => {
		setMembers((prev) => prev.filter((_, i) => i !== idx));
	}, []);

	const [loading, setLoading] = useState(false);

	const save = useCallback(() => {
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
		}, 1000);
	}, [members]);

	return (
		<>
			<h2>Manage team members</h2>
			<p className="font-brand">Add a new team member to your team.</p>
			{displayedMembers.map((member, idx) => (
				// eslint-disable-next-line react/no-array-index-key
				<React.Fragment key={idx}>
					<Row
						value={member.name}
						onChange={(val) => updateMember(idx, val)}
						onDelete={
							idx < members.length ? () => deleteMember(idx) : undefined
						}
						disableDelete={idx >= members.length}
					/>
					<div className="h-2" />
				</React.Fragment>
			))}
			<div className="h-4" />
			<div className="flex flex-row justify-end">
				<Button
					className="bg-brand text-white"
					loading={loading}
					onClick={save}
				>
					Save
				</Button>
			</div>
		</>
	);
};
