export const getCompositorPackage = ({
  arch,
  platform,
}: {
  arch: string;
  platform: string;
}) => {
  if (platform === "darwin" && arch === "arm64") {
    return "@remotion/compositor-darwin-arm64";
  }

  if (platform === "darwin" && arch === "x64") {
    return "@remotion/compositor-darwin-x64";
  }

  if (platform === "linux" && arch === "x64") {
    return "@remotion/compositor-linux-x64-gnu";
  }

  if (platform === "linux" && arch === "arm64") {
    return "@remotion/compositor-linux-arm64-gnu";
  }

  if (platform === "win32" && arch === "x64") {
    return "@remotion/compositor-win32-x64-msvc";
  }

  throw new Error(`Unsupported platform/arch combination: ${platform}/${arch}`);
};
