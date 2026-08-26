import { pathToFileURL } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

/**
 * Maps the `@/…` path alias from tsconfig to real files so the test runner can
 * import the same modules the app does, without a bundler.
 */
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = path.join(projectRoot, "src", specifier.slice(2));
    const withExt = /\.[jt]sx?$/.test(target) ? target : `${target}.ts`;
    return nextResolve(pathToFileURL(withExt).href, context);
  }
  return nextResolve(specifier, context);
}
