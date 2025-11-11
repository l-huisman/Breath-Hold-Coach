# Onboarding Application

This directory contains the onboarding flow implementation for the Breath Hold Coach application.

## Overview

The onboarding application provides a wizard-based experience that guides new users through a 4-step setup process. It includes:

- Invite code validation
- Personal information collection
- Training path selection (A/B option)
- Account finalization

## Architecture

### Components (`/components/onboarding/`)

#### Core Wizard Components
- **`Wizard.tsx`** - Main container that wraps the entire wizard flow
- **`WizardStep.tsx`** - Individual step wrapper for consistent layout
- **`WizardProgressIndicator.tsx`** - Visual progress bar showing current step

#### Form Components
- **`InputField.tsx`** - Text input with label and error handling
- **`Button.tsx`** - Generic button with primary/secondary variants and loading states
- **`ABButton.tsx`** - Selection button for A/B choices with visual selection indicator

#### Feedback Components
- **`ErrorMessage.tsx`** - Error display with icon and styled container
- **`SuccessMessage.tsx`** - Success message display with icon

### Screens (`/app/onboarding/`)

#### `_layout.tsx`
Wraps all onboarding screens with the `OnboardingProvider` context.

#### `step1.tsx` - Invite Code Validation
- Validates invite code against mock database
- Valid codes: `DEMO2024`, `TEST123`, `INVITE001`, `WELCOME`
- Shows loading state during validation
- Displays error for invalid codes

#### `step2.tsx` - Personal Information
- Collects user's full name
- Collects and validates email address
- Form validation with inline error messages
- Back button to return to step 1

#### `step3.tsx` - Training Path Selection
- Presents two options:
  - **Option A**: Guided Training (structured program)
  - **Option B**: Flexible Training (self-paced)
- Visual selection indicator
- Back button to return to step 2

#### `finalize.tsx` - Account Setup
- Displays summary of all entered information
- Saves data to mock database
- Generates unique local user ID
- Shows success message on completion
- Auto-navigates to main app after success
- Options to go back or restart onboarding

### Context (`/contexts/OnboardingContext.tsx`)

Provides state management for the onboarding flow:

```typescript
type OnboardingData = {
  inviteCode: string;
  name: string;
  email: string;
  selectedOption: 'A' | 'B' | null;
  localId?: string;
};
```

**Available methods:**
- `updateData(updates)` - Update onboarding data
- `resetData()` - Reset all data and return to step 1
- `setCurrentStep(step)` - Navigate to specific step
- `setIsCompleted(boolean)` - Mark onboarding as complete

### Services (`/services/database.ts`)

Mock database service that simulates API calls:

- **`validateInviteCode(code)`** - Validates invite codes
- **`validateEmail(email)`** - Validates email format
- **`generateLocalId()`** - Creates unique user identifiers
- **`saveUserData(data)`** - Saves user information to mock database
- **`checkOnboardingStatus(userId)`** - Checks if user completed onboarding

## Usage

### Starting the Onboarding Flow

From the home screen, navigate to `/onboarding/step1`:

```typescript
import { router } from 'expo-router';

router.push('/onboarding/step1');
```

### Using Onboarding Components

```typescript
import { Button, InputField, ErrorMessage } from '@/components/onboarding';

function MyComponent() {
  return (
    <>
      <InputField 
        label="Name"
        value={name}
        onChangeText={setName}
        error={error}
      />
      <ErrorMessage message="Something went wrong" />
      <Button 
        title="Continue" 
        onPress={handleNext}
        loading={isLoading}
      />
    </>
  );
}
```

### Accessing Onboarding State

```typescript
import { useOnboarding } from '@/contexts/OnboardingContext';

function MyScreen() {
  const { data, updateData, currentStep, setCurrentStep } = useOnboarding();
  
  // Access current data
  console.log(data.inviteCode, data.name, data.email);
  
  // Update data
  updateData({ name: 'John Doe' });
  
  // Navigate
  setCurrentStep(2);
}
```

## Features

### Navigation
- ✅ Forward navigation through steps
- ✅ Back button on all steps (except step 1)
- ✅ Restart functionality from finalize screen
- ✅ Auto-redirect to main app after completion

### Validation
- ✅ Invite code validation against database
- ✅ Email format validation
- ✅ Required field validation
- ✅ Real-time error feedback

### State Management
- ✅ Persistent state across steps
- ✅ Context-based data flow
- ✅ Reset functionality

### UI/UX
- ✅ Visual progress indicator
- ✅ Loading states for async operations
- ✅ Error and success messaging
- ✅ Keyboard-aware input handling
- ✅ Light/dark theme support
- ✅ Responsive design

## Testing

### Manual Testing Checklist

1. **Step 1 - Invite Code**
   - [ ] Valid code accepted (DEMO2024, TEST123, etc.)
   - [ ] Invalid code rejected with error
   - [ ] Empty field shows validation error
   - [ ] Loading state shown during validation

2. **Step 2 - Personal Info**
   - [ ] Name required validation
   - [ ] Email required validation
   - [ ] Email format validation
   - [ ] Back button returns to step 1
   - [ ] Data persists when going back/forward

3. **Step 3 - Selection**
   - [ ] Option A selectable
   - [ ] Option B selectable
   - [ ] Visual indicator shows selection
   - [ ] Error shown if no selection made
   - [ ] Back button returns to step 2

4. **Step 4 - Finalize**
   - [ ] All data displayed correctly
   - [ ] Loading state during save
   - [ ] Success message on completion
   - [ ] Auto-navigation after success
   - [ ] Back button works
   - [ ] Restart button resets flow

## Future Enhancements

- [ ] Real backend API integration
- [ ] Password/authentication setup
- [ ] Profile picture upload
- [ ] Additional validation rules
- [ ] Onboarding analytics tracking
- [ ] Save progress to local storage
- [ ] Skip/resume onboarding
- [ ] Multi-language support

## Notes

- The database service is currently mocked for development
- Replace mock service with real API calls in production
- Consider adding local storage persistence for draft data
- Add error logging/tracking for production use
