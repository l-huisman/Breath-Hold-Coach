# CLAUDE.md - React Native/Expo Development Guidelines

## Quick Reference - Shortcut Commands

### Core Workflow Commands
- **QNEW**: Load this CLAUDE.md file in full before starting any task
- **QPLAN**: Verify plan consistency with existing codebase, prefer minimal changes, reuse patterns
- **QCODE**: Implement with automated checks (lint, type check, tests)
- **QCHECK**: Perform skeptical senior developer review of all major changes
- **QCHECKC**: Component-specific quality checklist (see Component Quality Checklist)
- **QCHECKT**: Test-specific quality checklist (see Testing Standards)
- **QUX**: Generate comprehensive QA test scenarios for mobile UX
- **QGIT**: Create conventional commit with auto-stage and push

### Development Commands
- **QRUN**: Start development server with platform selection
- **QTEST**: Run test suite with coverage
- **QLINT**: Run ESLint and fix auto-fixable issues
- **QTYPE**: Run TypeScript type checking
- **QBUILD**: Build app for specific platform (iOS/Android)

---

## React Native/Expo Best Practices

### RN-1: Component Architecture
**Pattern: Functional Components with TypeScript**
```typescript
interface MyComponentProps {
   title: string;
   onPress?: () => void;
   optional?: boolean;
}

export function MyComponent({ title, onPress, optional = false }: MyComponentProps) {
   return (
           <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
           <ThemedText>{title}</ThemedText>
           </Pressable>
);
}
```

**Rules:**
- ✅ Always export function components (not const/arrow functions)
- ✅ Always define TypeScript interface for props
- ✅ Use object destructuring in function parameters
- ✅ Provide default values for optional props in destructuring
- ❌ Never use `React.FC` type (causes issues with children typing)
- ❌ Never use class components

### RN-2: File and Folder Structure
**Expo Router File-Based Routing:**
```
app/
  (tabs)/          # Tab navigator group
    index.tsx      # Home screen
    profile.tsx    # Profile screen
  explain/         # Stack navigator
    index.tsx      # List screen
    [id].tsx       # Detail screen
  _layout.tsx      # Root layout
components/        # Reusable components
  ui/             # Generic UI components
contexts/         # React Context providers
constants/        # App constants (theme, config)
hooks/            # Custom React hooks
```

**Rules:**
- ✅ Use parentheses `(tabs)` for route groups without URL segment
- ✅ Use brackets `[id]` for dynamic routes
- ✅ Keep screens in `app/`, components in `components/`
- ✅ One component per file, named after file
- ❌ Never nest more than 3 levels deep in component folders

### RN-3: Styling with StyleSheet
**Pattern: StyleSheet.create() for Performance**
```typescript
import { StyleSheet, View, Text } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

export function MyComponent() {
   return (
           <View style={styles.container}>
           <Text style={[styles.text, styles.textBold]}>Hello</Text>
   </View>
);
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 20,
      backgroundColor: Colors.light.background,
   },
   text: {
      fontFamily: Fonts.regular,
      fontSize: 16,
      color: Colors.light.text,
   },
   textBold: {
      fontFamily: Fonts.bold,
   },
});
```

**Rules:**
- ✅ Always use `StyleSheet.create()` at file bottom
- ✅ Use theme constants from `@/constants/theme`
- ✅ Use array syntax `[style1, style2]` for combining styles
- ✅ Platform-specific styles via `Platform.select()` when needed
- ❌ Never use inline styles (performance penalty)
- ❌ Never hard-code colors, fonts, or spacing values

### RN-4: State Management with Context
**Pattern: Context API for Global State**
```typescript
// contexts/my-context.tsx
interface MyContextType {
   value: string;
   setValue: (value: string) => void;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

export function MyProvider({ children }: { children: ReactNode }) {
   const [value, setValue] = useState('');

   return (
           <MyContext.Provider value={{ value, setValue }}>
   {children}
   </MyContext.Provider>
);
}

export function useMyContext() {
   const context = useContext(MyContext);
   if (!context) {
      throw new Error('useMyContext must be used within MyProvider');
   }
   return context;
}
```

**Rules:**
- ✅ Create custom hook for each context
- ✅ Throw error if hook used outside provider
- ✅ Type context value explicitly (never `any`)
- ✅ Wrap root layout with providers
- ❌ Never use context for frequently changing values (use useReducer)
- ❌ Never create more than 5 contexts (consider state composition)

### RN-5: Performance Optimization
**Pattern: Memoization and List Optimization**
```typescript
// ✅ Good - Memoized callbacks
const handlePress = useCallback(() => {
   console.log('Pressed');
}, []);

// ✅ Good - FlatList for dynamic lists
<FlatList
        data={items}
renderItem={renderItem}
keyExtractor={(item) => item.id}
removeClippedSubviews={true}
maxToRenderPerBatch={10}
/>

// ❌ Bad - Inline function (recreated every render)
<Pressable onPress={() => console.log('Pressed')}>

// ❌ Bad - ScrollView with .map() for long lists
<ScrollView>
        {items.map(item => <Item key={item.id} />)}
</ScrollView>
```

**Rules:**
- ✅ Use `useCallback` for event handlers passed to children
- ✅ Use `useMemo` for expensive computations
- ✅ Use `FlatList` for lists > 10 items
- ✅ Use `React.memo()` for pure components that render often
- ❌ Never use inline functions in render for callbacks
- ❌ Never use `ScrollView` with `.map()` for dynamic lists

### RN-6: Accessibility (Medical App Priority)
**Pattern: Comprehensive Accessibility**
```typescript
<Pressable
        accessibilityRole="button"
accessibilityLabel="Uitleg DIBH"
accessibilityHint="Tik voor meer informatie over de ademhalingstechniek"
accessibilityState={{ disabled: false }}
hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
>
<ThemedText style={styles.buttonText}>Meer info</ThemedText>
</Pressable>
```

