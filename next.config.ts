import type { NextConfig } from "next";
import lingoCompiler from "lingo.dev/compiler";

const nextConfig: NextConfig = {};

export default lingoCompiler.next({
  sourceLocale: "en",
  targetLocales: ["pl"],
  models: "lingo.dev",
  rsc: true,
  sourceRoot: "src",
  debug: false,
})(nextConfig);
