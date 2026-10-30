import {createContext} from 'react';
import type {PreferredEffectBackend} from './effect-types.js';

export const PreferredEffectBackendContext =
	createContext<PreferredEffectBackend | null>(null);

export {validatePreferredEffectBackend} from './validate-preferred-effect-backend.js';
