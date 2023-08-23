let offthreadVideoCacheSizeInBytes: number | null = null;

export const getOffthreadVideoCacheSizeInBytes = () => {
	return offthreadVideoCacheSizeInBytes;
};

export const setOffthreadVideoCacheSizeInBytes = (size: number | null) => {
	offthreadVideoCacheSizeInBytes = size;
};
