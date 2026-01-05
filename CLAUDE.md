# CLAUDE.md - React Native/Expo Development Guidelines

## Quick Reference - Shortcut Commands

### QNEW - Session Initialization
**When:** Start of every new session or task
**Actions:**
1. Read this entire CLAUDE.md file
2. Scan project structure: `app/`, `components/`, `contexts/`, `constants/`
3. Check `package.json` for dependencies and scripts
4. Review any recent changes in git: `git log --oneline -10`
5. Confirm understanding of current project state

### QPLAN - Planning Phase
**When:** Before writing any code
**Actions:**
1. Restate the task in your own words to confirm understanding
2. Identify which existing files will be modified vs. new files created
3. Check for existing patterns in codebase that should be reused:
    - Similar components in `components/`
    - Existing context patterns in `contexts/`
    - Theme constants in `constants/theme.ts`
4. List potential impacts on other parts of the app
5. Propose minimal changes - prefer extending over rewriting
6. Identify accessibility requirements (Dutch labels, touch targets, contrast)
7. Flag any privacy/GDPR concerns for medical data
8. Present plan and wait for approval before proceeding

**Output format:**
```
## Plan: [Task Name]
### Files to modify: [list]
### New files: [list]
### Patterns to reuse: [list with file references]
### Accessibility: [requirements]
### Privacy concerns: [if any]
### Estimated scope: [small/medium/large]
```

### QCODE - Implementation Phase
**When:** After QPLAN is approved
**Actions:**
1. Implement changes following patterns from this CLAUDE.md
2. After each file change, run these checks:
    - `npx tsc --noEmit` (type check)
    - `yarn lint` (linting)
3. For new components, ensure:
    - TypeScript interface for props (exported)
    - `export function` (not const/arrow)
    - `StyleSheet.create()` at bottom
    - All accessibility props (role, label, hint in Dutch)
    - Theme constants used (no hardcoded colors/fonts)
4. For context changes, ensure:
    - Custom hook with error handling
    - Proper TypeScript types
    - Partial update pattern
5. Write tests alongside implementation (not after)
6. Run `yarn test` to verify tests pass

**Quality gates (must pass before completion):**
- [ ] `npx tsc --noEmit` - no errors
- [ ] `yarn lint` - no errors
- [ ] `yarn test` - all tests pass

### QCHECK - Senior Developer Review
**When:** After QCODE, before committing
**Mindset:** Be a skeptical senior developer looking for issues
**Actions:**
1. **Re-read the original requirements** - does implementation match?
2. **Review each changed file** asking:
    - Is this the simplest solution?
    - Are there edge cases not handled?
    - Will this break anything else?
    - Is error handling complete?
3. **Check for common issues:**
    - Memory leaks (missing useEffect cleanup)
    - Performance issues (inline functions, missing memoization)
    - Missing loading/error states
    - Hardcoded values that should be constants
4. **Accessibility audit:**
    - All interactive elements have accessibilityRole
    - Labels are in Dutch and descriptive
    - Touch targets ≥ 44x44 points
    - Color contrast ≥ 4.5:1
5. **Privacy check (medical app):**
    - No patient data in console.log
    - No sensitive data sent to external services
6. **List all concerns** - even minor ones
7. **Fix issues** or explain why they're acceptable

**Output format:**
```
## QCHECK Review
### ✅ Passed
- [list what's good]
### ⚠️ Concerns
- [list issues and fixes applied]
### 🔍 Edge cases considered
- [list edge cases and how they're handled]
```

### QCHECKC - Component Quality Checklist
**When:** After creating or modifying any component
**Actions:** Go through each item in the Component Quality Checklist section:
1. Readability & Structure (4 items)
2. TypeScript Type Safety (4 items)
3. Performance (4 items)
4. Accessibility - CRITICAL (6 items)
5. Styling (4 items)
6. State & Side Effects (4 items)
7. Error Handling (4 items)
8. Testing (4 items)

**Output:** Checklist with [x] for passed, [ ] for failed, and notes on any failures

