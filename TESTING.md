# Manual Testing Guide for Onboarding Flow

## Prerequisites
1. Start the Expo development server:
   ```bash
   npm start
   ```
2. Open the app in your preferred environment (web, iOS simulator, or Android emulator)

## Test Cases

### Test 1: Successful Onboarding Flow
**Goal**: Complete the entire onboarding process successfully

**Steps**:
1. Navigate to the home screen
2. Click on "Step 3: Start Onboarding"
3. **Step 1**:
   - Enter invite code: `DEMO2024`
   - Click "Continue"
   - Verify loading state appears
   - Verify navigation to Step 2

4. **Step 2**:
   - Enter name: `Test User`
   - Enter email: `test@example.com`
   - Click "Continue"
   - Verify navigation to Step 3

5. **Step 3**:
   - Select "Option A: Guided Training"
   - Verify visual checkmark appears
   - Click "Continue"
   - Verify navigation to Step 4

6. **Step 4**:
   - Verify all information is displayed correctly:
     - Invite Code: DEMO2024
     - Name: Test User
     - Email: test@example.com
     - Training Path: Guided Training
   - Click "Complete Setup"
   - Verify loading state appears
   - Verify success message appears
   - Verify auto-navigation to main app after ~2 seconds

**Expected Results**: ✅ Complete onboarding without errors

---

### Test 2: Invalid Invite Code
**Goal**: Verify error handling for invalid invite codes

**Steps**:
1. Navigate to onboarding Step 1
2. Enter invite code: `INVALID123`
3. Click "Continue"
4. Verify loading state appears
5. Verify error message: "Invalid invite code. Please try again."
6. Try valid code: `TEST123`
7. Verify successful navigation to Step 2

**Expected Results**: ✅ Error message displayed, valid code accepted

---

### Test 3: Email Validation
**Goal**: Verify email format validation

**Steps**:
1. Complete Step 1 with valid invite code
2. On Step 2, enter name: `Test User`
3. Enter invalid email: `notanemail`
4. Click "Continue"
5. Verify error: "Please enter a valid email address"
6. Try valid email: `test@example.com`
7. Verify navigation to Step 3

**Expected Results**: ✅ Invalid email rejected, valid email accepted

---

### Test 4: Required Field Validation
**Goal**: Verify required fields are enforced

**Steps**:
1. **Step 1**: Leave invite code empty, click "Continue"
   - Verify error: "Please enter an invite code"
   - Verify button is disabled

2. **Step 2**: Leave name empty, enter email only
   - Click "Continue"
   - Verify error: "Please enter your name"

3. **Step 2**: Enter name, leave email empty
   - Click "Continue"
   - Verify error: "Please enter your email"

**Expected Results**: ✅ All required fields enforced

---

### Test 5: Navigation - Back Button
**Goal**: Verify back navigation works correctly

**Steps**:
1. Complete Step 1 and Step 2
2. On Step 3, click "Back"
3. Verify navigation to Step 2
4. Verify previously entered data is retained
5. Click "Back" again
6. Verify navigation to Step 1
7. Verify invite code is retained

**Expected Results**: ✅ Back navigation works, data persists

---

### Test 6: Progress Indicator
**Goal**: Verify visual progress indicator

**Steps**:
1. Navigate to Step 1
   - Verify 1 of 4 steps highlighted in progress bar
2. Navigate to Step 2
   - Verify 2 of 4 steps highlighted
3. Navigate to Step 3
   - Verify 3 of 4 steps highlighted
4. Navigate to Step 4
   - Verify 4 of 4 steps highlighted

**Expected Results**: ✅ Progress indicator updates correctly

---

### Test 7: A/B Option Selection
**Goal**: Verify option selection works correctly

**Steps**:
1. Complete Step 1 and Step 2
2. On Step 3, select "Option A"
   - Verify checkmark appears
   - Verify border highlights
3. Select "Option B"
   - Verify checkmark moves to Option B
   - Verify Option A deselects
4. Click "Continue" without selecting
   - Verify error: "Please select an option to continue"

**Expected Results**: ✅ Single selection enforced, visual feedback works

---

### Test 8: Restart Functionality
**Goal**: Verify restart resets all data

**Steps**:
1. Complete all steps to Step 4
2. Click "Restart Onboarding"
3. Verify navigation to Step 1
4. Verify all fields are cleared
5. Verify progress indicator reset to Step 1

**Expected Results**: ✅ Complete reset of onboarding state

---

### Test 9: Theme Support
**Goal**: Verify onboarding works in both light and dark modes

**Steps**:
1. Enable dark mode on device
2. Navigate through all onboarding steps
3. Verify all components are visible and styled correctly
4. Switch to light mode
5. Verify all components still work correctly

**Expected Results**: ✅ All components support both themes

---

### Test 10: Keyboard Handling
**Goal**: Verify keyboard interactions work smoothly

**Steps**:
1. On Step 1, tap invite code input
   - Verify keyboard appears
   - Verify screen adjusts (doesn't hide button)
2. On Step 2, tap name input
   - Verify keyboard appears
   - Tap email input
   - Verify focus switches
3. Type in fields and verify input appears correctly

**Expected Results**: ✅ Keyboard handling works smoothly

---

## Valid Test Credentials

**Valid Invite Codes**:
- `DEMO2024`
- `TEST123`
- `INVITE001`
- `WELCOME`

**Valid Email Formats**:
- `test@example.com`
- `user@domain.co.uk`
- `name.surname@company.org`

---

## Regression Checklist

After any changes to onboarding code, verify:
- [ ] All 4 steps are accessible
- [ ] Progress indicator updates correctly
- [ ] Form validation works on all fields
- [ ] Error messages display properly
- [ ] Success flow completes
- [ ] Navigation (next/back/restart) works
- [ ] Theme switching doesn't break UI
- [ ] TypeScript compilation passes
- [ ] ESLint passes with no warnings
- [ ] No console errors in development

---

## Known Limitations

1. **Mock Database**: Currently using mock data for validation
   - All invite codes are hardcoded
   - No actual backend API calls

2. **No Persistence**: Onboarding state is lost on app reload
   - Consider adding AsyncStorage for draft saving

3. **No Analytics**: No tracking of onboarding completion/drop-off

## Troubleshooting

### Issue: Stuck on a step
**Solution**: Use the "Back" or "Restart Onboarding" buttons

### Issue: Error persists after fixing input
**Solution**: Clear the field and re-enter correct data

### Issue: Progress not saving
**Solution**: Ensure you click "Continue" before navigating away
