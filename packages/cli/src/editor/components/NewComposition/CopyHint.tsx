import React, {useEffect, useState} from 'react';
import type {ProjectInfo} from '../../../preview-server/project-info';
import {LIGHT_TEXT} from '../../helpers/colors';

const style: React.CSSProperties = {
	fontSize: 12,
	color: LIGHT_TEXT,
};

export const CopyHint: React.FC = () => {
	const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);

	useEffect(() => {
		fetch(`/api/project-info`)
			.then((res) => res.json())
			.then((res) => {
				setProjectInfo(res);
			})
			.catch((err) => {
				console.log('Error fetching info about the project', err);
				setProjectInfo(null);
			});
	}, []);

	if (!projectInfo?.videoFile) {
		return null;
	}

	return (
		<div style={style}>
			Copy this into <br /> your{' '}
			<span style={style} title={projectInfo.videoFile as string}>
				{projectInfo.relativeVideoFile}
			</span>{' '}
			file.
		</div>
	);
};
