import fs from "node:fs/promises";
import path from "node:path";

export class JsonFileReadError extends Error {
  readonly name = "JsonFileReadError";

  constructor(readonly filePath: string, message?: string) {
    super(message ?? `Failed to read JSON file: ${filePath}`);
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return (
    error instanceof Error &&
    "code" in error &&
    typeof error.code === "string"
  );
}

export async function readJsonFile(
  filePath: string,
): Promise<unknown | undefined> {
  let content: string;
  try {
    content = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return undefined;
    }
    throw new JsonFileReadError(filePath);
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new JsonFileReadError(filePath);
  }
}

export async function writeJsonFile(
  filePath: string,
  value: unknown,
): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(tempPath, JSON.stringify(value, null, 2));
  await fs.rename(tempPath, filePath);
}