**Rules (Critical for 50-75 Age Group):**
- ✅ Always add `accessibilityRole` to interactive elements
- ✅ Always add `accessibilityLabel` (Dutch, descriptive)
- ✅ Add `accessibilityHint` for non-obvious actions
- ✅ Use `hitSlop` for touch targets < 44x44 points
- ✅ Minimum font size: 16px (14px for metadata)
- ✅ Color contrast ratio ≥ 4.5:1 for text
- ✅ Test with VoiceOver (iOS) and TalkBack (Android)
- ❌ Never rely on color alone to convey information
- ❌ Never use touch targets smaller than 44x44 points

### RN-7: Navigation with Expo Router
**Pattern: Type-Safe Navigation**
```typescript
import { router, useLocalSearchParams } from 'expo-router';

// Navigate to route
router.push('/explain/what-is-dibh');
router.push({ pathname: '/explain/[id]', params: { id: 'what-is-dibh' } });

// Navigate back
router.back();

// Replace current route
router.replace('/home');

// Read dynamic params
function DetailScreen() {
   const { id } = useLocalSearchParams<{ id: string }>();
   // ...
}
```

**Rules:**
- ✅ Use `router.push()` for forward navigation
- ✅ Use `router.back()` instead of custom back buttons when possible
- ✅ Type params with `useLocalSearchParams<Type>()`
- ✅ Use `href` prop on components when possible
- ❌ Never use navigation inside useEffect without cleanup
- ❌ Never navigate during component render

### RN-8: Async Operations and Side Effects
**Pattern: useEffect with Cleanup**
```typescript
useEffect(() => {
   let cancelled = false;

   const loadData = async () => {
      try {
         const data = await fetchData();
         if (!cancelled) {
            setData(data);
         }
      } catch (error) {
         if (!cancelled) {
            console.error('Failed to load data:', error);
         }
      }
   };

   loadData();

   return () => {
      cancelled = true;
   };
}, []);
```

**Rules:**
- ✅ Always handle cleanup in useEffect
- ✅ Use cancellation flags for async operations
- ✅ Always catch errors in async functions
- ✅ Show user-friendly error messages in Dutch
- ❌ Never set state after component unmount
- ❌ Never forget dependency array (causes infinite loops)

### RN-9: Icons and Assets
**Pattern: Platform-Specific Icons**
```typescript
import { Icon } from '@/components/icon';

// ✅ Good - Uses SF Symbols on iOS, Material Icons on Android
<Icon name="heart.fill" size={32} color={Colors.light.primary} />

// Project pattern: Icon component handles platform differences
// iOS: expo-symbols (SF Symbols)
// Android/Web: @expo/vector-icons (Material Icons)
```

**Rules:**
- ✅ Use project's `Icon` component (handles platform differences)
- ✅ Use semantic icon names from SF Symbols
- ✅ Provide fallback for Android via MATERIAL_FALLBACK mapping
- ✅ Use theme colors for icon colors
- ❌ Never use platform-specific icon libraries directly
- ❌ Never hard-code icon sizes (use consistent scale: 16, 20, 24, 32, 48)

### RN-10: Forms and Input Validation
**Pattern: Controlled Inputs with Validation**
```typescript
const [name, setName] = useState('');
const [error, setError] = useState<string | null>(null);

const handleSubmit = useCallback(() => {
   if (!name.trim()) {
      setError('Naam is verplicht');
      return;
   }

   setError(null);
   // Submit logic
}, [name]);

return (
        <>
                <TextInput
                        value={name}
onChangeText={setName}
placeholder="Naam"
autoCapitalize="words"
accessibilityLabel="Naam invoeren"
        />
        {error && (
                <ThemedText style={styles.error}>{error}</ThemedText>
        )}
</>
);
```

**Rules:**
- ✅ Always use controlled inputs (value + onChangeText)
- ✅ Validate on submit, not on every keystroke
- ✅ Show error messages in Dutch
- ✅ Use appropriate `autoCapitalize`, `keyboardType`, `autoComplete`
- ❌ Never use uncontrolled inputs (ref-based)
- ❌ Never validate on every onChange (UX issue)

### RN-11: Testing React Native Components
**Pattern: React Testing Library**
```typescript
import { render, fireEvent } from '@testing-library/react-native';

describe('MyComponent', () => {
   it('should handle press event', () => {
      const handlePress = jest.fn();
      const { getByRole } = render(
              <MyComponent onPress={handlePress} />
   );

      const button = getByRole('button');
      fireEvent.press(button);

      expect(handlePress).toHaveBeenCalledTimes(1);
   });

   it('should display correct accessibility label', () => {
      const { getByLabelText } = render(<MyComponent />);
      expect(getByLabelText('Uitleg DIBH')).toBeTruthy();
   });
});
```

**Rules:**
- ✅ Use `getByRole`, `getByLabelText` for accessibility-first queries
- ✅ Test user interactions, not implementation
- ✅ Mock navigation and context when needed
- ✅ Test accessibility labels
- ❌ Never test internal state directly
- ❌ Never test styling (brittle, low value)

### RN-12: Safe Area and Layout
**Pattern: SafeAreaView for Proper Insets**
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

export function MyScreen() {
   return (
           <SafeAreaView style={styles.safeArea} edges={['top']}>
   <ThemedView style={styles.container}>
           {/* Content */}
           </ThemedView>
           </SafeAreaView>
);
}

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,
   },
   container: {
      flex: 1,
      padding: 20,
   },
});
```

**Rules:**
- ✅ Use `SafeAreaView` from `react-native-safe-area-context`
- ✅ Specify `edges` prop to control which edges are safe
- ✅ Use `useSafeAreaInsets()` for custom safe area handling
- ❌ Never use React Native's built-in SafeAreaView (deprecated)
- ❌ Never ignore safe area on screens with navigation

### RN-13: Animations with Reanimated
**Pattern: Performant Animations**
```typescript
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export function AnimatedComponent() {
   const opacity = useSharedValue(1);

   const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
   }));

   const fadeOut = () => {
      opacity.value = withTiming(0, { duration: 300 });
   };

   return (
           <Animated.View style={[styles.container, animatedStyle]}>
   {/* Content */}
   </Animated.View>
);
}
```

**Rules:**
- ✅ Use `react-native-reanimated` for complex animations
- ✅ Use `useSharedValue` for animated values
- ✅ Use `useAnimatedStyle` for style animations
- ✅ Keep animations under 300ms for medical app (avoid overwhelming users)
- ❌ Never use Animated API for layout animations (use Reanimated)
- ❌ Never animate too many properties simultaneously

### RN-14: Environment and Configuration
**Pattern: Expo Config for Environment**
```typescript
// app.json
{
   "expo": {
   "name": "BreathHoldCoach",
           "ios": {
      "bundleIdentifier": "com.company.breathholdcoach"
   },
   "android": {
      "package": "com.company.breathholdcoach"
   },
   "extra": {
      "apiUrl": process.env.API_URL
   }
}
}

