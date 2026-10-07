import {useContext, useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import type {TSequence} from './CompositionManager.js';
import {
	DisableSequenceRegistrationContext,
	SequenceCommitRegistrationContext,
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
	const commitRegistrationEnabled = useContext(
		SequenceCommitRegistrationContext,
	);
	const getSequenceRef = useRef(getSequence);
	useIsomorphicLayoutEffect(() => {
		getSequenceRef.current = getSequence;
	}, [getSequence]);
	const lastRegisteredGetterRef = useRef<(() => TSequence) | null>(null);
	const registrationEnabled =
		getSequence !== null && !registrationDisabled && !commitRegistrationEnabled;
	const registration = useMemo(
		() =>
			commitRegistrationEnabled && !registrationDisabled && getSequence !== null
				? getSequence()
				: null,
		[commitRegistrationEnabled, getSequence, registrationDisabled],
	);

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

	// Commit fallback metadata with the synchronous preview update, so continuous input
	// cannot leave lower-priority registration updates pending between commits.
	useIsomorphicLayoutEffect(() => {
		if (
			commitRegistrationEnabled ||
			registrationDisabled ||
			getSequence === null ||
			lastRegisteredGetterRef.current === null ||
			lastRegisteredGetterRef.current === getSequence
		) {
			return;
		}

		updateSequence(getSequence());
		lastRegisteredGetterRef.current = getSequence;
	}, [
		commitRegistrationEnabled,
		getSequence,
		registrationDisabled,
		updateSequence,
	]);

	return registration;
};
