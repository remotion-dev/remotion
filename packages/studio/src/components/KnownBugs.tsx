import {OpenIssueButton} from './UpdateModal/OpenIssueButton';
import type {Bug} from './UpdateStatusContext';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const text: React.CSSProperties = {
	fontSize: 14,
	flex: 1,
};

export const KnownBugs: React.FC<{bugs: Bug[]}> = ({bugs}) => {
	const bugElements = bugs.map((bug) => {
		return (
			<div key={bug.description + bug.link} style={container}>
				<div style={text}>🪲 {bug.title}</div>

				<OpenIssueButton link={bug.link} />
			</div>
		);
	});
	return <div>{bugElements}</div>;
};