// Access in code
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

**Rules:**
- ✅ Use `app.json` for app configuration
- ✅ Use `expo-constants` to access config
- ✅ Use `.env` files for secrets (not committed)
- ❌ Never hard-code API URLs or secrets
- ❌ Never commit sensitive data to version control

### RN-15: Medical App Specific - Privacy & Security
**Pattern: AVG/GDPR Compliance**
```typescript
// ✅ Good - No patient data logged
const handleLogin = async () => {
   try {
      await loginUser(patientNumber);
      console.log('Login successful'); // No patient data in log
   } catch (error) {
      console.error('Login failed:', error.message); // No stack trace with data
   }
};

// ✅ Good - Local storage only
const saveProgress = async (progress: UserProgress) => {
   await AsyncStorage.setItem('progress', JSON.stringify(progress));
};

// ❌ Bad - Patient data in logs
console.log('Patient data:', { name, dateOfBirth, patientNumber });

// ❌ Bad - Sending sensitive data without encryption
fetch(url, { body: JSON.stringify({ patientData }) });
```

**Rules (Critical for Medical App):**
- ✅ Never log patient personal data (naam, geboortedatum, patiëntnummer)
- ✅ Store data locally only (AsyncStorage) unless explicitly required
- ✅ Request minimum permissions necessary
- ✅ Show privacy policy before data collection
- ✅ Allow users to delete all their data
- ❌ Never send patient data to analytics services
- ❌ Never use third-party libraries that track users
- ❌ Never store sensitive data in plain text

---

## Component Quality Checklist (QCHECKC)

Use this checklist when reviewing components:

### 1. Readability & Structure
- [ ] Component name clearly describes purpose
- [ ] Props interface is well-documented
- [ ] Logic is extracted into custom hooks when complex
- [ ] File is under 300 lines (split if larger)

### 2. TypeScript Type Safety
- [ ] All props have explicit types (no `any`)
- [ ] All event handlers have proper types
- [ ] All state variables have explicit types
- [ ] No TypeScript errors or warnings

### 3. Performance
- [ ] No inline functions in render (use `useCallback`)
- [ ] No inline object/array creation in render (use `useMemo` or move outside)
- [ ] Lists use `FlatList` with proper `keyExtractor`
- [ ] Heavy computations are memoized

### 4. Accessibility (Critical)
- [ ] All interactive elements have `accessibilityRole`
- [ ] All interactive elements have `accessibilityLabel` in Dutch
- [ ] Touch targets are minimum 44x44 points
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Text is minimum 16px (14px for metadata)
- [ ] Component works with VoiceOver/TalkBack

### 5. Styling
- [ ] Uses `StyleSheet.create()` (no inline styles)
- [ ] Uses theme constants (no hard-coded colors/fonts)
- [ ] Responsive to different screen sizes
- [ ] Platform-specific styles are intentional

### 6. State & Side Effects
- [ ] `useEffect` has proper dependency array
- [ ] `useEffect` has cleanup function if needed
- [ ] No setting state after unmount
- [ ] Async operations handle cancellation

### 7. Error Handling
- [ ] All async operations have try/catch
- [ ] User-facing errors are in Dutch
- [ ] Error messages are helpful and actionable
- [ ] Loading states are shown

### 8. Testing
- [ ] Component has test coverage
- [ ] Tests use accessibility queries (`getByRole`, `getByLabelText`)
- [ ] Tests cover user interactions
- [ ] Tests don't rely on implementation details

---

## Testing Standards (QCHECKT)

### Test File Organization
```
__tests__/
  components/
    button.test.tsx
    progress-indicator.test.tsx
  contexts/
    user-context.test.tsx
  screens/
    home.test.tsx
```

### 10 General Testing Rules

1. **Test User Behavior, Not Implementation**
   - ✅ Test what user sees and does
   - ❌ Don't test internal state or methods

2. **Use Accessibility Queries**
   - ✅ `getByRole`, `getByLabelText`, `getByText`
   - ❌ `getByTestId` (last resort only)

3. **Tests Must Fail for Real Bugs**
   - Test should fail if feature is broken
   - Avoid testing trivial things

4. **Descriptive Test Names**
   - ✅ `it('should show error when name is empty')`
   - ❌ `it('test 1')`

5. **Parameterize Similar Tests**
   ```typescript
   it.each([
     ['nl', 'Welkom'],
     ['en', 'Welcome'],
   ])('should display %s greeting', (locale, expected) => {
     // test
   });
   ```

6. **Independent Tests**
   - Each test should run in isolation
   - No shared mutable state between tests

7. **Mock External Dependencies**
   - Mock navigation, API calls, AsyncStorage
   - Don't mock component internals

8. **Test Accessibility**
   - Every interactive component should have accessibility tests
   - Verify labels, roles, states

9. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should update name', () => {
     // Arrange
     const { getByLabelText } = render(<NameForm />);
     
     // Act
     fireEvent.changeText(getByLabelText('Naam'), 'Luke');
     
     // Assert
     expect(getByLabelText('Naam').props.value).toBe('Luke');
   });
   ```

10. **Test Error Paths**
   - Don't just test happy path
   - Test edge cases, errors, empty states

### Example Test Structure
```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';

