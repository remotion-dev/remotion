import {createContext, useContext} from 'react';

// Internal Studio experiment. Hidden Activity trees register on commit, so the
// experiment is disabled when the sequence manager falls back to effects.
export const SequenceActivityContext = createContext(false);
export const SequenceActivityDormantContext = createContext(false);

export const SequenceContent: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return useContext(SequenceActivityDormantContext) ? null : children;
};
