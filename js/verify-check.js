// Check if user is verified before accessing protected pages
export async function requireVerifiedUser() {
  const userEmail = localStorage.getItem('loggedInUser');
  
  // If not logged in, redirect to home
  if (!userEmail) {
    window.location.href = '/html/index.html';
    return false;
  }
  
  // For demo purposes, we'll consider all users verified
  // In production with Firebase, you would check email verification status
  
  // For phone users (emails starting with phone_)
  if (userEmail.startsWith('phone_')) {
    return true;
  }
  
  // For regular email users, check verification status
  // This is a mock - in real implementation, check Firebase
  const userData = JSON.parse(localStorage.getItem('user-' + userEmail)) || {};
  
  // If email is verified or it's a mock account, allow access
  if (userData.emailVerified === true || !userData.password) {
    return true;
  }
  
  // If not verified, redirect to verification page
  const publicPages = ['/js/verify-email.html', '/js/set-username.html', '/html/index.html', '/html/explore.html'];
  const currentPath = window.location.pathname;
  
  if (!publicPages.includes(currentPath)) {
    localStorage.setItem('pendingVerification', JSON.stringify({ email: userEmail }));
    window.location.href = '/js/verify-email.html';
    return false;
  }
  
  return true;
}

// Verify email (mock function - in production, use Firebase)
export async function verifyEmail(code) {
  // This would be handled by Firebase's email verification link
  // For demo purposes, we'll simulate verification
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
}

// Resend verification email (mock)
export async function resendVerificationEmail(email) {
  // In production, use Firebase's sendEmailVerification
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
}