import {createLock} from './locks';

const {lock, unlock, waitForAllToBeDone} = createLock({timeout: 50000});

export const registerErrorSymbolicationLock = lock;

export const unlockErrorSymbolicationLock = unlock;

export const waitForSymbolicationToBeDone = waitForAllToBeDone;
