import { notificationService } from './notificationService.js';
import { requireVerifiedUser } from './verify-check.js';
import { userUtils } from './user-utils.js';

document.addEventListener("DOMContentLoaded", async () => {

  const isVerified = await requireVerifiedUser();
  if (!isVerified) return;
 
  // Initialize user data
  userUtils.initUserData();

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

  // Toggle notification dropdown (simplified for course page)
  const notificationBell = document.getElementById('notificationBell');
  if (notificationBell) {
    notificationBell.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/html/notifications.html';
    });
  }

  // Add listener for real-time updates
  notificationService.addListener(updateNotificationBadge);
  
  // 1. SELECT ALL NECESSARY ELEMENTS
  const courseMain = document.querySelector(".course-main");
  const courseTitle = document.querySelector(".course-title");
  const instructorNameEl = document.getElementById("instructor-name");
  const instructorImgEl = document.getElementById("instructor-img");
  const startBtn = document.querySelector(".start-course-btn");
  const courseDetail = document.querySelector(".course-detail");
  const contentArea = document.getElementById("tab-dynamic-content");
  const buttons = document.querySelectorAll(".t-btn");

  // Check if user is logged in
  const userEmail = localStorage.getItem('loggedInUser');
  
  if (!userEmail) {
    window.location.href = '/html/index.html';
    return;
  }

  // 2. RETRIEVE DATA ONCE with error handling
  let courseData = null;
  try {
    courseData = JSON.parse(localStorage.getItem("selectedCourse"));
  } catch (error) {
    console.error('Error parsing course data:', error);
  }

  if (!courseData) {
    if (courseDetail) {
      courseDetail.innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <h2>No Course Selected</h2>
          <p>Please return to the home page and select a course.</p>
          <button onclick="window.location.href='/html/index.html'" style="padding: 10px 20px; background: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
            Go to Home
          </button>
        </div>
      `;
    }
    return;
  }

  // === DYNAMIC HERO SECTION ===
  if (courseTitle) courseTitle.textContent = courseData.head_1 || 'Course';
  if (instructorNameEl) instructorNameEl.textContent = courseData.instructor || "Expert Instructor";
  if (instructorImgEl) {
    instructorImgEl.src = courseData.instructor_img || "/Images/instructor-placeholder.jpg";
    instructorImgEl.onerror = function() {
      this.src = "https://via.placeholder.com/100?text=Instructor";
    };
  }
  
  if (courseMain) {
    courseMain.style.backgroundColor = "#ebf3ff"; 
    courseMain.style.backgroundImage = `url('${courseData.image || ''}')`;
    courseMain.style.backgroundSize = "cover";
    courseMain.style.backgroundPosition = "center";
    courseMain.style.backgroundBlendMode = "multiply"; 
  }

  if (startBtn && courseData) {
    startBtn.addEventListener("click", () => {
        if (!localStorage.getItem('loggedInUser')) {
          alert('Please sign in to start the course');
          window.location.href = '/html/index.html';
          return;
        }
        
        localStorage.setItem("activeCourseId", courseData.id || 'html');
        window.location.href = "/lesson/lesson.html";
    });
  }

  // === COURSE DESCRIPTION & VIDEO ===
  if (courseDetail) {
    const videoDisplay = courseData.video ? 'block' : 'none';
    const videoSrc = courseData.video || '';
    
    courseDetail.innerHTML = `
      <div class="detail-flex-container" style="display: flex; gap: 40px; align-items: flex-start; flex-wrap: wrap;">
        <div class="text-content" style="flex: 1; min-width: 300px;">
          <h2>Course Description</h2>
          <p><strong>${courseData.paragraph?.span || 'Beginner'}</strong> ${courseData.paragraph?.difn || 'Learn the fundamentals and advance your skills'}</p>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;">✅ Duration: ${courseData.duration || '12 Weeks'}</li>
            <li style="margin: 10px 0;">✅ Level: ${courseData.paragraph?.span || 'Beginner'} to Professional</li>
            <li style="margin: 10px 0;">✅ Certificate: Yes</li>
            <li style="margin: 10px 0;">✅ Students: 10,000+ enrolled</li>
          </ul>
        </div>
        <div class="video-content" style="flex: 1; min-width: 300px; display: ${videoDisplay};">
          <h3>Introduction Video</h3>
          <div class="video-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
            <iframe id="course-video" src="${videoSrc}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
          </div>
        </div>
      </div>
    `;
  }

  // === TAB NAVIGATION LOGIC ===
  if (contentArea && buttons.length > 0) {
    const updateTab = (type) => {
      contentArea.style.opacity = '0';
      contentArea.style.transition = 'opacity 0.2s ease';
      
      setTimeout(() => {
        if (type === 'outcomes') {
          const outcomes = courseData.outcomes || ["Advanced Industry Skills", "Professional Portfolio", "Real-world Projects", "Job-ready Knowledge"];
          contentArea.innerHTML = `
            <div class="tab-flex" style="display: flex; gap: 40px; align-items: center;">
              <div class="tab-info" style="flex: 1;">
                <h2>Master Key Skills</h2>
                <p>Industry-standard outcomes you will achieve:</p>
                <ul class="check-list" style="list-style: none; padding: 0;">
                  ${outcomes.map(item => `<li style="margin: 15px 0;"><i class="bi bi-check-circle-fill" style="color: #007BFF; margin-right: 10px;"></i> ${item}</li>`).join('')}
                </ul>
              </div>
              <div class="tab-image-box" style="flex: 0.8;">
                <img src="${courseData.image || 'https://via.placeholder.com/400x300?text=Skills'}" alt="Skills" style="width: 100%; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
              </div>
            </div>`;
        } else if (type === 'project') {
          contentArea.innerHTML = `
            <div class="tab-flex" style="display: flex; gap: 40px; align-items: center;">
              <div class="tab-info" style="flex: 1;">
                <h2>Capstone Project</h2>
                <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">${courseData.project_desc || "Apply your skills in a real-world project for your portfolio. Build something amazing that showcases your abilities to potential employers."}</p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
                  <h4>Project Features:</h4>
                  <ul style="margin-top: 10px;">
                    <li>✅ Real-world application</li>
                    <li>✅ Portfolio-ready</li>
                    <li>✅ Expert review</li>
                    <li>✅ Certificate upon completion</li>
                  </ul>
                </div>
              </div>
              <div class="tab-image-box" style="flex: 0.8;">
                <img src="${courseData.image || 'https://via.placeholder.com/400x300?text=Project'}" alt="Project" style="width: 100%; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
              </div>
            </div>`;
        } else {
          const syllabus = courseData.syllabus || [
            {t:"Module 1: Introduction", d:"Getting started with the basics and core concepts"},
            {t:"Module 2: Core Concepts", d:"Deep dive into essential topics and practical applications"},
            {t:"Module 3: Advanced Topics", d:"Master complex subjects and industry best practices"},
            {t:"Module 4: Projects", d:"Build real-world projects to showcase your skills"}
          ];
          
          contentArea.innerHTML = `
            <h2>Learning Path</h2>
            <div class="path-grid" style="display: grid; gap: 15px; margin-top: 20px;">
              ${syllabus.map((s, i) => `
                <div class="path-item" style="padding: 20px; background: #f8fbff; border-left: 5px solid #0056d2; border-radius: 8px; display: flex; gap: 15px;">
                  <div class="path-number" style="background: #0056d2; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">${i+1}</div>
                  <div class="path-text">
                    <h3 style="margin: 0 0 5px 0;">${s.t || `Module ${i+1}`}</h3>
                    <p style="margin: 0; color: #666;">${s.d || 'Learn essential concepts and practical skills'}</p>
                  </div>
                </div>
              `).join('')}
            </div>`;
        }
        contentArea.style.opacity = '1';
      }, 200);
    };

    updateTab('outcomes');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.getAttribute('data-target');
        if (target) updateTab(target);
      });
    });
  }

  // === LOGIN / USER STATE LOGIC ===
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
      if (userAccountDiv) {
        userAccountDiv.style.display = 'flex';
        const userData = userUtils.getUserData();
        if (userData) {
          userUtils.updateProfilePictures(userData.image);
          if (dropdownUsername) dropdownUsername.textContent = userData.name || 'User';
          if (dropdownEmail) dropdownEmail.textContent = userEmail;
        }
      }
    } else {
      if (signBtn) signBtn.style.display = 'inline-block';
      if (joinBtn) joinBtn.style.display = 'inline-block';
      if (userAccountDiv) userAccountDiv.style.display = 'none';
    }
  }

  updateLoginState();
  updateNotificationBadge();

  // Dropdown & Logout Logic
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('selectedCourse');
      localStorage.removeItem('activeCourseId');
      showNotification('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.href = "/html/index.html";
      }, 1000);
    });
  }
  
  const userAccountDiv = document.querySelector('.user-account');
  const userDropdown = document.querySelector('.user-dropdown');
  
  if (userAccountDiv && userDropdown) {
    userAccountDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
    });
    
    document.addEventListener('click', () => {
      if (userDropdown && !userDropdown.classList.contains('hidden')) {
        userDropdown.classList.add('hidden');
      }
    });
  }

  // Dark mode toggle
  const toggleThemeDropdown = document.getElementById('toggle-theme-dropdown');
  if (toggleThemeDropdown) {
    toggleThemeDropdown.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }

  // Show notification function
  function showNotification(message, type = 'info') {
    let notification = document.querySelector('.notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }

  // Modal functions
  window.toggleModal = function(type) {
    const signInModal = document.getElementById('signin-modal');
    const signUpModal = document.getElementById('signup-modal');
    if (signInModal) signInModal.classList.add('hidden');
    if (signUpModal) signUpModal.classList.add('hidden');
    if (type === 'signin' && signInModal) signInModal.classList.remove('hidden');
    else if (type === 'signup' && signUpModal) signUpModal.classList.remove('hidden');
  };

  window.signIn = function() {
    const email = document.getElementById('signin-email')?.value.trim();
    const password = document.getElementById('signin-password')?.value.trim();
    const stored = localStorage.getItem('user-' + email);

    if (!stored) {
      showNotification('User not found!', 'error');
      return;
    }
    const user = JSON.parse(stored);
    if (user.password !== password) {
      showNotification('Incorrect password!', 'error');
      return;
    }
    showNotification(`Welcome, ${user.name}!`, 'success');
    localStorage.setItem('loggedInUser', email);
    updateLoginState();
    
    document.getElementById('signin-email').value = '';
    document.getElementById('signin-password').value = '';
    
    toggleModal(null);
  };

  window.signUp = function() {
    const name = document.getElementById('signup-name')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim();
    const password = document.getElementById('signup-password')?.value.trim();
    const file = document.getElementById('signup-image')?.files[0];

    if (!name || !email || !password || !file) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    if (file.size > 200 * 1024) {
      showNotification("Please upload an image smaller than 200KB.", 'error');
      return;
    }
    const existingUser = localStorage.getItem('user-' + email);
    if (existingUser) {
      showNotification("This email is already in use.", 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageBase64 = e.target.result;
      const user = { name, email, password, image: imageBase64 };
      localStorage.setItem('user-' + email, JSON.stringify(user));
      showNotification('Account created successfully!', 'success');
      
      document.getElementById('signup-name').value = '';
      document.getElementById('signup-email').value = '';
      document.getElementById('signup-password').value = '';
      document.getElementById('signup-image').value = '';
      
      toggleModal(null);
      toggleModal('signin');
    };
    reader.readAsDataURL(file);
  };

  window.toggleAccountSettings = function() {
    const modal = document.getElementById("account-settings");
    if (modal) modal.classList.toggle("hidden");
  };

  // Add notification styles if they don't exist
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        display: none;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      }
      .notification.success { background: linear-gradient(135deg, #28a745, #20c997); }
      .notification.error { background: linear-gradient(135deg, #dc3545, #c82333); }
      .notification.info { background: linear-gradient(135deg, #007BFF, #0056b3); }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  // Setup storage listener for cross-tab updates
  userUtils.setupStorageListener((updatedData) => {
    updateLoginState();
  });
});