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
        "\\.(css|html|hbs|yml|yaml|txt)$": "<rootDir>/test/__mocks__/static-resources-mock.ts"
    },
    "reporters": ["default", "jest-junit"]
}