describe('BreathingExercise', () => {
   describe('when starting exercise', () => {
      it('should show timer', () => {
         const { getByText } = render(<BreathingExercise />);
         const startButton = getByRole('button', { name: /start/i });

         fireEvent.press(startButton);

         expect(getByText(/0:00/)).toBeTruthy();
      });

      it('should increment timer every second', async () => {
         jest.useFakeTimers();
         const { getByText } = render(<BreathingExercise />);

         fireEvent.press(getByRole('button', { name: /start/i }));

         jest.advanceTimersByTime(1000);
         await waitFor(() => expect(getByText(/0:01/)).toBeTruthy());

         jest.useRealTimers();
      });
   });

   describe('accessibility', () => {
      it('should have proper labels', () => {
         const { getByLabelText } = render(<BreathingExercise />);
         expect(getByLabelText('Start oefening')).toBeTruthy();
      });
   });
});
```

---

## Code Examples Throughout

### Good vs Bad Component Structure

❌ **Bad - Inline styles, no accessibility, inline functions**
```typescript
export default function BadComponent({ items }) {
   return (
           <View style={{ flex: 1, padding: 20 }}>
   {items.map((item) => (
           <TouchableOpacity
                   key={item.id}
      onPress={() => console.log(item)}
   >
      <Text style={{ fontSize: 14, color: '#000' }}>{item.name}</Text>
   </TouchableOpacity>
   ))}
   </View>
);
}
```

✅ **Good - StyleSheet, FlatList, accessibility, memoization**
```typescript
interface Item {
   id: string;
   name: string;
}

interface GoodComponentProps {
   items: Item[];
   onItemPress: (item: Item) => void;
}

export function GoodComponent({ items, onItemPress }: GoodComponentProps) {
   const renderItem = useCallback(({ item }: { item: Item }) => (
           <Pressable
                   style={styles.item}
   onPress={() => onItemPress(item)}
   accessibilityRole="button"
   accessibilityLabel={item.name}
           >
           <ThemedText>{item.name}</ThemedText>
           </Pressable>
), [onItemPress]);

   const keyExtractor = useCallback((item: Item) => item.id, []);

   return (
           <View style={styles.container}>
           <FlatList
                   data={items}
   renderItem={renderItem}
   keyExtractor={keyExtractor}
   accessibilityRole="list"
           />
           </View>
);
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 20,
   },
   item: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: Colors.light.cardBackground,
   },
});
```

### Good vs Bad Context Usage

❌ **Bad - No error handling, any types**
```typescript
const MyContext = createContext<any>(null);

export function useMyContext() {
   return useContext(MyContext);
}
```

✅ **Good - Proper typing, error handling**
```typescript
interface MyContextType {
   value: string;
   setValue: (value: string) => void;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

export function MyProvider({ children }: { children: ReactNode }) {
   const [value, setValue] = useState('');

   return (
           <MyContext.Provider value={{ value, setValue }}>
   {children}
   </MyContext.Provider>
);
}

export function useMyContext() {
   const context = useContext(MyContext);
   if (!context) {
      throw new Error('useMyContext must be used within MyProvider');
   }
   return context;
}
```

---

## Anti-Patterns (What NOT to Do)

### 1. Never Modify React Native Core Files
- Don't edit files in `node_modules`
- Use patch-package if absolutely necessary (document why)

### 2. Never Ignore TypeScript Errors
- Fix errors, don't use `@ts-ignore` or `any`
- If type is truly dynamic, use proper union types

### 3. Never Use ScrollView for Long Lists
- Use `FlatList` or `SectionList` instead
- ScrollView renders all children at once (memory issue)

### 4. Never Forget Cleanup in useEffect
- Always return cleanup function
- Cancel async operations on unmount

### 5. Never Store Sensitive Data Without Encryption
- Use `expo-secure-store` for sensitive data
- Never use `AsyncStorage` for passwords or tokens

### 6. Never Use Bare Workflow Without Reason
- Stick with Expo managed workflow
- Only go bare if you need custom native modules

### 7. Never Commit .env Files
- Add to `.gitignore`
- Document required environment variables

### 8. Never Use Magic Numbers
- Define constants for all numbers
- `const TIMER_DURATION = 45;` instead of hardcoded `45`

### 9. Never Ignore Android Testing
- Test on both iOS and Android
- Different behavior, especially for forms and navigation

### 10. Never Skip Accessibility
- Medical app serving 50-75 age group
- Accessibility is not optional

---

## Common Commands Reference

### Development
```bash
# Start development server
npx expo start

# Start with specific platform
npx expo start --ios
npx expo start --android
npx expo start --web

# Clear cache and start
npx expo start --clear
```

### Testing
```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run specific test file
yarn test user-context.test
```

### Code Quality
```bash
# Run linter
yarn lint

# Fix auto-fixable lint issues
yarn lint --fix

# Type check
npx tsc --noEmit
```

### Building
```bash
# Create development build
npx expo prebuild

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

---

## Project-Specific Patterns for BreathHoldCoach

### Current Architecture
- **State Management**: Context API (`contexts/user-context.tsx`)
- **Navigation**: Expo Router file-based
- **Styling**: StyleSheet with centralized theme (`constants/theme.ts`)
- **Icons**: Platform-aware Icon component (SF Symbols/Material Icons)
- **Fonts**: Montserrat family (400/500/600/700)
- **Testing**: Jest + React Testing Library
- **CI/CD**: GitHub Actions (lint, type check, tests on PR)

### Existing Patterns to Follow

#### Themed Components
Always use `ThemedText` and `ThemedView`:
```typescript
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

<ThemedView style={styles.container}>
<ThemedText type="title">Welkom</ThemedText>
        <ThemedText>Reguliere tekst</ThemedText>
</ThemedView>
```

#### Icon Usage
```typescript
import { Icon } from '@/components/icon';

<Icon name="heart.fill" size={32} color={Colors.light.primary} />
```

#### User Context
```typescript
import { useUser } from '@/contexts/user-context';

function MyComponent() {
   const { user, settings, updateSettings } = useUser();

   // Access user.name, settings.breathHoldGoal, etc.
}
```

#### Safe Area Handling
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Content */}
        </SafeAreaView>
```

---

## Codebase Pattern Analysis

This section documents patterns found in the actual BreathHoldCoach codebase. These are **living examples** of how the guidelines above are implemented in practice.

### 1. COMPONENTS PATTERNS (`components/`)

#### ✅ **Consistently Used Patterns**

##### **Component Structure**
All components follow this pattern:
```typescript
// components/button.tsx
export interface ButtonProps {
   children: ReactNode;
   icon?: ReactNode;
   href?: Href;
   onPress?: PressableProps['onPress'];
}