### QCHECKT - Test Quality Checklist
**When:** After writing or modifying tests
**Actions:**
1. Verify test file is in correct location (`__tests__/`)
2. Check each test against the 10 Testing Rules
3. Ensure accessibility queries are used (`getByRole`, `getByLabelText`)
4. Verify Arrange-Act-Assert pattern
5. Check that error paths are tested, not just happy path
6. Run tests: `yarn test [filename]`
7. Check coverage: `yarn test:coverage`

**Output:** List of tests reviewed with pass/fail status

### QUX - UX Test Scenario Generation
**When:** Before release or after major UI changes
**Actions:**
1. Identify all user flows in the feature
2. For each flow, generate test scenarios covering:
    - Happy path
    - Error states (network, validation, etc.)
    - Edge cases (empty states, max limits, etc.)
    - Accessibility (VoiceOver/TalkBack navigation)
    - Age-appropriate UX (50-75 age group):
        - Large touch targets work correctly
        - Text is readable
        - No complex gestures required
        - Feedback is clear and immediate
3. Include device variations (iPhone SE vs Pro Max, Android variants)
4. Document expected behavior for each scenario

**Output format:**
```
## QUX Test Scenarios: [Feature Name]
### Flow: [Flow Name]
| Scenario | Steps | Expected Result | Age-Appropriate |
|----------|-------|-----------------|-----------------|
| ... | ... | ... | ✅/❌ |
```

### QGIT - Git Commit
**When:** After QCHECK passes
**Actions:**
1. Stage changes: `git add -A`
2. Review staged changes: `git diff --staged`
3. Create conventional commit message:
    - Format: `type: description`
    - Types: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`
    - Description: lowercase, imperative mood, max 72 chars
    - Reference issue if applicable: `feat: add timer component (#123)`
4. Commit: `git commit -m "message"`
5. Push: `git push`

**Examples:**
- `feat: add breathing exercise timer`
- `fix: correct safe area insets on iPhone X`
- `docs: update CLAUDE.md with animation patterns`
- `test: add tests for user context`
- `refactor: extract timer logic to custom hook`
- `style: update button padding for accessibility`
- `chore: update expo sdk to v50`

### Development Commands

**QRUN** - Start Development Server
```bash
npx expo start           # Default (shows QR code)
npx expo start --ios     # iOS simulator
npx expo start --android # Android emulator
npx expo start --clear   # Clear cache first
```

**QTEST** - Run Tests
```bash
yarn test                    # All tests
yarn test:watch              # Watch mode
yarn test:coverage           # With coverage report
yarn test [filename]         # Specific file
yarn test --testNamePattern="timer"  # Pattern match
```

**QLINT** - Linting
```bash
yarn lint          # Check for issues
yarn lint --fix    # Auto-fix what's possible
```

**QTYPE** - Type Checking
```bash
npx tsc --noEmit   # Check types without compiling
```

**QBUILD** - Build for Release
```bash
eas build --platform ios --profile preview     # iOS preview
eas build --platform android --profile preview # Android preview
eas build --platform all --profile production  # Production both
```

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
- ✅ Always define TypeScript interface for props (export for reusability)
- ✅ Use object destructuring in function parameters
- ✅ Provide default values for optional props in destructuring
- ✅ Use spread `...rest` for flexibility when extending native components
- ❌ Never use `React.FC` type (causes issues with children typing)
- ❌ Never use class components

### RN-2: File and Folder Structure
**Expo Router File-Based Routing:**
```
app/
  (tabs)/          # Tab navigator group (no URL segment)
    _layout.tsx    # Tab navigator config
    index.tsx      # / (home)
    profile.tsx    # /profile
  explain/         # Stack navigator
    _layout.tsx    # Stack layout
    index.tsx      # /explain (list)
    [id].tsx       # /explain/:id (detail)
  _layout.tsx      # Root layout
  modal.tsx        # /modal
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
- ✅ File name = route path (use file-based routing, not manual config)
- ❌ Never nest more than 3 levels deep in component folders
- ❌ Never hardcode screen names - use href strings matching file paths

### RN-3: Styling with StyleSheet
**Pattern: StyleSheet.create() with Theme Constants**
```typescript
import { StyleSheet, View, Pressable } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

export function MyComponent() {
   return (
           <View style={styles.container}>
           <Pressable
                   style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
   accessibilityRole="button"
           >
           <Text style={[styles.text, styles.textBold]}>Hello</Text>
           </Pressable>
           </View>
);
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 20,
      gap: 20, // Prefer gap over margins for spacing
      backgroundColor: Colors.light.background,
   },
   button: {
      padding: 12,
      borderRadius: 8,
   },
   buttonPressed: {
      opacity: 0.8, // Visual feedback on press
   },
   text: {
      fontFamily: Fonts.regular,
      fontSize: 16,
      color: Colors.light.text,
   },
   textBold: {
      fontFamily: Fonts.bold,
   },
   spacer: {
      flex: 1, // Takes all available space - use to push content
   },
});
```

**Rules:**
- ✅ Always use `StyleSheet.create()` at file bottom
- ✅ Use theme constants from `@/constants/theme`
- ✅ Use array syntax `[style1, style2]` for combining styles
- ✅ Use `gap` for consistent spacing between children
- ✅ Use spacer pattern (`flex: 1`) to push content in flex layouts
- ✅ Use pressed state styling for visual feedback
- ✅ Platform-specific styles via `Platform.select()` when needed
- ❌ Never use inline styles (performance penalty)
- ❌ Never hard-code colors, fonts, or spacing values

### RN-4: State Management with Context
**Pattern: Context API with Custom Hook**
```typescript
// contexts/user-context.tsx
export interface UserDetails {
   name: string;
   dateOfBirth: Date | null;
   patientNumber: string;
}

