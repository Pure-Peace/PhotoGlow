import { build, $ } from 'bun'

await $`rm -rf dist`

const optionalRequirePackages = [
  'class-transformer',
  'class-validator',
  '@nestjs/microservices',
  '@nestjs/websockets',
  '@fastify/static',
  'ts-morph',
  '@apollo/gateway',
  '@apollo/subgraph',
  '@as-integrations/fastify',
  'class-transformer/storage',
  'mock-aws-s3',
  'aws-sdk',
  'nock',
]

const result = await build({
  entrypoints: ['./src/main.ts'],
  outdir: './dist',
  target: 'bun',
  minify: {
    syntax: true,
    whitespace: true,
    identifiers: true,
  },
  external: optionalRequirePackages.filter((pkg) => {
    try {
      require(pkg)
      return false
    } catch (_) {
      return true
    }
  }),
  splitting: true,
})

if (!result.success) {
  console.log(result.logs[0])
  process.exit(1)
}

console.log('Built successfully!')
