import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma and node-cron must stay outside the bundler — they load native/dynamic
  // files at runtime and are only ever used on the server (route handlers +
  // instrumentation).
  serverExternalPackages: ["@prisma/client", ".prisma/client", "node-cron"],

  // Only takes effect on webpack builds — every `build`/`dev` script (local
  // and vercel-build) passes --webpack, both because this machine's Windows
  // Application Control policy blocks Turbopack's native bindings, and
  // because Next 16 refuses to build under Turbopack at all once it sees a
  // custom `webpack` key here with no matching `turbopack` key, treating the
  // combination as a likely mistake. Simplest fix was consistency: use
  // --webpack everywhere so there's one code path, not two to keep in sync.
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
