// Shared user utilities for all pages
export const userUtils = {
  // Get user data from localStorage
  getUserData() {
    const userEmail = localStorage.getItem('loggedInUser');
    if (!userEmail) return null;
    
    try {
      const stored = localStorage.getItem('user-' + userEmail);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Update all profile pictures on the page
  updateProfilePictures(imageUrl) {
    // Update header profile pictures
    const userPic = document.getElementById('user-pic');
    const userDropPic = document.getElementById('user-drop-pic');
    const profilePreview = document.getElementById('profile-photo-preview');
    
    if (userPic) userPic.src = imageUrl || 'https://via.placeholder.com/32?text=U';
    if (userDropPic) userDropPic.src = imageUrl || 'https://via.placeholder.com/32?text=U';
    if (profilePreview) profilePreview.src = imageUrl || 'https://via.placeholder.com/100';
    
    // Update any other profile images with common classes
    document.querySelectorAll('.user-avatar, .profile-img, .comment-avatar').forEach(el => {
      if (el.tagName === 'IMG') {
        el.src = imageUrl || 'https://via.placeholder.com/32?text=U';
      }
    });
  },

  // Initialize user data on page load
  initUserData() {
    const userEmail = localStorage.getItem('loggedInUser');
    if (!userEmail) return;

    let userData = this.getUserData();
    
    // Create default user data if none exists
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
      localStorage.setItem('user-' + userEmail, JSON.stringify(userData));
    }

    // Update profile pictures
    this.updateProfilePictures(userData.image);
    
    return userData;
  },

  // Save user data
  saveUserData(userData) {
    const userEmail = localStorage.getItem('loggedInUser');
    if (!userEmail) return false;
    
    localStorage.setItem('user-' + userEmail, JSON.stringify(userData));
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user-' + userEmail,
      newValue: JSON.stringify(userData)
    }));
    
    return true;
  },

  // Listen for storage events to sync across tabs
  setupStorageListener(callback) {
    window.addEventListener('storage', (e) => {
      const userEmail = localStorage.getItem('loggedInUser');
      if (e.key === 'user-' + userEmail) {
        try {
          const userData = JSON.parse(e.newValue);
          this.updateProfilePictures(userData.image);
          if (callback) callback(userData);
        } catch (error) {
          console.error('Error updating from storage:', error);
        }
      }
    });
  }
};