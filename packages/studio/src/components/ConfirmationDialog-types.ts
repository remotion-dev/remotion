import type React from 'react';

export type ConfirmationDialogOptions = {
	readonly title: string;
	readonly message: React.ReactNode;
	readonly confirmLabel?: string;
	readonly cancelLabel?: string;
};

export type ConfirmationDialogFunction = (
	options: ConfirmationDialogOptions,
) => Promise<boolean>;
