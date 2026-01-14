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
		<div className="flex flex-row gap-2 items-center">
			<Input
				placeholder="Enter username"
				className="w-full block flex-1"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			<Button
				className="hover:text-white hover:bg-warn transition-colors w-10 h-10 p-0 rounded-full"
				onClick={onDelete}
				type="button"
				disabled={disableDelete}
				aria-label="Delete member"
				depth={0.5}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 10 10"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M1 1L9 9M1 9L9 1"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
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
	}, []);

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