export function Button({ children, icon, style, href, onPress, ...rest }: ButtonProps) {
   // Implementation
}

const styles = StyleSheet.create({
   // Styles at bottom
});
```

**Key Observations:**
- ✅ Export function components (not `const` arrow functions)
- ✅ TypeScript interface for all props (exported for reusability)
- ✅ Props destructuring with defaults in function parameters
- ✅ StyleSheet.create() at the bottom
- ✅ Spread `...rest` for flexibility

##### **Themed Components Pattern**
Core pattern used throughout the app:
```typescript
// components/themed-text.tsx
export type ThemedTextProps = TextProps & {
   lightColor?: string;
   darkColor?: string;
   type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({ style, lightColor, darkColor, type = 'default', ...rest }: ThemedTextProps) {
   const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

   return (
           <Text
                   style={[
                      { color },
              type === 'default' ? styles.default : undefined,
                   type === 'title' ? styles.title : undefined,
                   // ... conditional styles based on type
                   style, // User styles last (override)
]}
   {...rest}
   />
);
}
```

**Pattern Benefits:**
- Extends native component props (TextProps, ViewProps)
- Optional theme overrides (lightColor, darkColor)
- Type variants for common use cases
- User styles applied last for flexibility

##### **Platform-Aware Icon System**
```typescript
// components/icon.tsx
export type IconName = typeof SF_SYMBOLS[number]; // Type-safe icon names

export function Icon({ name, size = 32, color = Colors.light.primary, style, weight = 'regular' }: IconProps) {
   if (Platform.OS === 'ios') {
      return <SymbolView name={name} size={size} tintColor={color} weight={weight} />;
   }

   // Fallback for Android/Web
   const materialName = MATERIAL_FALLBACK[name];
   return <MaterialIcons name={materialName} size={size} color={color} />;
}
```

**Key Features:**
- Type-safe icon names from const array
- Platform detection (iOS vs Android/Web)
- Fallback mapping (SF Symbols → Material Icons)
- Default values from theme constants

##### **Flexible Component Props**
```typescript
// components/button.tsx - Supports both navigation and callbacks
export type ButtonProps = Omit<PressableProps, 'onPress'> & {
   children: ReactNode;
   icon?: ReactNode;
   href?: Href;                    // For navigation
   onPress?: PressableProps['onPress']; // For callbacks
};

const handlePress = (event: any) => {
   if (href) {
      router.push(href);
   } else if (onPress) {
      onPress(event);
   }
};

// components/progress-indicator.tsx - Icon accepts multiple types
interface ProgressIndicatorProps {
   icon?: ImageSourcePropType | React.ReactNode; // Image OR component
}

const isImageSource = icon && typeof icon === 'object' && !React.isValidElement(icon);
```

**Pattern Benefits:**
- Single component, multiple use cases
- Type-safe via TypeScript
- Runtime type checking when needed

##### **Accessibility-First Design**
```typescript
// components/explanation-card.tsx
<Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
onPress={onPress}
accessibilityRole="button"
accessibilityLabel={`${title}. ${description}`}
accessibilityHint="Tik voor meer informatie"
        >
```

**Always Included:**
- `accessibilityRole` on all interactive elements
- `accessibilityLabel` in Dutch with context
- `accessibilityHint` for non-obvious actions
- Pressed states for visual feedback

##### **Memoization for Performance**
```typescript
// app/explain/index.tsx - FlatList optimization
const renderItem = useCallback(({ item }: { item: ExplanationTopic }) => (
        <ExplanationCard
                title={item.title}
description={item.description}
iconName={item.iconName}
onPress={() => router.push(`/explain/${item.id}`)}
/>
), []);

const keyExtractor = useCallback((item: ExplanationTopic) => item.id, []);
const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);
```

**Why This Matters:**
- Prevents re-creation of functions on every render
- Critical for FlatList performance
- Empty dependency arrays for static functions

#### 🎯 **Patterns to Preserve**

1. **Gap-based spacing** instead of margins
   ```typescript
   // app/(tabs)/index.tsx
   const styles = StyleSheet.create({
     container: {
       flex: 1,
       padding: 20,
       gap: 20, // Consistent spacing between children
     },
     section: {
       gap: 16,
     },
     buttonSection: {
       gap: 24,
     },
   });
   ```

2. **Spacer pattern** for flex layouts
   ```typescript
   <View style={styles.spacer} /> // Pushes content to bottom

   const styles = StyleSheet.create({
     spacer: {
       flex: 1, // Takes all available space
     },
   });
   ```

3. **Semantic color naming**
   ```typescript
   // constants/theme.ts
   export const Colors = {
     light: {
       text: '#1E1E1E',
       textMuted: '#404040',
       textContrast: '#F2EEEB',
       background: '#FFFFFF',
       primary: '#284EA6',
       primaryMuted: '#93A6D3',
       accent: '#FF4B3E',
       iconBackground: '#E8EDF5',
       progressBackground: '#E5E5E5',
       cardPressedBackground: '#F5F7FA',
     },
   };
   ```

4. **Font system** matching loaded fonts exactly
   ```typescript
   // constants/theme.ts
   export const Fonts = {
     regular: 'Montserrat_400Regular',   // Exact font name
     medium: 'Montserrat_500Medium',     // From @expo-google-fonts/montserrat
     semiBold: 'Montserrat_600SemiBold',
     bold: 'Montserrat_700Bold',
   };
   ```

5. **Pressed state styling**
   ```typescript
   <Pressable
     style={({ pressed }) => [
       styles.button,
       pressed && styles.buttonPressed, // Visual feedback
       style,
     ]}
   />

   const styles = StyleSheet.create({
     buttonPressed: {
       opacity: 0.8, // Or backgroundColor change
     },
   });
   ```

#### ❌ **Anti-Patterns to Avoid**

Based on codebase analysis, **never** do these:

1. **Inline styles**
   ```typescript
   // ❌ NEVER DO THIS
   <View style={{ padding: 20, backgroundColor: '#FFF' }} />

   // ✅ ALWAYS DO THIS
   const styles = StyleSheet.create({
     container: { padding: 20, backgroundColor: Colors.light.background }
   });
   ```

2. **Hard-coded colors/fonts**
   ```typescript
   // ❌ NEVER
   color: '#284EA6'
   fontFamily: 'Montserrat-Bold'

   // ✅ ALWAYS
   color: Colors.light.primary
   fontFamily: Fonts.bold
   ```

3. **Missing accessibility props**
   ```typescript
   // ❌ INCOMPLETE
   <Pressable onPress={handlePress}>

   // ✅ COMPLETE
   <Pressable
     onPress={handlePress}
     accessibilityRole="button"
     accessibilityLabel="Start oefening"
     accessibilityHint="Tik om de ademhalingsoefening te starten"
   />
   ```

4. **Inline functions in FlatList**
   ```typescript
   // ❌ PERFORMANCE ISSUE
   <FlatList renderItem={(item) => <Item {...item} />} />

   // ✅ OPTIMIZED
   const renderItem = useCallback(({ item }) => <Item {...item} />, []);
   <FlatList renderItem={renderItem} />
   ```

---

### 2. APP ROUTING PATTERNS (`app/`)

#### ✅ **Consistently Used Patterns**

##### **Root Layout Structure**
```typescript
// app/_layout.tsx
export default function RootLayout() {
   const [fontsLoaded] = useFonts({
      Montserrat_400Regular,
      Montserrat_500Medium,
      Montserrat_600SemiBold,
      Montserrat_700Bold,
   });

   useEffect(() => {
      if (fontsLoaded) {
         SplashScreen.hideAsync();
      }
   }, [fontsLoaded]);

   if (!fontsLoaded) {
      return null;
   }

   return (
           <UserProvider>
                   <ThemeProvider value={CustomTheme}>
           <Stack screenOptions={{ animation: 'none' }}>
   <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
   <Stack.Screen name="explain" options={{ headerShown: false }} />
   </Stack>
   <StatusBar style="dark" />
           </ThemeProvider>
           </UserProvider>
);
}
```

**Key Patterns:**
- Font loading with splash screen management
- Provider wrapping order: UserProvider → ThemeProvider → Stack
- Custom theme matching design system
- Animation disabled by default (`animation: 'none'`)
- `headerShown: false` (using custom navbar)

##### **Route Organization**
```
app/
  (tabs)/              # Route group (no URL segment)
    _layout.tsx        # Tab navigator
    index.tsx          # / (home)
    profile.tsx        # /profile
    agenda.tsx         # /agenda
    messages.tsx       # /messages
    relax.tsx          # /relax
  explain/             # Stack navigator
    _layout.tsx        # Stack layout
    index.tsx          # /explain (list)
    [id].tsx           # /explain/:id (detail)
  _layout.tsx          # Root layout
  modal.tsx            # /modal (modal presentation)