export interface UserSettings {
   breathHoldGoal: number;
   dailyGoal: number;
}

export interface UserContextType {
   user: UserDetails;
   settings: UserSettings;
   updateUser: (user: Partial<UserDetails>) => void;
   updateSettings: (settings: Partial<UserSettings>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<UserDetails>(defaultUser);
   const [settings, setSettings] = useState<UserSettings>(defaultSettings);

   // Partial update pattern - flexible, prevents bugs
   const updateUser = (updates: Partial<UserDetails>) => {
      setUser(prev => ({ ...prev, ...updates }));
   };

   const updateSettings = (updates: Partial<UserSettings>) => {
      setSettings(prev => ({ ...prev, ...updates }));
   };

   return (
           <UserContext.Provider value={{ user, settings, updateUser, updateSettings }}>
   {children}
   </UserContext.Provider>
);
}

export function useUser() {
   const context = useContext(UserContext);
   if (!context) {
      throw new Error('useUser must be used within UserProvider');
   }
   return context;
}
```

**Rules:**
- ✅ Create custom hook for each context
- ✅ Throw error if hook used outside provider
- ✅ Type context value explicitly (never `any`)
- ✅ Export interfaces for reusability
- ✅ Use partial updates pattern for flexibility
- ✅ Separate concerns into logical groups (UserDetails, UserSettings, etc.)
- ✅ Wrap root layout with providers in correct order: UserProvider → ThemeProvider → Stack
- ❌ Never use context for frequently changing values (use useReducer)
- ❌ Never create more than 5 contexts (consider state composition)
- ❌ Never mutate state directly (`user.name = 'x'`)

### RN-5: Performance Optimization
**Pattern: Memoization and List Optimization**
```typescript
// Memoized callbacks - critical for FlatList
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
const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

// FlatList with optimization props
<FlatList
        data={items}
renderItem={renderItem}
keyExtractor={keyExtractor}
ItemSeparatorComponent={ItemSeparator}
removeClippedSubviews={true}
maxToRenderPerBatch={10}
accessibilityRole="list"
/>
```

**Rules:**
- ✅ Use `useCallback` for event handlers passed to children
- ✅ Use `useMemo` for expensive computations
- ✅ Use `FlatList` for lists > 10 items
- ✅ Use `React.memo()` for pure components that render often
- ✅ Empty dependency arrays for static functions
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
- ✅ Always add `accessibilityLabel` (Dutch, descriptive, include context)
- ✅ Add `accessibilityHint` for non-obvious actions
- ✅ Use `hitSlop` for touch targets < 44x44 points
- ✅ Minimum font size: 16px (14px for metadata only)
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
}

// Button with href (preferred for navigation)
<Button href="/explain" icon={<Icon name="graduationcap.fill" />}>
Uitleg DIBH
</Button>
```

**Rules:**
- ✅ Use `router.push()` for forward navigation
- ✅ Use `router.back()` instead of custom back buttons when possible
- ✅ Type params with `useLocalSearchParams<Type>()`
- ✅ Use `href` prop on components when possible
- ✅ Use `headerShown: false` when using custom navbar
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

// Uses SF Symbols on iOS, Material Icons on Android
<Icon name="heart.fill" size={32} color={Colors.light.primary} />
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
        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
</>
);
```

**Rules:**
- ✅ Always use controlled inputs (value + onChangeText)
- ✅ Validate on submit, not on every keystroke
- ✅ Show error messages in Dutch
- ✅ Use appropriate `autoCapitalize`, `keyboardType`, `autoComplete`
- ❌ Never use uncontrolled inputs (ref-based)

### RN-11: Testing React Native Components
**Pattern: React Testing Library**
```typescript
import { render, fireEvent } from '@testing-library/react-native';

