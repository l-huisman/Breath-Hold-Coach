// Suppress react-test-renderer deprecation warnings
// This is expected until @testing-library/react-native migrates away from it
// See: https://github.com/callstack/react-native-testing-library/issues/1451

const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress react-test-renderer deprecation warning
    if (
      typeof args[0] === 'string' &&
      args[0].includes('react-test-renderer is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    // Suppress shadow* style deprecation warnings (react-native-web issue)
    if (
      typeof args[0] === 'string' &&
      args[0].includes('"shadow*" style props are deprecated')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