```

**Routing Rules:**
- `(tabs)` = route group without URL segment
- `[id]` = dynamic route parameter
- `_layout.tsx` = nested navigator
- File name = route path

##### **Tab Navigator Pattern**
```typescript
// app/(tabs)/_layout.tsx
export default function TabLayout() {
   return (
           <Tabs
                   tabBar={(props) => <CustomBottomTabBar {...props} />}
   screenOptions={{
      headerShown: false,
              tabBarButton: HapticTab, // Haptic feedback on press
   }}
>
   <Tabs.Screen
           name="index"
   options={{
      title: 'Home',
              tabBarIcon: ({ color }) => <IconSymbol size={32} name="house.fill" color={color} />,
   }}
   />
   {/* More tabs... */}
   </Tabs>
);
}
```

**Key Features:**
- Custom tab bar component
- Haptic feedback wrapper
- Platform-aware icons
- Dutch titles
- Color prop passed to icons

##### **Screen Structure Pattern**
```typescript
// app/(tabs)/index.tsx
export default function HomeScreen() {
   const { user, settings, progress } = useUser(); // Global state

   return (
           <SafeAreaView style={styles.safeArea} edges={['top']}>
   <ThemedView style={styles.container}>
   <ThemedText type="title">Hallo, {user.name} 👋</ThemedText>

   <ThemedView style={styles.section}>
   <ProgressIndicator
           seconds={progress.currentBreathHold}
   maxSeconds={settings.breathHoldGoal}
   icon={<Icon name="target" />}
   />
   </ThemedView>

   <View style={styles.spacer} />

   <ThemedView style={styles.buttonSection}>
   <Separator />
   <Button href="/explain" icon={<Icon name="graduationcap.fill" color="#F2EEEB" />}>
   Uitleg DIBH
   </Button>
   </ThemedView>
   </ThemedView>
   </SafeAreaView>
);
}
```

**Screen Patterns:**
- SafeAreaView with edges prop
- ThemedView for main container
- useUser() for global state
- Gap-based spacing
- Spacer for flex layouts
- href prop for navigation

##### **Navigation Pattern**
```typescript
// Navigation via router
import { router } from 'expo-router';

// Simple navigation
router.push('/explain');

// Dynamic routes
router.push(`/explain/${item.id}`);

// With Button component
<Button href="/explain">Go to Explain</Button>

// Reading params
const { id } = useLocalSearchParams<{ id: string }>();
```

#### 🎯 **Patterns to Preserve**

1. **Custom theme integration**
   ```typescript
   const CustomTheme = {
     ...DefaultTheme,
     colors: {
       ...DefaultTheme.colors,
       primary: Colors.light.primary,
       background: Colors.light.background,
       text: Colors.light.text,
       border: Colors.light.primaryMuted,
       notification: Colors.light.accent,
     },
   };
   ```

2. **Provider order** (critical!)
   ```typescript
   <UserProvider>          // 1. Global state
     <ThemeProvider>        // 2. Navigation theme
       <Stack>              // 3. Navigator
   ```

3. **Splash screen management**
   ```typescript
   SplashScreen.preventAutoHideAsync(); // Before component

   useEffect(() => {
     if (fontsLoaded) {
       SplashScreen.hideAsync(); // Hide when ready
     }
   }, [fontsLoaded]);
   ```

4. **File-based routing** (don't use manual navigation config)

#### ❌ **Anti-Patterns to Avoid**

1. **Manual screen registration** - Use file-based routing
2. **Hardcoded screen names** - Use href strings matching file paths
3. **Forgetting `headerShown: false`** - Causes double headers
4. **Wrong provider order** - Context must wrap ThemeProvider

---

### 3. STATE MANAGEMENT PATTERNS (`contexts/user-context.tsx`)

#### ✅ **Consistently Used Patterns**

##### **Complete Context Pattern**
```typescript
// 1. Define all interfaces
export interface UserDetails {
   name: string;
   dateOfBirth: Date | null;
   patientNumber: string;
   assistiveLearning: boolean | null;
}

