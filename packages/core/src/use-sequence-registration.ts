import {useContext, useEffect, useLayoutEffect, useRef} from 'react';
import type {TSequence} from './CompositionManager.js';
import {
	DisableSequenceRegistrationContext,
	SequenceManagerActionsContext,
} from './SequenceManager.js';

const useIsomorphicLayoutEffect =
	typeof window === 'undefined' ? useEffect : useLayoutEffect;

export const useSequenceRegistration = ({
	getSequence,
	id,
}: {
	getSequence: (() => TSequence) | null;
	id: string;
}) => {
	const {registerSequence, unregisterSequence, updateSequence} = useContext(
		SequenceManagerActionsContext,
	);
	const registrationDisabled = useContext(DisableSequenceRegistrationContext);
	const getSequenceRef = useRef(getSequence);
	getSequenceRef.current = getSequence;
	const lastRegisteredGetterRef = useRef<(() => TSequence) | null>(null);
	const registrationEnabled = getSequence !== null && !registrationDisabled;

	useEffect(() => {
		if (!registrationEnabled) {
			return;
		}

		const currentGetter = getSequenceRef.current;
		if (currentGetter === null) {
			throw new Error('Expected a sequence registration getter');
		}

		registerSequence(currentGetter());
		lastRegisteredGetterRef.current = currentGetter;

		return () => {
			lastRegisteredGetterRef.current = null;
			unregisterSequence(id);
		};
	}, [id, registerSequence, registrationEnabled, unregisterSequence]);

	// Commit metadata with the synchronous preview update, so continuous input
	// cannot leave lower-priority registration updates pending between commits.
	useIsomorphicLayoutEffect(() => {
		if (
			registrationDisabled ||
			getSequence === null ||
			updateSequence === null ||
			lastRegisteredGetterRef.current === null ||
			lastRegisteredGetterRef.current === getSequence
		) {
			return;
		}

		updateSequence(getSequence());
		lastRegisteredGetterRef.current = getSequence;
	}, [getSequence, registrationDisabled, updateSequence]);
};
