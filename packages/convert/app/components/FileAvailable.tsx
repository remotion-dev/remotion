import React, {useCallback, useState} from 'react';
import ConvertUI from './ConvertUi';
import {Probe} from './Probe';

export const FileAvailable: React.FC<{
	readonly src: string;
	readonly setSrc: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({src, setSrc}) => {
	const [probeDetails, setProbeDetails] = useState(false);

	const clear = useCallback(() => {
		setSrc(null);
	}, [setSrc]);

	return (
		<>
			<div>
				<a onClick={clear}>Choose another file</a>
				<div className="gap-16 flex flex-row items-center justify-center">
					<Probe
						src={src}
						probeDetails={probeDetails}
						setProbeDetails={setProbeDetails}
					/>
					{probeDetails ? null : <ConvertUI src={src} />}
				</div>
			</div>
		</>
	);
};