export interface UserSettings {
   breathHoldGoal: number;
   dailyGoal: number;
   dailyReminder: boolean;
   dailyReminderTime: string | null;
}

// 2. Define context type with methods
export interface UserContextType {
   user: UserDetails;
   settings: UserSettings;
   progress: UserProgress;
   preferences: UserPreferences;
   updateUser: (user: Partial<UserDetails>) => void;
   updateSettings: (settings: Partial<UserSettings>) => void;
   updateProgress: (progress: Partial<UserProgress>) => void;
   updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

// 3. Create context with undefined
const UserContext = createContext<UserContextType | undefined>(undefined);

// 4. Provider with state and update functions
export function UserProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<UserDetails>(defaultUser);
   const [settings, setSettings] = useState<UserSettings>(defaultSettings);
   const [progress, setProgress] = useState<UserProgress>(defaultProgress);
   const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

   const updateUser = (updates: Partial<UserDetails>) => {
      setUser(prev => ({ ...prev, ...updates }));
   };

   // ... more update functions

   return (
           <UserContext.Provider value={{
      user,
              settings,
              progress,
              preferences,
              updateUser,
              updateSettings,
              updateProgress,
              updatePreferences,
   }}>
   {children}
   </UserContext.Provider>
);
}

// 5. Custom hook with error handling
export function useUser() {
   const context = useContext(UserContext);
   if (!context) {
      throw new Error('useUser must be used within UserProvider');
   }
   return context;
}
```

##### **State Organization**
Separate concerns into logical groups:
- `UserDetails` - Personal information
- `UserSettings` - Configuration preferences
- `UserProgress` - Performance tracking
- `UserPreferences` - UI/notification preferences

##### **Partial Update Pattern**
```typescript
const updateUser = (updates: Partial<UserDetails>) => {
   setUser(prev => ({ ...prev, ...updates }));
};

// Usage - update single field
updateUser({ name: 'Tineke' });

// Update multiple fields
updateUser({
   name: 'Tineke',
   assistiveLearning: true
});
```

##### **Default Values Pattern**
```typescript
// Export defaults for reuse
export const defaultPracticeMomentsNormalLearning: PracticeMoment[] = [
   { id: '1', time: '09:00', enabled: true },
   { id: '2', time: '18:00', enabled: true },
];

export const defaultPracticeMomentsAssistiveLearning: PracticeMoment[] = [
   { id: '1', time: '08:00', enabled: true },
   { id: '2', time: '11:00', enabled: true },
   { id: '3', time: '14:00', enabled: true },
   { id: '4', time: '17:00', enabled: true },
   { id: '5', time: '20:00', enabled: true },
];

const defaultSettings: UserSettings = {
   breathHoldGoal: 45,
   dailyGoal: 5, // Different for smokers vs non-smokers
   dailyReminder: false,
   dailyReminderTime: null,
};
```

**Benefits:**
- Testable (can import defaults)
- Reusable across app
- Domain-specific logic (assistive learning)

#### 🎯 **Patterns to Preserve**

1. **Interface exports** - Makes types reusable
2. **Partial updates** - Flexible, prevents bugs
3. **Error throwing in hooks** - Catches misuse early
4. **Separation of concerns** - Multiple state objects, not one giant object
5. **Medical context awareness** - `assistiveLearning` flag affects defaults

#### ❌ **Anti-Patterns to Avoid**

1. **Context without custom hook**
   ```typescript
   // ❌ NO
   const user = useContext(UserContext);

   // ✅ YES
   const { user } = useUser();
   ```

2. **Missing undefined check**
   ```typescript
   // ❌ UNSAFE
   export function useUser() {
     return useContext(UserContext);
   }

   // ✅ SAFE
   export function useUser() {
     const context = useContext(UserContext);
     if (!context) {
       throw new Error('useUser must be used within UserProvider');
     }
     return context;
   }
   ```

3. **Direct state mutation**
   ```typescript
   // ❌ NEVER
   user.name = 'New Name';

   // ✅ ALWAYS
   updateUser({ name: 'New Name' });
   ```

4. **Using `any` types**
   ```typescript
   // ❌ NO
   const [user, setUser] = useState<any>(defaultUser);

   // ✅ YES
   const [user, setUser] = useState<UserDetails>(defaultUser);
   ```

---

### 4. STYLING PATTERNS (`constants/theme.ts`)

#### ✅ **Theme Structure**

```typescript
export const Colors = {
   light: {
      // Text colors
      text: '#1E1E1E',
      textMuted: '#404040',
      textContrast: '#F2EEEB',

      // Brand colors
      background: '#FFFFFF',
      primary: '#284EA6',
      primaryMuted: '#93A6D3',
      tertiary: '#284EA6',
      accent: '#FF4B3E',

      // UI element backgrounds
      iconBackground: '#E8EDF5',
      progressBackground: '#E5E5E5',
      cardPressedBackground: '#F5F7FA',

      // Legacy compatibility
      tint: '#284EA6',
      icon: '#93A6D3',
      tabIconDefault: '#93A6D3',
      tabIconSelected: '#284EA6',
   },
   dark: {
      // Dark theme not yet designed (duplicates light for now)
   },
};

