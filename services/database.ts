/**
 * Mock database service for onboarding validation and data storage.
 * In a production environment, this would connect to a real backend API.
 */

// Mock valid invite codes
const VALID_INVITE_CODES = ['DEMO2024', 'TEST123', 'INVITE001', 'WELCOME'];

// Simulated database delay
const MOCK_DELAY = 800;

/**
 * Validates an invite code against the mock database
 * @param inviteCode - The invite code to validate
 * @returns Promise that resolves to true if valid, false otherwise
 */
export async function validateInviteCode(inviteCode: string): Promise<boolean> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  
  return VALID_INVITE_CODES.includes(inviteCode.toUpperCase());
}

/**
 * Validates email format
 * @param email - The email to validate
 * @returns true if email format is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generates a unique local ID for the user
 * Note: This is a simple UUID-like implementation for client-side use.
 * In production, user IDs should be generated server-side to ensure uniqueness
 * and security. This is sufficient for a mock/demo database.
 * @returns A unique identifier
 */
export function generateLocalId(): string {
  // Simple UUID-like generation using timestamp and counter
  // This is NOT cryptographically secure but suitable for demo purposes
  const timestamp = Date.now().toString(36);
  const counter = Math.floor(performance.now() * 1000).toString(36);
  return `user_${timestamp}_${counter}`;
}

/**
 * Saves user data to the mock database
 * @param userData - The user data to save
 * @returns Promise that resolves to the saved user with ID
 */
export async function saveUserData(userData: {
  inviteCode: string;
  name: string;
  email: string;
  selectedOption: 'A' | 'B' | null;
}): Promise<{ success: boolean; userId: string }> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  
  const userId = generateLocalId();
  
  // In a real app, this would save to a database
  console.log('Saving user data:', { ...userData, userId });
  
  return {
    success: true,
    userId,
  };
}

/**
 * Checks if a user has completed onboarding
 * @param userId - The user ID to check
 * @returns Promise that resolves to true if onboarding is complete
 */
export async function checkOnboardingStatus(userId?: string): Promise<boolean> {
  if (!userId) return false;
  
  // In a real app, this would check the database
  return false;
}
