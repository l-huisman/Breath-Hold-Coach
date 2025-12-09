import type {Config} from 'jest';

const config: Config = {
    verbose: true,
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: {
                jsx: 'react-jsx',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        }],
    },
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '^react-native$': 'react-native-web',
        '^@/(.*)$': '<rootDir>/$1',
    },
};

export default config;