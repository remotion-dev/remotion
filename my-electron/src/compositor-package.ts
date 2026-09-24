type LinuxLibc = "gnu" | "musl";

const getLinuxLibc = (): LinuxLibc => {
  const report = process.report?.getReport();

  if (!report || typeof report === "string") {
    return "gnu";
  }

  const header = (report as {header?: {glibcVersionRuntime?: string}}).header;
  return header?.glibcVersionRuntime ? "gnu" : "musl";
};

function getLinuxCompositorPackage(arch: string, libc: LinuxLibc) {
  switch (arch) {
    case "x64":
      return libc === "musl"
        ? "@remotion/compositor-linux-x64-musl"
        : "@remotion/compositor-linux-x64-gnu";
    case "arm64":
      return libc === "musl"
        ? "@remotion/compositor-linux-arm64-musl"
        : "@remotion/compositor-linux-arm64-gnu";
    default:
      throw new Error(`Unsupported Linux architecture: ${arch}`);
  }
}

export const getCompositorPackage = ({
  arch,
  platform,
  libc = platform === "linux" ? getLinuxLibc() : undefined,
}: {
  arch: string;
  platform: string;
  libc?: LinuxLibc;
}) => {
  switch (platform) {
    case "darwin":
      if (arch === "arm64") {
        return "@remotion/compositor-darwin-arm64";
      }

      if (arch === "x64") {
        return "@remotion/compositor-darwin-x64";
      }

      break;
    case "linux":
      return getLinuxCompositorPackage(arch, libc ?? getLinuxLibc());
    case "win32":
      if (arch === "x64") {
        return "@remotion/compositor-win32-x64-msvc";
      }

      break;
    default:
      break;
  }

  throw new Error(`Unsupported platform/arch combination: ${platform}/${arch}`);
};
