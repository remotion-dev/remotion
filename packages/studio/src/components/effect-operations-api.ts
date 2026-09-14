import type {
	AddEffectRequest,
	DeleteEffectRequest,
	DuplicateEffectRequest,
	PasteEffectsRequest,
	ReorderEffectRequest,
	SaveEffectPropsRequest,
	SaveMultipleEffectPropsRequest,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

const getBrowserEffectOperations = () =>
	getBrowserStudioOperations()?.effects ?? null;

export const addEffect = (request: AddEffectRequest) =>
	getBrowserEffectOperations()?.addEffect(request) ??
	callApi('/api/add-effect', request);

export const deleteEffects = (request: DeleteEffectRequest) =>
	getBrowserEffectOperations()?.deleteEffects(request) ??
	callApi('/api/delete-effect', request);

export const duplicateEffects = (request: DuplicateEffectRequest) =>
	getBrowserEffectOperations()?.duplicateEffects(request) ??
	callApi('/api/duplicate-effect', request);

export const pasteEffects = (request: PasteEffectsRequest) =>
	getBrowserEffectOperations()?.pasteEffects(request) ??
	callApi('/api/paste-effects', request);

export const reorderEffect = (request: ReorderEffectRequest) =>
	getBrowserEffectOperations()?.reorderEffect(request) ??
	callApi('/api/reorder-effect', request);

export const saveEffectProps = (request: SaveEffectPropsRequest) =>
	getBrowserEffectOperations()?.saveEffectProps(request) ??
	callApi('/api/save-effect-props', request);

export const saveMultipleEffectProps = (
	request: SaveMultipleEffectPropsRequest,
) =>
	getBrowserEffectOperations()?.saveMultipleEffectProps(request) ??
	callApi('/api/save-multiple-effect-props', request);
