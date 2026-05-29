import { notificationService } from './notificationService.js';
import { requireVerifiedUser } from './verify-check.js';
import { userUtils } from './user-utils.js';

document.addEventListener("DOMContentLoaded", async () => {

  const isVerified = await requireVerifiedUser();
  if (!isVerified) return;

  // Initialize notification service
  notificationService.setupStorageListener();

  // Update notification badge
  function updateNotificationBadge() {
    const userEmail = localStorage.getItem('loggedInUser');
    const badge = document.getElementById('notificationBadge');
    
    if (!badge) return;
    
    if (!userEmail) {
      badge.classList.add('hidden');
      return;
    }
    
    const count = notificationService.getUnreadCount(userEmail);
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  // Check if user is logged in
  const userEmail = localStorage.getItem('loggedInUser');
  
  if (!userEmail) {
    window.location.href = '/html/index.html';
    return;
  }

  // Initialize user data
  let userData = userUtils.getUserData();
  
  if (!userData) {
    userData = {
      name: userEmail.split('@')[0],
      email: userEmail,
      username: userEmail.split('@')[0],
      image: 'https://via.placeholder.com/100',
      country: '',
      timezone: '',
      bio: '',
      language: 'en',
      difficulty: 'all',
      contentType: 'both',
      autoEnroll: true,
      notifications: {
        reminderDaily: true,
        reminderDeadline: true,
        alertLogin: true,
        alertPassword: true,
        emailCourse: true,
        emailPromo: false
      }
    };
    userUtils.saveUserData(userData);
  }

  // Ensure image property exists
  if (!userData.image) {
    userData.image = 'https://via.placeholder.com/100';
  }

  // Load user data into forms
  function loadUserData() {
    // Profile
    const nameInput = document.getElementById('full-name');
    if (nameInput) nameInput.value = userData.name || '';
    
    const usernameInput = document.getElementById('username');
    if (usernameInput) usernameInput.value = userData.username || '';
    
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.value = userData.email || '';
    
    const bioInput = document.getElementById('bio');
    if (bioInput) bioInput.value = userData.bio || '';
    
    const countrySelect = document.getElementById('country');
    if (countrySelect) countrySelect.value = userData.country || '';
    
    const timezoneSelect = document.getElementById('timezone');
    if (timezoneSelect) timezoneSelect.value = userData.timezone || '';
    
    // Update profile picture
    userUtils.updateProfilePictures(userData.image);

    // Learning preferences
    const languageSelect = document.getElementById('preferred-language');
    if (languageSelect) languageSelect.value = userData.language || 'en';
    
    const difficultySelect = document.getElementById('difficulty');
    if (difficultySelect) difficultySelect.value = userData.difficulty || 'all';
    
    const contentTypeSelect = document.getElementById('content-type');
    if (contentTypeSelect) contentTypeSelect.value = userData.contentType || 'both';
    
    const autoEnrollCheck = document.getElementById('auto-enroll');
    if (autoEnrollCheck) autoEnrollCheck.checked = userData.autoEnroll !== false;

    // Notifications
    if (userData.notifications) {
      const reminderDaily = document.getElementById('reminder-daily');
      if (reminderDaily) reminderDaily.checked = userData.notifications.reminderDaily !== false;
      
      const reminderDeadline = document.getElementById('reminder-deadline');
      if (reminderDeadline) reminderDeadline.checked = userData.notifications.reminderDeadline !== false;
      
      const alertLogin = document.getElementById('alert-login');
      if (alertLogin) alertLogin.checked = userData.notifications.alertLogin !== false;
      
      const alertPassword = document.getElementById('alert-password');
      if (alertPassword) alertPassword.checked = userData.notifications.alertPassword !== false;
      
      const emailCourse = document.getElementById('email-course');
      if (emailCourse) emailCourse.checked = userData.notifications.emailCourse !== false;
      
      const emailPromo = document.getElementById('email-promo');
      if (emailPromo) emailPromo.checked = userData.notifications.emailPromo || false;
    }

    // Account info
    const currentEmail = document.getElementById('current-email');
    if (currentEmail) currentEmail.textContent = userData.email;
    
    // Check if email is verified (mock - in real app, check from Firebase)
    const verifiedBadge = document.getElementById('email-verified');
    if (verifiedBadge) {
      const isVerified = userData.emailVerified || false;
      verifiedBadge.innerHTML = isVerified ? 
        '<span class="badge verified">✓ Verified</span>' : 
        '<span class="badge unverified">⚠ Not Verified</span>';
      
      const resendBtn = document.getElementById('resend-verification');
      if (resendBtn) resendBtn.style.display = isVerified ? 'none' : 'inline-block';
    }

    // Last login (mock)
    const lastLogin = localStorage.getItem('lastLogin_' + userEmail);
    const lastLoginEl = document.getElementById('last-login');
    if (lastLoginEl) {
      lastLoginEl.textContent = lastLogin ? formatTime(parseInt(lastLogin)) : 'First login';
    }
  }

  loadUserData();

  // Save profile form
  document.getElementById('profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('full-name').value.trim();
    if (!name) {
      showToast('Name is required', 'error');
      return;
    }

    const username = document.getElementById('username').value.trim();
    if (!username) {
      showToast('Username is required', 'error');
      return;
    }

    // Validate username (only letters, numbers, underscore)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      showToast('Username can only contain letters, numbers, and underscores', 'error');
      return;
    }

    userData.name = name;
    userData.username = username;
    userData.bio = document.getElementById('bio').value.trim();
    userData.country = document.getElementById('country').value;
    userData.timezone = document.getElementById('timezone').value;

    userUtils.saveUserData(userData);
    
    // Update dropdown username
    const dropdownUsername = document.getElementById('dropdown-username');
    if (dropdownUsername) dropdownUsername.textContent = name;
    
    showToast('Profile updated successfully', 'success');
  });

  // Save learning preferences
  document.getElementById('learning-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    userData.language = document.getElementById('preferred-language').value;
    userData.difficulty = document.getElementById('difficulty').value;
    userData.contentType = document.getElementById('content-type').value;
    userData.autoEnroll = document.getElementById('auto-enroll').checked;

    userUtils.saveUserData(userData);
    showToast('Learning preferences saved', 'success');
  });

  // Save notification settings
  document.getElementById('notifications-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    userData.notifications = {
      reminderDaily: document.getElementById('reminder-daily').checked,
      reminderDeadline: document.getElementById('reminder-deadline').checked,
      alertLogin: document.getElementById('alert-login').checked,
      alertPassword: document.getElementById('alert-password').checked,
      emailCourse: document.getElementById('email-course').checked,
      emailPromo: document.getElementById('email-promo').checked
    };

    userUtils.saveUserData(userData);
    showToast('Notification settings saved', 'success');
  });

  // Cancel profile changes
  document.getElementById('cancel-profile')?.addEventListener('click', () => {
    loadUserData();
  });

  // Password form
  document.getElementById('password-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('All fields are required', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    // Verify current password
    if (currentPassword !== userData.password) {
      showToast('Current password is incorrect', 'error');
      return;
    }

    userData.password = newPassword;
    userUtils.saveUserData(userData);
    
    // Clear form
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    
    showToast('Password updated successfully', 'success');
    
    // Send email notification (mock)
    console.log('Password change notification would be sent to', userData.email);
  });

  // Toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = btn.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
      }
    });
  });

  // Photo upload with better persistence
  document.getElementById('change-photo-btn')?.addEventListener('click', () => {
    document.getElementById('photo-upload').click();
  });

  document.getElementById('photo-upload')?.addEventListener('change', function(e) {
    const file = this.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be smaller than 2MB', 'error');
      this.value = '';
      return;
    }

    if (!file.type.match('image.*')) {
      showToast('Please upload an image file', 'error');
      this.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      
      // Update user data
      userData.image = imageData;
      userUtils.saveUserData(userData);
      
      // Update all profile pictures immediately
      userUtils.updateProfilePictures(imageData);
      
      showToast('Profile photo updated', 'success');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('remove-photo-btn')?.addEventListener('click', () => {
    showConfirmModal('Remove Photo', 'Are you sure you want to remove your profile photo?', () => {
      const defaultImage = 'https://via.placeholder.com/100';
      
      userData.image = defaultImage;
      userUtils.saveUserData(userData);
      
      userUtils.updateProfilePictures(defaultImage);
      
      showToast('Profile photo removed', 'success');
    });
  });

  // 2FA toggle
  document.getElementById('enable-2fa')?.addEventListener('change', (e) => {
    const setupDiv = document.getElementById('2fa-setup');
    if (e.target.checked) {
      setupDiv.style.display = 'block';
    } else {
      if (userData.twoFactorEnabled) {
        showConfirmModal('Disable 2FA', 'Are you sure you want to disable two-factor authentication?', () => {
          setupDiv.style.display = 'none';
          userData.twoFactorEnabled = false;
          userUtils.saveUserData(userData);
          showToast('2FA disabled', 'info');
        });
      } else {
        setupDiv.style.display = 'none';
      }
    }
  });

  document.getElementById('verify-2fa')?.addEventListener('click', () => {
    const code = document.getElementById('2fa-code').value;
    if (!code || code.length !== 6) {
      showToast('Please enter a valid 6-digit code', 'error');
      return;
    }

    // Mock 2FA verification
    userData.twoFactorEnabled = true;
    userUtils.saveUserData(userData);
    showToast('2FA enabled successfully', 'success');
    document.getElementById('2fa-setup').style.display = 'none';
  });

  // Logout from all devices
  document.getElementById('logout-all')?.addEventListener('click', () => {
    showConfirmModal('Logout All Devices', 'This will sign you out from all devices. Continue?', () => {
      // Mock logout all
      showToast('Logged out from all other devices', 'success');
    });
  });

  // Send reset link
  document.getElementById('send-reset-link')?.addEventListener('click', () => {
    showToast('Password reset link sent to your email', 'success');
  });

  // Resend verification
  document.getElementById('resend-verification')?.addEventListener('click', () => {
    showToast('Verification email sent', 'success');
  });

  // Connect Google
  document.getElementById('connect-google')?.addEventListener('click', () => {
    const googleStatus = document.getElementById('google-status');
    const connectBtn = document.getElementById('connect-google');
    
    if (googleStatus.classList.contains('connected')) {
      showConfirmModal('Disconnect Google', 'Are you sure you want to disconnect your Google account?', () => {
        googleStatus.textContent = 'Not connected';
        googleStatus.className = 'method-status not-connected';
        connectBtn.textContent = 'Connect';
        showToast('Google account disconnected', 'info');
      });
    } else {
      // Mock connecting Google
      googleStatus.textContent = 'Connected';
      googleStatus.className = 'method-status connected';
      connectBtn.textContent = 'Disconnect';
      showToast('Google account connected', 'success');
    }
  });

  // Billing actions
  document.getElementById('upgrade-plan')?.addEventListener('click', () => {
    showToast('Redirecting to upgrade page...', 'info');
  });

  document.getElementById('add-payment')?.addEventListener('click', () => {
    showToast('Payment method setup coming soon', 'info');
  });

  document.getElementById('cancel-subscription')?.addEventListener('click', () => {
    showConfirmModal('Cancel Subscription', 'Are you sure you want to cancel your subscription? You will lose access to Pro features.', () => {
      document.getElementById('current-plan').textContent = 'Free Plan';
      showToast('Subscription cancelled', 'info');
    });
  });

  // Account actions
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logout();
  });

  document.getElementById('reset-progress')?.addEventListener('click', () => {
    showConfirmModal('Reset Progress', 'This will erase all your learning progress. This cannot be undone.', () => {
      localStorage.removeItem(`enrolled_${userEmail}`);
      localStorage.removeItem(`progress-${userEmail}-html`);
      localStorage.removeItem(`progress-${userEmail}-css`);
      localStorage.removeItem(`progress-${userEmail}-js`);
      showToast('Progress reset successfully', 'success');
    });
  });

  document.getElementById('delete-account')?.addEventListener('click', () => {
    showConfirmModal('Delete Account', 'This will permanently delete your account and all data. This cannot be undone.', () => {
      localStorage.removeItem('user-' + userEmail);
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem(`enrolled_${userEmail}`);
      
      showToast('Account deleted', 'success');
      setTimeout(() => {
        window.location.href = '/html/index.html';
      }, 2000);
    });
  });

  // Help Center functionality
  function loadFAQ() {
    const faqContainer = document.getElementById('faq-list');
    if (!faqContainer) return;

    const faqs = [
      {
        question: "How do I reset my password?",
        answer: "Go to Settings → Account → Change Password, or click 'Forgot Password' on the sign-in page to receive a reset link via email."
      },
      {
        question: "How do I get a certificate?",
        answer: "Certificates are awarded upon completing all lessons and the final project in a course. You can download them from your dashboard after completion."
      },
      {
        question: "Why isn't my progress saving?",
        answer: "Make sure you're signed in. Progress is automatically saved as you complete lessons. If issues persist, clear your browser cache and refresh."
      },
      {
        question: "Can I access courses on mobile?",
        answer: "Yes! O-Learning Path is fully responsive and works on all devices. You can learn on your phone, tablet, or computer."
      },
      {
        question: "How do I contact an instructor?",
        answer: "Within each course, you can use the 'Message Instructor' feature in the lesson sidebar to ask questions directly."
      },
      {
        question: "Are courses really free?",
        answer: "Yes! All basic courses are completely free. We offer premium content with Pro subscription for advanced features and certificates."
      },
      {
        question: "How do I change my email address?",
        answer: "Email changes require verification. Please contact support to update your email address securely."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, PayPal, and Google Pay for Pro subscriptions."
      }
    ];

    faqContainer.innerHTML = faqs.map((faq, index) => `
      <div class="faq-item">
        <div class="faq-question" onclick="toggleFAQ(${index})">
          <span>${faq.question}</span>
          <i class="bi bi-chevron-down"></i>
        </div>
        <div class="faq-answer" id="faq-${index}">
          <p>${faq.answer}</p>
        </div>
      </div>
    `).join('');
  }

  window.toggleFAQ = function(index) {
    const answer = document.getElementById(`faq-${index}`);
    const icon = answer.previousElementSibling.querySelector('i');
    
    if (answer.classList.contains('show')) {
      answer.classList.remove('show');
      icon.classList.remove('bi-chevron-up');
      icon.classList.add('bi-chevron-down');
    } else {
      answer.classList.add('show');
      icon.classList.remove('bi-chevron-down');
      icon.classList.add('bi-chevron-up');
    }
  };

  // Contact form
  document.getElementById('contact-support-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const category = document.getElementById('contact-category').value;

    if (!subject || !message) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    // Store support ticket
    const tickets = JSON.parse(localStorage.getItem('support_tickets')) || [];
    const ticket = {
      id: 'TICKET-' + Date.now(),
      userId: userEmail,
      userName: userData.name,
      userEmail: userEmail,
      category: category,
      subject: subject,
      message: message,
      status: 'open',
      date: Date.now(),
      replies: []
    };
    
    tickets.push(ticket);
    localStorage.setItem('support_tickets', JSON.stringify(tickets));

    // Clear form
    document.getElementById('contact-subject').value = '';
    document.getElementById('contact-message').value = '';
    document.getElementById('contact-category').value = 'general';

    showToast('Your message has been sent to support. We\'ll respond within 24 hours.', 'success');

    // Show admin notification (in real app, this would trigger an email)
    console.log('Support ticket created:', ticket);
  });

  // Report problem form
  document.getElementById('report-problem-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const problemType = document.getElementById('problem-type').value;
    const problemDescription = document.getElementById('problem-description').value.trim();
    const problemUrl = document.getElementById('problem-url').value.trim() || window.location.href;

    if (!problemDescription) {
      showToast('Please describe the problem', 'error');
      return;
    }

    // Store bug report
    const bugs = JSON.parse(localStorage.getItem('bug_reports')) || [];
    const bug = {
      id: 'BUG-' + Date.now(),
      userId: userEmail,
      userName: userData.name,
      userEmail: userEmail,
      type: problemType,
      description: problemDescription,
      url: problemUrl,
      userAgent: navigator.userAgent,
      status: 'new',
      date: Date.now()
    };
    
    bugs.push(bug);
    localStorage.setItem('bug_reports', JSON.stringify(bugs));

    // Clear form
    document.getElementById('problem-description').value = '';

    showToast('Problem reported. Our team will investigate.', 'success');
    console.log('Bug report:', bug);
  });

  // Help tab switching
  window.showHelpTab = function(tabName, event) {
    // Update tab buttons
    document.querySelectorAll('.help-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update panels
    document.querySelectorAll('.help-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById('help-' + tabName).classList.add('active');
    
    // Load FAQ if switching to FAQ tab
    if (tabName === 'faq') {
      loadFAQ();
    }
  };

  // Modal functions
  window.showConfirmModal = function(title, message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    
    const confirmBtn = document.getElementById('confirm-action');
    confirmBtn.onclick = () => {
      onConfirm();
      closeConfirmModal();
    };
    
    modal.classList.remove('hidden');
  };

  window.closeConfirmModal = function() {
    document.getElementById('confirm-modal').classList.add('hidden');
  };

  // Toast functions
  function showToast(message, type = 'info') {
    const toast = document.getElementById('notification-toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    
    // Set color based on type
    toast.style.borderLeftColor = 
      type === 'success' ? '#28a745' :
      type === 'error' ? '#dc3545' : '#007BFF';
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  window.closeToast = function() {
    document.getElementById('notification-toast').classList.add('hidden');
  };

  // Update notification badge
  function updateNotificationBadge() {
    const userEmail = localStorage.getItem('loggedInUser');
    const badge = document.getElementById('notificationBadge');
    
    if (!badge) return;
    
    if (!userEmail) {
      badge.classList.add('hidden');
      return;
    }
    
    const count = notificationService.getUnreadCount(userEmail);
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  // Toggle notification dropdown
  const notificationBell = document.getElementById('notificationBell');
  if (notificationBell) {
    notificationBell.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/html/notifications.html';
    });
  }

  // Add listener for real-time updates
  notificationService.addListener(updateNotificationBadge);
  
  updateNotificationBadge();

  // Login/Logout functions
  window.logout = function() {
    showConfirmModal('Logout', 'Are you sure you want to log out?', () => {
      localStorage.removeItem('loggedInUser');
      showToast('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.href = '/html/index.html';
      }, 1500);
    });
  };

  // Update login state
  function updateLoginState() {
    const userEmail = localStorage.getItem('loggedInUser');
    const signBtn = document.querySelector('.sign');
    const joinBtn = document.querySelector('.join');
    const userAccountDiv = document.querySelector('.user-account');
    const userPic = document.getElementById('user-pic');
    const userDropPic = document.getElementById('user-drop-pic');
    const dropdownUsername = document.getElementById('dropdown-username');
    const dropdownEmail = document.getElementById('dropdown-email');

    if (userEmail) {
      if (signBtn) signBtn.style.display = 'none';
      if (joinBtn) joinBtn.style.display = 'none';
      if (userAccountDiv) userAccountDiv.style.display = 'flex';
      
      const userData = userUtils.getUserData();
      if (userData) {
        userUtils.updateProfilePictures(userData.image);
        if (dropdownUsername) dropdownUsername.textContent = userData.name || 'User';
        if (dropdownEmail) dropdownEmail.textContent = userEmail;
      }
    } else {
      if (signBtn) signBtn.style.display = 'inline-block';
      if (joinBtn) joinBtn.style.display = 'inline-block';
      if (userAccountDiv) userAccountDiv.style.display = 'none';
    }
  }

  updateLoginState();

  // Dark mode toggle
  const toggleBtnDropdown = document.getElementById('toggle-theme-dropdown');
  if (toggleBtnDropdown) {
    toggleBtnDropdown.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.toggle('dark');
      localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
  }

  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }

  // User dropdown
  const userAccountDiv = document.querySelector('.user-account');
  const userDropdown = document.querySelector('.user-dropdown');

  if (userAccountDiv && userDropdown) {
    userAccountDiv.addEventListener('click', e => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
    });
    
    document.addEventListener('click', () => {
      if (userDropdown && !userDropdown.classList.contains('hidden')) {
        userDropdown.classList.add('hidden');
      }
    });
  }

  // Format time helper
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
  }

  // Load FAQ when help section is opened
  const helpNavItem = document.querySelector('[data-section="help"]');
  if (helpNavItem) {
    helpNavItem.addEventListener('click', () => {
      setTimeout(loadFAQ, 100);
    });
  }

  // Setup storage listener for cross-tab updates
  userUtils.setupStorageListener((updatedData) => {
    userData = updatedData;
    loadUserData();
  });
});