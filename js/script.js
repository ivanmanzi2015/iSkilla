import { courses, trendingCourses, JustForYou } from '../data/lessons.js';
import { notificationService } from './notificationService.js';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithGoogle,
  signInWithPhone,
  verifyPhoneOTP,
  signOutUser,
  onAuthStateChange,
  initializeRecaptcha,
  sendPasswordReset,
  isEmailVerified
} from './firebase-init.js';
import { requireVerifiedUser } from './verify-check.js';
import { userUtils } from './user-utils.js';

const allCourses = [...courses, ...trendingCourses, ...JustForYou];

document.addEventListener("DOMContentLoaded", async () => {

  // Initialize user data
  userUtils.initUserData();

  // Initialize notification service
  notificationService.setupStorageListener();

  // Check if current page requires verification
  const publicPages = ['/html/index.html', '/html/explore.html', '/js/verify-email.html', '/js/set-username.html'];
  const currentPath = window.location.pathname;
  
  if (!publicPages.includes(currentPath)) {
    // This is a protected page, check verification
    await requireVerifiedUser();
  }

  // Check auth state
  onAuthStateChange((user) => {
    if (user) {
      // Check if email is verified (skip for Google/Phone users)
      const isGoogleOrPhone = user.providerData.some(
        provider => provider.providerId === 'google.com' || provider.providerId === 'phone'
      );
      
      if (user.emailVerified || isGoogleOrPhone) {
        // User is fully verified
        const email = user.email || `phone_${user.phoneNumber?.replace(/[^0-9]/g, '')}@phone.user`;
        const userData = {
          name: user.displayName || `User ${user.phoneNumber?.slice(-4) || ''}`,
          email: email,
          image: user.photoURL || 'https://via.placeholder.com/32?text=U',
          uid: user.uid,
          emailVerified: true
        };
        localStorage.setItem('user-' + email, JSON.stringify(userData));
        localStorage.setItem('loggedInUser', email);
        userUtils.updateProfilePictures(user.photoURL || 'https://via.placeholder.com/32?text=U');
      } else {
        // User exists but email not verified
        localStorage.removeItem('loggedInUser');
      }
      updateLoginState();
    } else {
      // User is signed out
      localStorage.removeItem('loggedInUser');
      updateLoginState();
    }
  });

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

  // Load notification dropdown
  async function loadNotificationDropdown() {
    const userEmail = localStorage.getItem('loggedInUser');
    const dropdown = document.getElementById('notificationDropdown');
    const list = document.getElementById('notificationList');
    
    if (!dropdown || !list || !userEmail) return;
    
    const notifications = notificationService.getUserNotifications(userEmail).slice(0, 5);
    
    if (notifications.length === 0) {
      list.innerHTML = `
        <div class="notification-empty">
          <i class="bi bi-bell"></i>
          <p>No new notifications</p>
        </div>
      `;
      return;
    }
    
    list.innerHTML = notifications.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
        <img src="${n.senderImage || 'https://via.placeholder.com/40'}" class="notification-avatar" onerror="this.src='https://via.placeholder.com/40'">
        <div class="notification-content">
          <div class="notification-title">${n.title}</div>
          <div class="notification-message">${n.message.substring(0, 50)}${n.message.length > 50 ? '...' : ''}</div>
          <div class="notification-time">${formatTime(n.timestamp)}</div>
        </div>
      </div>
    `).join('');
    
    list.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        notificationService.markAsRead(userEmail, id);
        window.location.href = '/html/notifications.html';
      });
    });
  }

  // Format time
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
  }

  // Toggle notification dropdown
  const notificationBell = document.getElementById('notificationBell');
  const notificationDropdown = document.getElementById('notificationDropdown');

  if (notificationBell && notificationDropdown) {
    notificationBell.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle('active');
      if (notificationDropdown.classList.contains('active')) {
        loadNotificationDropdown();
      }
    });
    
    document.addEventListener('click', (e) => {
      if (!notificationBell.contains(e.target) && !notificationDropdown.contains(e.target)) {
        notificationDropdown.classList.remove('active');
      }
    });
  }

  // Mark all as read
  const markAllRead = document.getElementById('markAllRead');
  if (markAllRead) {
    markAllRead.addEventListener('click', () => {
      const userEmail = localStorage.getItem('loggedInUser');
      if (userEmail) {
        notificationService.markAllAsRead(userEmail);
        loadNotificationDropdown();
        updateNotificationBadge();
      }
    });
  }

  // Add listener for real-time updates
  notificationService.addListener(updateNotificationBadge);

  let lastScrollY = window.scrollY;
  const header = document.querySelector("header");

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      header.classList.add("hide-header");
    } else {
      header.classList.remove("hide-header");
    }
    lastScrollY = currentScrollY;
  });

  // Logo track slider pause on hover
  const sliders = document.querySelectorAll('.logo-track');
  sliders.forEach(track => {
    track.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    
    track.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  });

  // Render basic courses
  const section = document.querySelector(".section");
  if (section) {
    section.innerHTML = "";
    courses.forEach((course) => {
      const a = document.createElement("a");
      a.className = "ank html protected-course";
      a.href = "javascript:void(0);";
      
      a.innerHTML = `
        <img src="${course.image}" alt="${course.head_1}" onerror="this.src='https://via.placeholder.com/250x150?text=Course'">
        <h3>${course.head_1}</h3>
        <p><span>${course.paragraph?.span || 'Beginner'}</span>${course.paragraph?.difn || ''}</p>
        <h5>${course.head_2 || 'Start Learning'}</h5>
      `;

      a.addEventListener("click", (e) => {
        e.preventDefault();
        handleCourseClick(course);
      });

      section.appendChild(a);
    });
  }

  // Course click handler - requires sign in
  function handleCourseClick(course) {
    const userEmail = localStorage.getItem("loggedInUser");
    
    if (!userEmail) {
      showNotification("Please sign in to access this course", "info");
      toggleModal('signin');
      return;
    }
    
    // Track enrollment
    trackCourseEnrollment(course.id);
    
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    localStorage.setItem("activeCourseId", course.id || 'html');
    
    window.location.href = "/course/course.html";
  }

  // Show notification
  function showNotification(message, type = "info") {
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

  /* ===============================
    JUST FOR YOU SYSTEM
  ================================ */
  const jfyContainer = document.getElementById("justForYouContainer");
  const jfyPagination = document.getElementById("justForYouPagination");
  const durButtons = document.querySelectorAll(".dur-pill");

  let activeDuration = "2 hours or less";
  let jfyLimit = 4;

  function renderJustForYou() {
    if (!jfyContainer) return;
    jfyContainer.innerHTML = "";

    const filtered = JustForYou.filter(c => c.duration === activeDuration);
    const visible = filtered.slice(0, jfyLimit);

    visible.forEach(course => {
      const card = document.createElement("a");
      card.className = "ank html protected-course";
      card.href = "javascript:void(0);";

      card.addEventListener("click", (e) => {
        e.preventDefault();
        handleCourseClick(course);
      });

      card.innerHTML = `
        <div style="position:relative">
          <span class="free-trial-tag">Free Trial</span>
          <img src="${course.image}" alt="${course.head_1}" onerror="this.src='https://via.placeholder.com/250x150?text=Course'">
        </div>
        <h3>${course.head_1}</h3>
        <p><span>${course.paragraph?.span || 'Beginner'}</span>${course.paragraph?.difn || ''}</p>
        <h5>${course.head_2 || 'Start Learning'}</h5>
        <p class="special-text">Specialization</p>
      `;
      jfyContainer.appendChild(card);
    });

    jfyPagination.innerHTML = "";
    if (filtered.length > 4) {
      const btn = document.createElement("button");
      btn.className = "show-more-jfy";
      
      if (jfyLimit < filtered.length) {
        btn.textContent = `Show ${filtered.length - jfyLimit} more`;
        btn.onclick = () => { jfyLimit += 4; renderJustForYou(); };
      } else {
        btn.textContent = "Show less";
        btn.onclick = () => { jfyLimit = 4; renderJustForYou(); };
      }
      jfyPagination.appendChild(btn);
    }
  }

  if (durButtons.length > 0) {
    durButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        durButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeDuration = btn.getAttribute("data-duration");
        jfyLimit = 4;
        renderJustForYou();
      });
    });
  }

  renderJustForYou();

  // === EXPLORE DROPDOWN FUNCTIONALITY ===
  document.querySelectorAll('.explore-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const category = item.dataset.category;
      window.location.href = `/html/explore.html?category=${category}`;
    });
  });

  /* ===============================
    TRENDING SYSTEM
  ================================ */
  const skillsWrapper = document.getElementById("skillsContainer");
  const trendingSection = document.querySelector(".section-scroll .section");
  
  let showMoreCoursesContainer;
  if (trendingSection && trendingSection.parentNode) {
    showMoreCoursesContainer = document.createElement("div");
    showMoreCoursesContainer.id = "pagination-container";
    trendingSection.parentNode.appendChild(showMoreCoursesContainer);
  }

  let activeSkill = "Web Development";
  let courseLimit = 4;

  const trendingSkills = [
    "Web Development",
    "Machine Learning",
    "Python Programming",
    "Artificial Intelligence",
    "UI / UX Design",
    "Data Science",
    "Cloud Computing",
    "Cyber Security",
    "Mobile App Development",
    "Game Development",
    "DevOps",
    "Blockchain"
  ];

  function renderSkills() {
    if (!skillsWrapper) return;
    skillsWrapper.innerHTML = "";
    trendingSkills.forEach(skill => {
      const span = document.createElement("span");
      span.className = `skill-pill ${activeSkill === skill ? 'active' : ''}`;
      span.textContent = skill;
      
      span.addEventListener("click", () => {
        activeSkill = skill;
        courseLimit = 4;
        renderSkills();
        renderTrendingCourses();
      });
      
      skillsWrapper.appendChild(span);
    });
  }

  function renderTrendingCourses() {
    if (!trendingSection) return;
    trendingSection.innerHTML = "";
    
    const filtered = trendingCourses.filter(c => c.skill === activeSkill);
    const visibleCourses = filtered.slice(0, courseLimit);

    visibleCourses.forEach(course => {
      const a = document.createElement("a");
      a.className = "ank html protected-course";
      a.href = "javascript:void(0);";

      a.addEventListener("click", (e) => {
        e.preventDefault();
        handleCourseClick(course);
      });
      
      a.innerHTML = `
        <div style="position:relative">
          <span style="position:absolute; top:10px; right:10px; background:white; padding:2px 8px; border-radius:4px; font-size:10px;">Free Trial</span>
          <img src="${course.image}" alt="${course.head_1}" onerror="this.src='https://via.placeholder.com/250x150?text=Course'">
        </div>
        <h3>${course.head_1}</h3>
        <p><span>${course.paragraph?.span || 'Beginner'}</span>${course.paragraph?.difn || ''}</p>
        <h5>${course.head_2 || 'Start Learning'}</h5>
        <p style="font-size:12px; color:gray">Specialization</p>
      `;
      trendingSection.appendChild(a);
    });

    if (showMoreCoursesContainer) {
      showMoreCoursesContainer.innerHTML = "";

      if (filtered.length > 4) {
        const btn = document.createElement("button");
        btn.className = "show-more-courses-btn";

        if (courseLimit < filtered.length) {
          btn.textContent = `Show ${filtered.length - courseLimit} more`;
          btn.onclick = () => {
            courseLimit += 4;
            renderTrendingCourses();
          };
        } else {
          btn.textContent = "Show less";
          btn.onclick = () => {
            courseLimit = 4;
            renderTrendingCourses();
            trendingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          };
        }
        showMoreCoursesContainer.appendChild(btn);
      }
    }
  }

  renderSkills();
  renderTrendingCourses();

  // === ENHANCED SEARCH SYSTEM ===
  const searchInput = document.querySelector(".search-box input[type='search']");
  const resultsContainer = document.getElementById("search-results");
  let selectedIndex = -1;
  let filteredSearchCourses = [];

  function getAllCoursesForSearch() {
    const allSearchCourses = [];
    
    courses.forEach(course => {
      allSearchCourses.push({
        title: course.head_1,
        description: course.paragraph?.difn || '',
        url: '/course/course.html',
        image: course.image,
        level: course.paragraph?.span || 'Beginner',
        courseData: course
      });
    });

    trendingCourses.forEach(course => {
      if (!allSearchCourses.some(c => c.title === course.head_1)) {
        allSearchCourses.push({
          title: course.head_1,
          description: course.paragraph?.difn || '',
          url: '/course/course.html',
          image: course.image,
          level: course.paragraph?.span || 'Beginner',
          courseData: course
        });
      }
    });

    JustForYou.forEach(course => {
      if (!allSearchCourses.some(c => c.title === course.head_1)) {
        allSearchCourses.push({
          title: course.head_1,
          description: course.paragraph?.difn || '',
          url: '/course/course.html',
          image: course.image,
          level: course.paragraph?.span || 'Beginner',
          courseData: course
        });
      }
    });

    return allSearchCourses;
  }

  const allSearchCourses = getAllCoursesForSearch();

  function adjustResultsWidth() {
    if (resultsContainer && searchInput) {
      resultsContainer.style.width = searchInput.offsetWidth + "px";
    }
  }

  function clearResults() {
    if (resultsContainer) {
      resultsContainer.innerHTML = "";
      resultsContainer.style.display = "none";
    }
    selectedIndex = -1;
  }

  function updateHighlight() {
    if (!resultsContainer) return;
    const items = resultsContainer.querySelectorAll("li");
    items.forEach((item, i) => {
      item.classList.toggle("highlight", i === selectedIndex);
      if (i === selectedIndex) item.scrollIntoView({ block: "nearest" });
    });
  }

  function showResults(coursesList) {
    if (!resultsContainer) return;
    clearResults();
    if (coursesList.length === 0) return;
    
    coursesList.slice(0, 5).forEach(course => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center;">
          <img src="${course.image}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/40'">
          <div>
            <strong>${course.title}</strong><br>
            <small>${course.level} • ${course.description.slice(0, 40)}...</small>
          </div>
        </div>
      `;
      
      li.addEventListener("click", () => {
        const userEmail = localStorage.getItem("loggedInUser");
        if (!userEmail) {
          showNotification("Please sign in to access this course", "info");
          toggleModal('signin');
          clearResults();
          return;
        }
        
        localStorage.setItem("selectedCourse", JSON.stringify(course.courseData));
        localStorage.setItem("activeCourseId", course.courseData.id || 'html');
        window.location.href = "/course/course.html";
      });
      
      resultsContainer.appendChild(li);
    });
    
    resultsContainer.style.display = "block";
    resultsContainer.style.animation = "fadeIn 0.3s ease forwards";
  }

  function filterCourses(query) {
    const q = query.toLowerCase();
    return allSearchCourses.filter(course =>
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q)
    );
  }

  if (searchInput && resultsContainer) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim();
      if (!query) {
        clearResults();
        return;
      }
      filteredSearchCourses = filterCourses(query);
      showResults(filteredSearchCourses);
    });

    searchInput.addEventListener("keydown", (e) => {
      const items = resultsContainer.querySelectorAll("li");
      if (resultsContainer.style.display === "none" || items.length === 0) return;
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        updateHighlight();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateHighlight();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0) {
          items[selectedIndex].click();
        } else if (filteredSearchCourses.length > 0) {
          const userEmail = localStorage.getItem("loggedInUser");
          if (!userEmail) {
            showNotification("Please sign in to access this course", "info");
            toggleModal('signin');
            clearResults();
            return;
          }
          
          localStorage.setItem("selectedCourse", JSON.stringify(filteredSearchCourses[0].courseData));
          localStorage.setItem("activeCourseId", filteredSearchCourses[0].courseData.id || 'html');
          window.location.href = "/course/course.html";
        }
      } else if (e.key === "Escape") {
        clearResults();
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container") && resultsContainer) {
      clearResults();
    }
  });

  window.addEventListener("resize", adjustResultsWidth);
  adjustResultsWidth();

  // === MODAL TOGGLES ===
  const signInModal = document.getElementById('signin-modal');
  const signUpModal = document.getElementById('signup-modal');
  const phoneModal = document.getElementById('phone-verification-modal');
  const resetPasswordModal = document.getElementById('reset-password-modal');
  const logoutBtn = document.getElementById('logout');

  const signBtn = document.querySelector('.sign');
  const joinBtn = document.querySelector('.join');
  const phoneSignInBtn = document.getElementById('phone-signin-btn');
  const forgotPasswordLink = document.getElementById('forgot-password');

  if (signBtn) signBtn.onclick = () => toggleModal('signin');
  if (joinBtn) joinBtn.onclick = () => toggleModal('signup');
  if (phoneSignInBtn) phoneSignInBtn.onclick = () => toggleModal('phone');
  if (forgotPasswordLink) forgotPasswordLink.onclick = (e) => {
    e.preventDefault();
    toggleModal('reset');
  };

  window.toggleModal = function(type) {
    if (signInModal) signInModal.classList.add('hidden');
    if (signUpModal) signUpModal.classList.add('hidden');
    if (phoneModal) phoneModal.classList.add('hidden');
    if (resetPasswordModal) resetPasswordModal.classList.add('hidden');
    
    if (type === 'signin' && signInModal) signInModal.classList.remove('hidden');
    else if (type === 'signup' && signUpModal) signUpModal.classList.remove('hidden');
    else if (type === 'phone' && phoneModal) phoneModal.classList.remove('hidden');
    else if (type === 'reset' && resetPasswordModal) resetPasswordModal.classList.remove('hidden');
  };

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      if (signInModal) signInModal.classList.add('hidden');
      if (signUpModal) signUpModal.classList.add('hidden');
      if (phoneModal) phoneModal.classList.add('hidden');
      if (resetPasswordModal) resetPasswordModal.classList.add('hidden');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (signInModal) signInModal.classList.add('hidden');
      if (signUpModal) signUpModal.classList.add('hidden');
      if (phoneModal) phoneModal.classList.add('hidden');
      if (resetPasswordModal) resetPasswordModal.classList.add('hidden');
    }
  });

  document.querySelectorAll('.signIn-here').forEach(btn => {
    btn.addEventListener('click', () => toggleModal('signin'));
  });
  document.querySelectorAll('.signup-here').forEach(btn => {
    btn.addEventListener('click', () => toggleModal('signup'));
  });

  // === SIGN UP (Email/Password) - STEP 1 ===
  window.signUp = async function() {
    const email = document.getElementById('signup-email')?.value.trim();
    const password = document.getElementById('signup-password')?.value.trim();

    if (!email || !password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (password.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    const result = await signUpWithEmail(email, password);
    
    if (result.success) {
      showNotification('Account created! Please verify your email.', 'success');
      
      // Clear form
      document.getElementById('signup-email').value = '';
      document.getElementById('signup-password').value = '';
      
      // Close all modals
      toggleModal(null);
      
      // Redirect to verification page
      window.location.href = '/js/verify-email.html';
    } else {
      showNotification(result.error, 'error');
    }
  };

  // === SIGN IN (Email/Password) ===
  window.signIn = async function() {
    const email = document.getElementById('signin-email')?.value.trim();
    const password = document.getElementById('signin-password')?.value.trim();

    if (!email || !password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    const result = await signInWithEmail(email, password);
    
    if (result.success) {
      showNotification(`Welcome back!`, 'success');
      document.getElementById('signin-email').value = '';
      document.getElementById('signin-password').value = '';
      toggleModal(null);
    } else {
      if (result.needsVerification) {
        showNotification('Please verify your email before signing in', 'info');
        // Store email for verification page
        localStorage.setItem('pendingVerification', JSON.stringify({
          email: result.email
        }));
        toggleModal(null);
        window.location.href = '/js/verify-email.html';
      } else {
        showNotification(result.error, 'error');
      }
    }
  };

  // === SIGN IN WITH GOOGLE ===
  window.signInWithGoogle = async function() {
    const result = await signInWithGoogle();
    
    if (result.success) {
      showNotification(`Welcome, ${result.user.displayName}!`, 'success');
      toggleModal(null);
      userUtils.updateProfilePictures(result.user.photoURL || 'https://via.placeholder.com/32?text=U');
    } else {
      showNotification(result.error, 'error');
    }
  };

  // === PASSWORD RESET ===
  window.sendPasswordReset = async function() {
    const email = document.getElementById('reset-email')?.value.trim();
    
    if (!email) {
      showNotification('Please enter your email', 'error');
      return;
    }
    
    const result = await sendPasswordReset(email);
    
    if (result.success) {
      showNotification('Password reset email sent! Check your inbox.', 'success');
      toggleModal(null);
    } else {
      showNotification(result.error, 'error');
    }
  };

  // Phone authentication variables
  let phoneConfirmation = null;

  // === PHONE SIGN IN ===
  window.sendPhoneOTP = async function() {
    const phone = document.getElementById('phone-number')?.value.trim();
    
    if (!phone) {
      showNotification('Please enter your phone number', 'error');
      return;
    }

    // Format phone number (add + if not present)
    const formattedPhone = phone.startsWith('+') ? phone : '+' + phone;

    try {
      // Initialize recaptcha
      initializeRecaptcha();
      
      const result = await signInWithPhone(formattedPhone);
      
      if (result.success) {
        phoneConfirmation = result.confirmation;
        document.getElementById('phone-step-1').style.display = 'none';
        document.getElementById('phone-step-2').style.display = 'block';
        showNotification('OTP sent to your phone!', 'success');
      } else {
        showNotification(result.error, 'error');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  // === VERIFY PHONE OTP ===
  window.verifyPhoneOTPCode = async function() {
    const otp = document.getElementById('phone-otp')?.value.trim();
    
    if (!otp || !phoneConfirmation) {
      showNotification('Please enter the OTP', 'error');
      return;
    }

    const result = await verifyPhoneOTP(phoneConfirmation, otp);
    
    if (result.success) {
      showNotification('Phone verified successfully!', 'success');
      toggleModal(null);
      // Reset phone modal
      document.getElementById('phone-step-1').style.display = 'block';
      document.getElementById('phone-step-2').style.display = 'none';
      document.getElementById('phone-number').value = '';
      document.getElementById('phone-otp').value = '';
    } else {
      showNotification(result.error, 'error');
    }
  };

  // === GOOGLE LOGIN (compatibility with old code) ===
  window.handleGoogleLogin = async function(response) {
    await signInWithGoogle();
  };

  // === LOGOUT ===
  window.logout = async function() {
    const result = await signOutUser();
    if (result.success) {
      showNotification('Logged out successfully', 'info');
      updateLoginState();
      window.location.href = '/html/index.html';
    } else {
      showNotification(result.error, 'error');
    }
  };
  
  if (logoutBtn) logoutBtn.onclick = window.logout;

  // === LOGIN STATE ===
  window.updateLoginState = function() {
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
      
      const helloSection = document.getElementById('hello-section');
      if (helloSection) {
        helloSection.style.display = 'none';
        document.body.classList.add('signed-in');
      }
    } else {
      if (signBtn) signBtn.style.display = 'inline-block';
      if (joinBtn) joinBtn.style.display = 'inline-block';
      if (userAccountDiv) userAccountDiv.style.display = 'none';
      
      const helloSection = document.getElementById('hello-section');
      if (helloSection) {
        helloSection.style.display = 'block';
        document.body.classList.remove('signed-in');
      }
    }
    
    updateNotificationBadge();
    updateLearningCard();
  };

  updateLoginState();

  // === DARK MODE ===
  const toggleBtn = document.getElementById("toggle-theme");
  const toggleBtnDropdown = document.getElementById("toggle-theme-dropdown");

  function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  if (toggleBtn) toggleBtn.onclick = toggleDarkMode;
  if (toggleBtnDropdown) toggleBtnDropdown.onclick = toggleDarkMode;

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  // === IMAGE SLIDER ===
  const slider = document.querySelector('.slider');
  if (slider && slider.children.length > 0) {
    let currentIndex = 0;
    const totalSlides = slider.children.length;

    function autoSlide() {
      if (!slider) return;
      currentIndex = (currentIndex + 1) % totalSlides;
      slider.scrollTo({
        left: slider.clientWidth * currentIndex,
        behavior: 'smooth'
      });
    }
    setInterval(autoSlide, 4000);
  }

  // === USER DROPDOWN ===
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

  // === ACCOUNT SETTINGS ===
  window.toggleAccountSettings = function() {
    const modal = document.getElementById("account-settings");
    if (modal) {
      modal.classList.toggle("hidden");
      preloadUserSettings();
    }
  };

  function preloadUserSettings() {
    const email = localStorage.getItem("loggedInUser");
    if (!email) return;
    const stored = localStorage.getItem("user-" + email);
    if (!stored) return;

    try {
      const user = JSON.parse(stored);
      const nameInput = document.getElementById("update-name");
      const preview = document.getElementById("preview-image");
      
      if (nameInput) nameInput.value = user.name || "";
      if (preview) {
        preview.style.display = user.image ? "block" : "none";
        preview.src = user.image || "";
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  const updateImage = document.getElementById("update-image");
  if (updateImage) {
    updateImage.addEventListener("change", function() {
      const file = this.files[0];
      if (file && file.size > 200 * 1024) {
        showNotification("Please upload an image smaller than 200KB.", 'error');
        this.value = "";
        const preview = document.getElementById("preview-image");
        if (preview) preview.style.display = "none";
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        const preview = document.getElementById("preview-image");
        if (preview) {
          preview.src = e.target.result;
          preview.style.display = "block";
        }
      };
      reader.readAsDataURL(file);
    });
  }

  const accountForm = document.getElementById("account-settings-form");
  if (accountForm) {
    accountForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const email = localStorage.getItem("loggedInUser");
      if (!email) return;
      const stored = localStorage.getItem("user-" + email);
      if (!stored) return;
      
      try {
        const user = JSON.parse(stored);
        const newName = document.getElementById("update-name")?.value.trim();
        const oldPassword = document.getElementById("old-password")?.value.trim();
        const newPassword = document.getElementById("new-password")?.value;
        const confirmPassword = document.getElementById("confirm-password")?.value;

        if ((newPassword || confirmPassword) && (!oldPassword || oldPassword !== user.password)) {
          showNotification("Old password is required and must match.", 'error');
          return;
        }
        if (newPassword && newPassword !== confirmPassword) {
          showNotification("New passwords do not match.", 'error');
          return;
        }
        if (newName) user.name = newName;
        if (newPassword) user.password = newPassword;

        const newImage = document.getElementById("update-image")?.files[0];
        if (newImage) {
          const reader = new FileReader();
          reader.onload = e => {
            user.image = e.target.result;
            saveUserChanges(email, user);
          };
          reader.readAsDataURL(newImage);
        } else {
          saveUserChanges(email, user);
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    });
  }

  function saveUserChanges(email, user) {
    localStorage.setItem("user-" + email, JSON.stringify(user));
    showNotification("Account updated successfully", 'success');
    updateLoginState();
    toggleAccountSettings();
  }

  // === PASSWORD TOGGLE ===
  const icon = document.getElementById("icon");
  const passwrd = document.getElementById("signin-password");

  if (icon && passwrd) {
    icon.addEventListener('click', () => {
      if (passwrd.type === "password") {
        passwrd.type = "text";
        icon.src = "/Images/eye-open.png";
      } else {
        passwrd.type = "password";
        icon.src = "/Images/eye-close.png";
      }
    });
  }

  // === SCROLL SECTION FUNCTION ===
  window.scrollSection = function(direction) {
    const container = document.querySelector('.section');
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // === HELLO SECTION VISIBILITY ===
  function toggleHelloSection() {
    const helloSection = document.getElementById('hello-section');
    const userEmail = localStorage.getItem('loggedInUser');
    
    if (helloSection) {
      if (userEmail) {
        helloSection.style.display = 'none';
        document.body.classList.add('signed-in');
      } else {
        helloSection.style.display = 'block';
        document.body.classList.remove('signed-in');
      }
    }
  }

  toggleHelloSection();

  // === PROFESSIONAL COURSE BUTTONS ===
  const showBtns = document.querySelectorAll('.professional-course > button');
  showBtns.forEach(showBtn => {
    const icon = showBtn.querySelector('i');
    const showCourse = showBtn.nextElementSibling;

    if (showBtn && icon && showCourse) {
      showBtn.addEventListener('click', () => {
        if (showCourse.style.display === 'none' || showCourse.style.display === '') {
          showCourse.style.display = 'block';
          icon.classList.remove('bi-chevron-down');
          icon.classList.add('bi-chevron-up');
        } else {
          showCourse.style.display = 'none';
          icon.classList.remove('bi-chevron-up');
          icon.classList.add('bi-chevron-down');
        }
      });
    }
  });

  // === SMOOTH SCROLL ===
  document.documentElement.style.scrollBehavior = 'smooth';

  // === INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS ===
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section-wrapper, .trending-skills, .pro-why-us, .trusted-section, .edu-footer').forEach(el => {
    if (el) {
      el.classList.add('fade-in');
      observer.observe(el);
    }
  });

  document.querySelectorAll('.ank, .compact-card, .trust-pill').forEach((el, index) => {
    if (el) {
      el.style.transitionDelay = `${index * 0.05}s`;
      el.classList.add('fade-in');
      observer.observe(el);
    }
  });

  // === FUNCTION TO GET UNREAD MESSAGE COUNT FOR A COURSE ===
  function getUnreadMessageCount(courseId, userEmail) {
    const chatKey = `chat_${courseId}`;
    const chatHistory = JSON.parse(localStorage.getItem(chatKey)) || [];
    const userData = JSON.parse(localStorage.getItem('user-' + userEmail)) || { name: 'You' };
    return chatHistory.filter(m => m.name !== userData.name).length;
  }

  // === FUNCTION TO DELETE A COURSE FROM ENROLLMENT ===
  window.deleteCourse = function(courseId, event) {
    event.stopPropagation();
    
    const userEmail = localStorage.getItem('loggedInUser');
    if (!userEmail) return;
    
    if (!confirm('Are you sure you want to remove this course from your dashboard? This will not delete your progress, just remove it from view.')) {
      return;
    }
    
    const enrolledCourses = JSON.parse(localStorage.getItem(`enrolled_${userEmail}`)) || [];
    const updatedCourses = enrolledCourses.filter(c => c.courseId !== courseId);
    
    localStorage.setItem(`enrolled_${userEmail}`, JSON.stringify(updatedCourses));
    
    updateLearningCard();
    
    showNotification('Course removed from dashboard', 'info');
  };

  // === LEARNING CARD FUNCTIONALITY ===
  function updateLearningCard() {
    const learningCard = document.getElementById('learningCardBody');
    if (!learningCard) return;

    const userEmail = localStorage.getItem('loggedInUser');
    
    if (!userEmail) {
      learningCard.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <h2>Welcome to O-Learning Path!</h2>
          <p style="color: #666; margin: 15px 0;">Sign in to track your progress and continue learning</p>
          <button class="get-started-btn" onclick="toggleModal('signin')">Sign In to Start</button>
        </div>
      `;
      return;
    }

    const enrolledCourses = JSON.parse(localStorage.getItem(`enrolled_${userEmail}`)) || [];
    
    if (enrolledCourses.length === 0) {
      learningCard.innerHTML = `
        <div style="text-align: center;">
          <h2>Start Your Learning Journey!</h2>
          <p class="course-meta">You haven't started any courses yet</p>
          
          <div class="guided-project-box" style="flex-direction: column; text-align: left;">
            <div class="project-text">
              <h3>Recommended for you</h3>
              <p>Based on trending skills, we recommend starting with:</p>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
              <button class="get-started-btn" onclick="quickStart('html')">HTML Basics</button>
              <button class="get-started-btn" onclick="quickStart('css')">CSS Styling</button>
              <button class="get-started-btn" onclick="quickStart('js')">JavaScript</button>
            </div>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h4 style="margin-bottom: 10px;">📊 Quick Stats</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="text-align: center;">
                <div style="font-size: 24px; color: #007BFF;">${courses.length}+</div>
                <div style="font-size: 12px; color: #666;">Available Courses</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; color: #007BFF;">2K+</div>
                <div style="font-size: 12px; color: #666;">Active Learners</div>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Sort courses by last accessed (most recent first)
    const sortedCourses = [...enrolledCourses].sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
    const latestCourse = sortedCourses[0];
    const progress = latestCourse.progress || 0;
    const courseData = allCourses.find(c => c.id === latestCourse.courseId) || 
                       courses.find(c => c.id === latestCourse.courseId);

    // Get unread message counts for each course
    const courseMessageCounts = {};
    enrolledCourses.forEach(c => {
      courseMessageCounts[c.courseId] = getUnreadMessageCount(c.courseId, userEmail);
    });

    const totalUnread = Object.values(courseMessageCounts).reduce((a, b) => a + b, 0);

    learningCard.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0;">Continue Learning</h2>
          <div style="display: flex; gap: 10px; align-items: center;">
            ${totalUnread > 0 ? `
              <span style="background: #dc3545; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px;">
                <i class="bi bi-chat-dots"></i> ${totalUnread} new
              </span>
            ` : ''}
            <span style="background: #e3f2fd; color: #007BFF; padding: 5px 10px; border-radius: 20px; font-size: 12px;">
              <i class="bi bi-mortarboard"></i> ${enrolledCourses.length} Courses
            </span>
          </div>
        </div>

        <!-- Current Course Progress -->
        <div class="guided-project-box" style="background: linear-gradient(135deg, #f8f9fa, #ffffff);">
          <div style="display: flex; gap: 15px; align-items: center; width: 100%;">
            <div style="width: 60px; height: 60px; border-radius: 8px; overflow: hidden;">
              <img src="${courseData?.image || '/Images/default-course.jpg'}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0 0 5px 0; font-size: 16px;">${courseData?.head_1 || 'Course'}</h3>
                ${courseMessageCounts[latestCourse.courseId] > 0 ? `
                  <span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
                    ${courseMessageCounts[latestCourse.courseId]} new messages
                  </span>
                ` : ''}
              </div>
              <div style="display: flex; gap: 15px; align-items: center;">
                <div style="flex: 1;">
                  <div style="height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #007BFF, #00c6ff);"></div>
                  </div>
                </div>
                <span style="font-size: 14px; font-weight: 600; color: #007BFF;">${progress}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- All Enrolled Courses with Delete Option -->
        <div style="background: #f8f9fa; border-radius: 12px; padding: 15px;">
          <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">
            <i class="bi bi-bookmarks" style="color: #007BFF;"></i> Your Courses
          </h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${sortedCourses.map(c => {
              const cData = allCourses.find(crs => crs.id === c.courseId) || 
                           courses.find(crs => crs.id === c.courseId);
              const unreadCount = courseMessageCounts[c.courseId] || 0;
              return `
                <div class="course-item" style="display: flex; align-items: center; gap: 12px; padding: 10px; background: white; border-radius: 8px; border: 1px solid #e0e0e0; transition: all 0.2s ease; cursor: pointer;" onclick="quickStart('${c.courseId}')">
                  <div style="width: 50px; height: 50px; border-radius: 6px; overflow: hidden;">
                    <img src="${cData?.image || '/Images/default-course.jpg'}" style="width: 100%; height: 100%; object-fit: cover;">
                  </div>
                  <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                      <span style="font-weight: 600; font-size: 14px;">${cData?.head_1 || 'Course'}</span>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        ${unreadCount > 0 ? `
                          <span style="background: #dc3545; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px;">
                            ${unreadCount} new
                          </span>
                        ` : ''}
                        <span style="font-size: 12px; font-weight: 600; color: #007BFF;">${c.progress || 0}%</span>
                      </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div style="flex: 1; margin-right: 10px;">
                        <div style="height: 4px; background: #e0e0e0; border-radius: 2px; overflow: hidden;">
                          <div style="width: ${c.progress || 0}%; height: 100%; background: linear-gradient(90deg, #007BFF, #00c6ff);"></div>
                        </div>
                      </div>
                      <button class="delete-course-btn" onclick="deleteCourse('${c.courseId}', event)" style="background: none; border: none; color: #999; cursor: pointer; padding: 5px;" title="Remove from dashboard">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                      <i class="bi bi-clock"></i> Last accessed: ${formatTime(c.lastAccessed || c.enrolledDate)}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Quick Actions -->
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button class="get-started-btn" style="flex: 1;" onclick="quickStart('${latestCourse.courseId}')">
            <i class="bi bi-play-circle"></i> Continue Learning
          </button>
          <button class="get-started-btn" style="flex: 1; background: transparent; color: #007BFF; border: 2px solid #007BFF;" onclick="window.location.href='/html/explore.html'">
            <i class="bi bi-compass"></i> Explore More
          </button>
        </div>
      </div>
    `;
  }

  window.quickStart = function(courseId) {
    const userEmail = localStorage.getItem('loggedInUser');
    if (!userEmail) {
      toggleModal('signin');
      return;
    }

    const course = [...courses, ...trendingCourses, ...JustForYou].find(c => c.id === courseId);
    if (course) {
      handleCourseClick(course);
    }
  };

  window.shareProgress = function() {
    const userEmail = localStorage.getItem('loggedInUser');
    if (!userEmail) {
      showNotification('Please sign in to share your progress', 'info');
      return;
    }

    const enrolledCourses = JSON.parse(localStorage.getItem(`enrolled_${userEmail}`)) || [];
    const totalProgress = enrolledCourses.reduce((sum, c) => sum + (c.progress || 0), 0);
    const avgProgress = enrolledCourses.length > 0 ? Math.round(totalProgress / enrolledCourses.length) : 0;
    const totalUnread = enrolledCourses.reduce((sum, c) => sum + getUnreadMessageCount(c.courseId, userEmail), 0);

    const shareText = `I'm learning on O-Learning Path! 🚀\n` +
      `Courses: ${enrolledCourses.length}\n` +
      `Average Progress: ${avgProgress}%\n` +
      `Unread Messages: ${totalUnread}\n` +
      `Join me at O-Learning Path!`;

    if (navigator.share) {
      navigator.share({
        title: 'My Learning Progress',
        text: shareText,
        url: window.location.href
      }).catch(() => {
        copyToClipboard(shareText);
      });
    } else {
      copyToClipboard(shareText);
    }
  };

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Progress copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('Failed to copy', 'error');
    });
  }

  function trackCourseEnrollment(courseId) {
    const userEmail = localStorage.getItem('loggedInUser');
    if (!userEmail) return;

    const enrolledCourses = JSON.parse(localStorage.getItem(`enrolled_${userEmail}`)) || [];
    
    const existingIndex = enrolledCourses.findIndex(c => c.courseId === courseId);
    
    if (existingIndex >= 0) {
      enrolledCourses[existingIndex].lastAccessed = Date.now();
    } else {
      enrolledCourses.push({
        courseId: courseId,
        enrolledDate: Date.now(),
        lastAccessed: Date.now(),
        progress: 0
      });
    }

    localStorage.setItem(`enrolled_${userEmail}`, JSON.stringify(enrolledCourses));
  }

  updateLearningCard();

  setInterval(updateLearningCard, 5000);

  // Setup storage listener for cross-tab updates
  userUtils.setupStorageListener((updatedData) => {
    updateLoginState();
  });
});

// Add notification styles
const style = document.createElement('style');
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
  
  .notification.success {
    background: linear-gradient(135deg, #28a745, #20c997);
  }
  
  .notification.error {
    background: linear-gradient(135deg, #dc3545, #c82333);
  }
  
  .notification.info {
    background: linear-gradient(135deg, #007BFF, #0056b3);
  }
  
  .delete-course-btn {
    transition: all 0.2s ease;
  }
  
  .delete-course-btn:hover {
    color: #dc3545 !important;
    transform: scale(1.1);
  }
  
  .course-item:hover {
    border-color: #007BFF !important;
    box-shadow: 0 2px 8px rgba(0,123,255,0.1);
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);