describe('MyComponent', () => {
   it('should handle press event', () => {
      const handlePress = jest.fn();
      const { getByRole } = render(<MyComponent onPress={handlePress} />);

      fireEvent.press(getByRole('button'));
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
- ❌ Use `getByTestId` only as last resort

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
   safeArea: { flex: 1 },
   container: { flex: 1, padding: 20 },
});
```

**Rules:**
- ✅ Use `SafeAreaView` from `react-native-safe-area-context`
- ✅ Specify `edges` prop to control which edges are safe
- ✅ Use `useSafeAreaInsets()` for custom safe area handling
- ❌ Never use React Native's built-in SafeAreaView (deprecated)

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

### RN-14: Environment and Configuration
**Pattern: Expo Config for Environment**
```typescript
// app.json
{
   "expo": {
   "name": "BreathHoldCoach",
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
      console.error('Login failed:', error.message);
   }
};

// ✅ Good - Local storage only
await AsyncStorage.setItem('progress', JSON.stringify(progress));
```

**Rules (Critical for Medical App):**
- ✅ Never log patient personal data (naam, geboortedatum, patiëntnummer)
- ✅ Store data locally only (AsyncStorage) unless explicitly required
- ✅ Request minimum permissions necessary
- ✅ Show privacy policy before data collection
- ✅ Allow users to delete all their data
- ✅ Use `expo-secure-store` for sensitive data (not AsyncStorage for passwords/tokens)
- ❌ Never send patient data to analytics services
- ❌ Never use third-party libraries that track users

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
  contexts/
    user-context.test.tsx
  screens/
    home.test.tsx
```

### 10 Testing Rules

1. **Test User Behavior, Not Implementation** - Test what user sees and does
2. **Use Accessibility Queries** - `getByRole`, `getByLabelText`, `getByText` (not `getByTestId`)
3. **Tests Must Fail for Real Bugs** - Avoid testing trivial things
4. **Descriptive Test Names** - `it('should show error when name is empty')`
5. **Parameterize Similar Tests** - Use `it.each()` for variations
6. **Independent Tests** - No shared mutable state between tests
7. **Mock External Dependencies** - Navigation, API calls, AsyncStorage
8. **Test Accessibility** - Every interactive component should have accessibility tests
9. **Arrange-Act-Assert Pattern** - Clear test structure
10. **Test Error Paths** - Don't just test happy path

### Example Test Structure
```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';

describe('BreathingExercise', () => {
   describe('when starting exercise', () => {
      it('should show timer', () => {
         const { getByText, getByRole } = render(<BreathingExercise />);
         fireEvent.press(getByRole('button', { name: /start/i }));
         expect(getByText(/0:00/)).toBeTruthy();
      });

      it('should increment timer every second', async () => {
         jest.useFakeTimers();
         const { getByText, getByRole } = render(<BreathingExercise />);
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

## Project-Specific Patterns

### Architecture Overview
- **State Management**: Context API (`contexts/user-context.tsx`)
- **Navigation**: Expo Router file-based
- **Styling**: StyleSheet with centralized theme (`constants/theme.ts`)
- **Icons**: Platform-aware Icon component (SF Symbols/Material Icons)
- **Fonts**: Montserrat family (400/500/600/700)
- **Testing**: Jest + React Testing Library
- **CI/CD**: GitHub Actions (lint, type check, tests on PR)

### Theme Constants
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
      // Legacy compatibility
      tint: '#284EA6',
      tabIconDefault: '#93A6D3',
      tabIconSelected: '#284EA6',
   },
};

export const Fonts = {
   regular: 'Montserrat_400Regular',
   medium: 'Montserrat_500Medium',
   semiBold: 'Montserrat_600SemiBold',
   bold: 'Montserrat_700Bold',
};
```

### Root Layout Pattern
```typescript
// app/_layout.tsx
export default function RootLayout() {
   const [fontsLoaded] = useFonts({ /* Montserrat fonts */ });

   useEffect(() => {
      if (fontsLoaded) SplashScreen.hideAsync();
   }, [fontsLoaded]);

   if (!fontsLoaded) return null;

   return (
           <UserProvider>
                   <ThemeProvider value={CustomTheme}>
           <Stack screenOptions={{ animation: 'none' }}>
   <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
   </Stack>
   </ThemeProvider>
           </UserProvider>
);
}
```

### Existing Components to Use
- `ThemedText` / `ThemedView` - Theme-aware components
- `Icon` - Platform-aware icons
- `Button` - Supports `href` and `onPress`
- `useUser()` - Global state hook

---

## Medical App Considerations

### 1. User Age Group (50-75 years)
- **Larger touch targets**: Minimum 44x44 points
- **Readable fonts**: Minimum 16px, high contrast
- **Simple navigation**: Max 3 taps to any feature
- **Clear feedback**: Immediate visual/haptic response
- **No complex gestures**: No swipe, pinch
- **Clear button labels**: Not just icons
- **Confirmation for destructive actions**

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

### 4. Medical Context
- No gamification that trivializes condition
- Reassuring, calm design (not playful)
- Progress tracking for motivation
- Clear explanation of DIBH importance

---

## Quick Debugging Checklist

### Component Not Rendering?
- [ ] Check import paths (use `@/` alias)
- [ ] Check export (named vs default)
- [ ] Check parent container has `flex: 1`

### Style Not Applying?
- [ ] Check StyleSheet.create() at bottom
- [ ] Check style is applied to component
- [ ] Check theme constants are imported

### Navigation Not Working?
- [ ] Check file is in correct `app/` directory
- [ ] Check route name matches file name
- [ ] Check `_layout.tsx` isn't blocking route

### Test Failing?
- [ ] Check all async operations use `waitFor`
- [ ] Check mocks are properly set up
- [ ] Check accessibility queries match actual labels

---

## Final Notes

This CLAUDE.md is your source of truth for React Native/Expo development in BreathHoldCoach. Run QNEW at session start.

**Priority Order:**
1. User safety and privacy
2. Accessibility
3. Simplicity
4. Performance
5. Code quality

**Medical App Essentials:**
- Accessibility is not optional - test with VoiceOver/TalkBack
- Privacy is paramount - never log patient data
- Simplicity wins - users are 50-75, not tech-savvy
- Dutch language - all user-facing text
- Trust and reassurance - calm, professional design