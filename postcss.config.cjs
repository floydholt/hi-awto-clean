// client/postcss.config.cjs
module.exports = {
  plugins: {
    // PostCSS will load these in order.
    // Make sure you've installed these packages:
    // npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
    // (If your environment complains about @tailwindcss/postcss, install it as recommended by the error and restart.)
    'postcss-import': {},
    'tailwindcss/postcss': {}, // uses the official postcss plugin entrypoint for Tailwind v3+
    autoprefixer: {},
  },
};