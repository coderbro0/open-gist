const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * Plugin to enhance error visibility in watch mode
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',
  setup(build) {
    build.onStart(() => {
      console.log('[watch] 🚀 Build started...');
    });
    build.onEnd((result) => {
      if (result.errors.length) {
        console.error(`[watch] ❌ ${result.errors.length} build error(s) found:`);
        result.errors.forEach(({ text, location }) => {
          console.error(`✘ ${text}`);
          if (location) {
            console.error(`   → ${location.file}:${location.line}:${location.column}`);
          }
        });
      } else {
        console.log('[watch] ✅ Build finished with no errors');
      }
    });
  }
};

async function main() {
  // Build the extension
  const extensionBuild = {
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
  };

  if (watch) {
    console.log('[watch] 👀 Watching for file changes...');
    const extensionCtx = await esbuild.context(extensionBuild);
    await extensionCtx.watch();
    await webviewCtx.watch();
  } else {
    console.log('[build] 🚀 Building...');
    await esbuild.build(extensionBuild);
    console.log('[build] ✅ Build completed successfully');
  }
}

main().catch((err) => {
  console.error('[build] 💥 Build failed:', err);
  process.exit(1);
});