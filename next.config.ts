import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma and node-cron must stay outside the bundler — they load native/dynamic
  // files at runtime and are only ever used on the server (route handlers +
  // instrumentation).
  serverExternalPackages: ["@prisma/client", ".prisma/client", "node-cron"],

  // Only used by the webpack build (see package.json — Turbopack's native
  // bindings are blocked by an Application Control policy on this machine).
  //
  // instrumentation.ts is compiled for the edge runtime as well as node, and
  // webpack tries to follow the dynamic import of node-cron into that bundle,
  // where `node:crypto` can't be resolved. The register() guard means the
  // module is never actually evaluated off nodejs, so leaving it as a plain
  // runtime require is correct.
  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = Array.isArray(config.externals)
        ? config.externals
        : config.externals
          ? [config.externals]
          : [];
      config.externals = [...externals, { "node-cron": "commonjs node-cron" }];
    }
    return config;
  },
};

export default nextConfig;
