module.exports = {
    'extends': 'airbnb-base',
    'plugins': [
        'import'
    ],
    'globals': {
      'document': true,
      'window': true,
      'Image': true,
      'Path2D': true,
      'Audio': true,
      'CustomEvent': true,
      'requestAnimationFrame': true,
      'cancelAnimationFrame': true
    },
    'rules': {
      'comma-dangle': 0,
      'eol-last': 0,
      'no-console': [1, { allow: ["warn", "error"] }]
    }
};