// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

// Firebase configuration (Replace with your own Firebase config)
const firebaseConfig = {

  apiKey: "AIzaSyA-HLgLThUqXTqLkmLOUBf2c60YnThDQJI",

  authDomain: "compskills-7873d.firebaseapp.com",

  projectId: "compskills-7873d",

  storageBucket: "compskills-7873d.firebasestorage.app",

  messagingSenderId: "735742612096",

  appId: "1:735742612096:web:8aa3e82aed962d843c8c65",

  measurementId: "G-J4Q10YQBF7"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Sign up with email and password
export async function signUpWithEmail(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = 'Sign up failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    }
    return { success: false, error: errorMessage };
  }
}

// Sign in with email and password
export async function signInWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      return { success: false, needsVerification: true, email: user.email };
    }
    
    return { success: true, user: user };
  } catch (error) {
    let errorMessage = 'Sign in failed. Please check your credentials.';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    }
    return { success: false, error: errorMessage };
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Initialize Recaptcha for phone auth
export function initializeRecaptcha() {
  const container = document.getElementById('recaptcha-container');
  if (container && !window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {}
    });
  }
}

// Sign in with phone
export async function signInWithPhone(phoneNumber) {
  try {
    if (!window.recaptchaVerifier) {
      initializeRecaptcha();
    }
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    return { success: true, confirmation: confirmationResult };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Verify phone OTP
export async function verifyPhoneOTP(confirmation, otp) {
  try {
    const result = await confirmation.confirm(otp);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: 'Invalid OTP. Please try again.' };
  }
}

// Send password reset email
export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    let errorMessage = 'Failed to send reset email.';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    }
    return { success: false, error: errorMessage };
  }
}

// Sign out
export async function signOutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Auth state change listener
export function onAuthStateChange(callback) {
  onAuthStateChanged(auth, callback);
}

// Check if email is verified
export function isEmailVerified(user) {
  return user?.emailVerified || false;
}