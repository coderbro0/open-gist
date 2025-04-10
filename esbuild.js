const esbuild = require("esbuild");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * Plugin for logging build start and error details during watch mode.
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',
  setup(build) {
    build.onStart(() => {
      console.log('[watch] 🚀 Build started...');
    });

    build.onEnd((result) => {
      if (result.errors.length > 0) {
        console.error(`[watch] ❌ ${result.errors.length} error(s):`);
        result.errors.forEach(({ text, location }) => {
          console.error(`✘ ${text}`);
          if (location) {
            console.error(`   ↳ ${location.file}:${location.line}:${location.column}`);
          }
        });
      } else {
        console.log('[watch] ✅ Build completed with no errors.');
      }
    });
  },
};

async function buildExtension() {
  const ctx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    target: ['node18'],
    outfile: 'dist/extension.js',
    external: ['vscode'],
    logLevel: 'silent',
    plugins: [esbuildProblemMatcherPlugin],
  });

  if (watch) {
    console.log('[watch] 👀 Watching for file changes...');
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log('[build] ✅ Build completed successfully.');
  }
}

buildExtension().catch((err) => {
  console.error('[build] 💥 Build failed:', err);
  process.exit(1);
});
