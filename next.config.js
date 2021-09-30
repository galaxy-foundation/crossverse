const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants')

const getBuildConfig = () => {
  const path = require('path')
  const postcssPresetEnv = require('postcss-preset-env')
  const postcssPresetEnvOptions = {
    features: {
      'custom-media-queries': true,
      'custom-selectors': true,
    },
  }

  const cssOptions = {
    postcssLoaderOptions: {
      plugins: [postcssPresetEnv(postcssPresetEnvOptions)],
    },
    sassOptions: {
      includePaths: [
        path.join(process.cwd(), 'src', 'common', 'css')
      ],
    },
  }

  const nextConfig = {
    
    ...cssOptions,
    webpack(config) {
      config.module.rules.push({
        test: /\.svg$/,
        include: path.join(process.cwd(), 'src', 'components', 'icon', 'icons'),
        use: [
          'svg-sprite-loader',
          {
            loader: 'svgo-loader',
            options: {
              plugins: [
                { removeAttrs: { attrs: '(fill)' } },
                { removeTitle: true },
                { cleanupIDs: true },
                { removeStyleElement: true },
              ],
            },
          },
        ],
      })
      return config
    },
    eslint: {
      // Warning: Dangerously allow production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true
    },
  }
  return nextConfig
}

module.exports = (phase) => {
  const shouldAddBuildConfig = phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD
  const env = {
    serverRuntimeConfig: {
      PROJECT_ROOT: __dirname
    },
  }
  return {...(shouldAddBuildConfig ? getBuildConfig() : {}), ...env};
}
