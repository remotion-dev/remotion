import { VERSION } from "remotion/version";
import { execSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  cpSync,
  existsSync,
  rmSync,
  writeFileSync,
  readdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const tmpDir = tmpdir();
