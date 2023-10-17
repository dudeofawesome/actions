import * as esbuild from 'esbuild';

const dev = ['--dev', '--watch', '-w'].includes(process.argv[2]);

const contexts = await Promise.all([
  esbuild.context({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outdir: 'dist',
    format: 'cjs',
    platform: 'node',
    sourcemap: dev ? 'inline' : undefined,
  }),
]);

if (process.argv[2] === '--watch' || process.argv[2] === '-w') {
  console.log('watching...');
  await Promise.all(contexts.map((ctx) => ctx.watch()));
} else {
  try {
    await Promise.all(contexts.map((ctx) => ctx.rebuild()));
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
}
