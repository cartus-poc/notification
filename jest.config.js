module.exports = {
    "roots": [
        "<rootDir>/src"
    ],
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    },
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    "moduleNameMapper": {
        "\\.(css|html|hbs)$": "<rootDir>/test/static-resources-mock.js"
    }
}