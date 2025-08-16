import type { NextConfig } from "next";
import lingoCompiler from "lingo.dev/compiler";
import bundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(
  lingoCompiler.next({
    sourceLocale: "en",
    targetLocales: ["pl"],
    models: "lingo.dev",
    rsc: true,
    sourceRoot: "src",
  })(nextConfig)
);
