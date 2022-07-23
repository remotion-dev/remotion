import { describe, expect, test } from "vitest";
import type { LogLevel } from "../config/log";
import {
  getLogLevel,
  isEqualOrBelowLogLevel,
  isValidLogLevel,
  setLogLevel,
} from "../config/log";
describe("test loglevel getter and setter", () => {
  test("default log level", () => {
    expect(getLogLevel()).toEqual("info");
  });
  test.each<LogLevel>(["verbose", "warn", "error", "info"])(
    "test for %s",
    (loglevel) => {
      setLogLevel(loglevel);
      expect(getLogLevel()).toEqual(loglevel);
    }
  );
});

describe("loglevel validity", () => {
  test.each<string>(["abc", "aalsadj", ""])(
    "is %s an invalid level",
    (level) => {
      expect(isValidLogLevel(level)).toEqual(false);
    }
  );
  test.each<string | LogLevel>(["verbose", "info", "warn", "error"])(
    "is %s a valid level",
    (level) => {
      expect(isValidLogLevel(level)).toEqual(true);
    }
  );
});

describe("loglevel comparison", () => {
  test.each<[LogLevel, LogLevel]>([
    ["verbose", "verbose"],
    ["verbose", "info"],
    ["verbose", "warn"],
    ["verbose", "error"],
    ["info", "info"],
    ["info", "warn"],
    ["info", "error"],
    ["warn", "warn"],
    ["warn", "error"],
    ["error", "error"],
  ])("%s is equal or below %s", (level1, level2) => {
    setLogLevel(level1);
    expect(isEqualOrBelowLogLevel(getLogLevel(), level2)).toEqual(true);
  });

  test.each<[LogLevel, LogLevel]>([
    ["info", "verbose"],
    ["warn", "verbose"],
    ["error", "verbose"],
    ["warn", "info"],
    ["error", "info"],
    ["error", "warn"],
  ])("%s is not equal or below %s", (level1, level2) => {
    setLogLevel(level1);
    expect(isEqualOrBelowLogLevel(getLogLevel(), level2)).toEqual(false);
  });
});
