import { getStaticFiles } from "@remotion/studio";

export type PublicFolderFile = {
  filename: string;
  value: string;
};

export const getFiles = async () => {
  const files = getStaticFiles();
  const codeFiles = files.filter((file) => file.name.startsWith("code"));

  const contents = codeFiles.map(async (file): Promise<PublicFolderFile> => {
    const contents = await fetch(file.src);
    const text = await contents.text();

    return { filename: file.name, value: text };
  });

  return Promise.all(contents);
};
