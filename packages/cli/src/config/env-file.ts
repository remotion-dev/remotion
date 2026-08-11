let envFile: string | null = null;

export const setDotEnvLocation = (file: string) => {
	envFile = file;
};

export const getDotEnvLocation = (): string | null => envFile;