export const Fonts = {
   regular: 'Montserrat_400Regular',
   medium: 'Montserrat_500Medium',
   semiBold: 'Montserrat_600SemiBold',
   bold: 'Montserrat_700Bold',
};
```

#### 🎯 **Patterns to Preserve**

1. **Semantic naming** - `primary`, `accent`, not `blue`, `red`
2. **Grouped by purpose** - text colors, brand colors, UI backgrounds
3. **Theme structure** - Matches `useColorScheme` (light/dark)
4. **Legacy compatibility** - Backward-compatible color names
5. **Exact font names** - Match fonts loaded in app/_layout.tsx

#### ❌ **Anti-Patterns to Avoid**

1. **Non-semantic names** - `color1`, `blue500`, `darkGray`
2. **Hex values in components** - Always reference `Colors` object
3. **Font weight numbers** - Use named `Fonts` exports, not `fontWeight: '600'`

---

## SUMMARY - Codebase Pattern Analysis

### **10 Golden Rules from Real Code**

1. ✅ **Export function components** - `export function MyComponent`
2. ✅ **TypeScript interfaces for props** - Exported, explicit types
3. ✅ **StyleSheet.create() at bottom** - Never inline styles
4. ✅ **Theme constants only** - `Colors.light.primary`, `Fonts.bold`
5. ✅ **Accessibility mandatory** - role, label, hint in Dutch
6. ✅ **useCallback for FlatList** - Memoize renderItem, keyExtractor
7. ✅ **Context + custom hook** - Error handling in hook
8. ✅ **File-based routing** - Match file paths to hrefs
9. ✅ **SafeAreaView with edges** - `edges={['top']}`
10. ✅ **Gap-based spacing** - Prefer `gap` over margins

### **Medical App Patterns (50-75 Age Group)**

From actual implementation:
- ✅ Minimum 16px font (14px for metadata only)
- ✅ 44x44 point touch targets (48px buttons)
- ✅ High contrast colors (4.5:1 ratio)
- ✅ Dutch language throughout
- ✅ Haptic feedback (HapticTab)
- ✅ Clear accessibility labels
- ✅ Assistive learning mode (more frequent practice)
- ✅ No patient data in logs

### **Where to Find Examples**

| Pattern | File Location |
|---------|---------------|
| Component Structure | `components/button.tsx`, `components/explanation-card.tsx` |
| Themed Components | `components/themed-text.tsx`, `components/themed-view.tsx` |
| Platform Icons | `components/icon.tsx` |
| FlatList Optimization | `app/explain/index.tsx` |
| Context Pattern | `contexts/user-context.tsx` |
| Root Layout | `app/_layout.tsx` |
| Tab Navigator | `app/(tabs)/_layout.tsx` |
| Screen Structure | `app/(tabs)/index.tsx` |
| Theme System | `constants/theme.ts` |

---

## Medical App Considerations

### 1. User Age Group (50-75 years)
- **Larger touch targets**: Minimum 44x44 points
- **Readable fonts**: Minimum 16px, high contrast
- **Simple navigation**: Max 3 taps to any feature
- **Clear feedback**: Immediate visual/haptic response

### 2. Dutch Language
- All UI text in Dutch
- Error messages in Dutch
- Accessibility labels in Dutch
- Date/time formatting in European format

### 3. AVG/GDPR Compliance
- No analytics without consent
- Data stored locally only (AsyncStorage)
- Clear privacy policy
- User can delete all data
- No patient data in logs

### 4. Limited Technical Skills
- No complex gestures (swipe, pinch)
- Clear button labels (not just icons)
- Confirmation for destructive actions
- Help text always visible

### 5. Medical Context
- No gamification that trivializes condition
- Reassuring, calm design (not playful)
- Progress tracking for motivation
- Clear explanation of DIBH importance

---

## Workflow Integration with GitHub Projects

### Sprint Planning
- Create issues in GitHub Projects before starting
- Link commits to issues: `feat: add timer component (#123)`
- Use labels: `feature`, `bug`, `accessibility`, `testing`

### Development Flow
1. Create feature branch from `development`
2. Use QPLAN before coding
3. Implement with QCODE
4. Review with QCHECK and QCHECKC
5. Test with QCHECKT
6. Create PR to `development`
7. GitHub Actions run automatically
8. After PR approval, merge to `development`
9. Weekly merge `development` → `master` for releases

### Conventional Commits
Use QGIT for automatic formatting:
- `feat: add breathing exercise timer`
- `fix: correct safe area insets on iPhone X`
- `docs: update CLAUDE.md with animation patterns`
- `test: add tests for user context`
- `refactor: extract timer logic to custom hook`
- `style: update button padding for accessibility`
- `chore: update dependencies`

---

## Quick Debugging Checklist

### Component Not Rendering?
- [ ] Check import paths (use `@/` alias)
- [ ] Check export (named vs default)
- [ ] Check parent container has `flex: 1`
- [ ] Check if hidden by other elements (z-index)

### Style Not Applying?
- [ ] Check StyleSheet.create() at bottom of file
- [ ] Check style is actually applied to component
- [ ] Check parent isn't overriding with flex properties
- [ ] Check theme constants are imported

### Navigation Not Working?
- [ ] Check file is in correct `app/` directory
- [ ] Check route name matches file name
- [ ] Check `_layout.tsx` isn't blocking route
- [ ] Check `router.push()` path is correct

### Test Failing?
- [ ] Check test environment is set to 'jsdom'
- [ ] Check all async operations use `waitFor`
- [ ] Check mocks are properly set up
- [ ] Check accessibility queries match actual labels

### Performance Issues?
- [ ] Use Flipper to profile
- [ ] Check for unnecessary re-renders
- [ ] Check FlatList configuration
- [ ] Check image sizes and caching

---

## Final Notes

This CLAUDE.md is your source of truth for React Native/Expo development patterns in the BreathHoldCoach project. Always run QNEW at the start of each session to load these guidelines.

For medical app development:
- **Accessibility is not optional** - test with VoiceOver/TalkBack
- **Privacy is paramount** - never log patient data
- **Simplicity wins** - users are 50-75, not tech-savvy
- **Dutch language** - all user-facing text
- **Trust and reassurance** - calm, professional design

When in doubt, prioritize:
1. User safety and privacy
2. Accessibility
3. Simplicity
4. Performance
5. Code quality