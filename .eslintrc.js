module.exports = {
  "parserOptions": { 
    "ecmaVersion": 6,
      "sourceType": "module",
      "ecmaFeatures": {
        "modules": true
      },
      
  },
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "globals": {
    "THREE": false
    },
  "rules": {
    "semi": [2, "always"],
    "quotes": [2, "single"]
  }
}