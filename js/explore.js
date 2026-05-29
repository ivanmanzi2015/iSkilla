import { courses, trendingCourses, JustForYou } from '../data/lessons.js';
import { notificationService } from './notificationService.js';
import { requireVerifiedUser } from './verify-check.js';
import { userUtils } from './user-utils.js';

document.addEventListener("DOMContentLoaded", async () => {

  const isVerified = await requireVerifiedUser();
  if (!isVerified) return; // Will redirect automatically

  // Initialize notification service
  notificationService.setupStorageListener();
  
  // Initialize user data
  userUtils.initUserData();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');

  // Combine all courses into one array with proper categories
  const allCourses = [
    ...courses.map(c => ({ ...c, category: getCategoryFromId(c.id) })),
    ...trendingCourses.map(c => ({ ...c, category: c.skill ? getCategoryFromSkill(c.skill) : 'web' })),
    ...JustForYou.map(c => ({ ...c, category: getCategoryFromTitle(c.head_1) }))
  ];

  const uniqueCourses = allCourses.filter((course, index, self) =>
    index === self.findIndex(c => c.id === course.id || c.head_1 === course.head_1)
  );

  function getCategoryFromId(id) {
    const categoryMap = {
      'html': 'web', 'css': 'web', 'js': 'web', 'python': 'python',
      'django': 'web', 'react': 'web', 'node': 'web', 'html5': 'web',
      'css3': 'web', 'google-data': 'data', 'google-ai': 'ai',
      'seo': 'web', 'prompt': 'ai', 'html-quick': 'web',
      'css-layouts': 'web', 'js-syntax': 'web'
    };
    return categoryMap[id] || 'web';
  }

  function getCategoryFromSkill(skill) {
    const skillMap = {
      'Web Development': 'web', 'Machine Learning': 'ml',
      'Python Programming': 'python', 'Artificial Intelligence': 'ai',
      'UI / UX Design': 'uiux', 'Data Science': 'data',
      'Cloud Computing': 'cloud', 'Cyber Security': 'security',
      'Mobile App Development': 'mobile', 'Game Development': 'game',
      'DevOps': 'devops', 'Blockchain': 'blockchain'
    };
    return skillMap[skill] || 'web';
  }

  function getCategoryFromTitle(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('python')) return 'python';
    if (titleLower.includes('ai') || titleLower.includes('intelligence')) return 'ai';
    if (titleLower.includes('data')) return 'data';
    if (titleLower.includes('cloud')) return 'cloud';
    if (titleLower.includes('security')) return 'security';
    if (titleLower.includes('mobile')) return 'mobile';
    if (titleLower.includes('game')) return 'game';
    if (titleLower.includes('devops')) return 'devops';
    if (titleLower.includes('blockchain')) return 'blockchain';
    if (titleLower.includes('ml') || titleLower.includes('machine')) return 'ml';
    if (titleLower.includes('ui') || titleLower.includes('ux')) return 'uiux';
    return 'web';
  }

  let currentCategory = categoryParam || 'all';
  let currentSort = 'newest';
  let displayedCourses = 12;
  let filteredCourses = [];

  const coursesGrid = document.getElementById('coursesGrid');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const categoryBtns = document.querySelectorAll('.category-btn');
  const sortBtns = document.querySelectorAll('.sort-btn');
  const searchInput = document.getElementById('explore-search');

  // Update active category button based on URL param
  if (categoryParam) {
    categoryBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.category === categoryParam) {
        btn.classList.add('active');
      }
    });
  }

  filterAndRenderCourses();

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      displayedCourses = 12;
      filterAndRenderCourses();
    });
  });

  sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sortBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      filterAndRenderCourses();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      displayedCourses = 12;
      filterAndRenderCourses(searchInput.value.trim());
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      displayedCourses += 8;
      renderCourses();
    });
  }

  function filterAndRenderCourses(searchTerm = '') {
    filteredCourses = currentCategory === 'all' 
      ? [...uniqueCourses]
      : uniqueCourses.filter(c => c.category === currentCategory);

    if (searchTerm) {
      filteredCourses = filteredCourses.filter(c => 
        c.head_1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.paragraph?.difn || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    sortCourses();
    renderCourses();
  }

  function sortCourses() {
    switch(currentSort) {
      case 'popular':
        filteredCourses.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case 'duration':
        filteredCourses.sort((a, b) => (a.duration || '').localeCompare(b.duration || ''));
        break;
      default:
        filteredCourses.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        break;
    }
  }

  function renderCourses() {
    if (!coursesGrid) return;

    const visibleCourses = filteredCourses.slice(0, displayedCourses);

    if (visibleCourses.length === 0) {
      coursesGrid.innerHTML = `
        <div class="no-results">
          <i class="bi bi-search"></i>
          <h3>No courses found</h3>
          <p>Try adjusting your filters or search term</p>
        </div>
      `;
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    coursesGrid.innerHTML = visibleCourses.map(course => `
      <div class="course-card" data-course-id="${course.id || course.head_1}">
        <div class="course-image">
          <img src="${course.image || '/Images/default-course.jpg'}" alt="${course.head_1}" onerror="this.src='https://via.placeholder.com/300x180?text=Course'">
          <span class="course-badge">${getBadgeText(course)}</span>
        </div>
        <div class="course-info">
          <h3>${course.head_1}</h3>
          <p class="course-description">${course.paragraph?.difn || 'Learn the fundamentals and advance your skills'}</p>
          <div class="course-meta">
            <span class="course-level">${course.paragraph?.span || 'Beginner'}</span>
            <span class="course-duration"><i class="bi bi-clock"></i> 12h</span>
          </div>
          <div class="course-footer">
            <div class="course-instructor">
              <img src="${course.instructor_img || 'https://via.placeholder.com/30'}" alt="${course.instructor || 'Instructor'}">
              <span>${course.instructor || 'Expert Instructor'}</span>
            </div>
            <span class="course-price">Free</span>
          </div>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.course-card').forEach(card => {
      card.addEventListener('click', () => {
        const courseId = card.dataset.courseId;
        const course = uniqueCourses.find(c => c.id === courseId || c.head_1 === courseId);
        if (course) {
          handleCourseClick(course);
        }
      });
    });

    if (loadMoreBtn) {
      loadMoreBtn.style.display = filteredCourses.length > displayedCourses ? 'block' : 'none';
    }
  }

  function getBadgeText(course) {
    if (course.duration === '2 hours or less') return 'Quick Course';
    if (course.duration === '1-6 Months') return 'Professional';
    return 'Popular';
  }

  function handleCourseClick(course) {
    const userEmail = localStorage.getItem("loggedInUser");
    
    if (!userEmail) {
      showNotification("Please sign in to access this course", "info");
      toggleModal('signin');
      return;
    }
    
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    localStorage.setItem("activeCourseId", course.id || 'html');
    window.location.href = "/course/course.html";
  }

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

  // === MODAL TOGGLES ===
  const signInModal = document.getElementById('signin-modal');
  const signUpModal = document.getElementById('signup-modal');
  const logoutBtn = document.getElementById('logout');

  const signBtn = document.querySelector('.sign');
  const joinBtn = document.querySelector('.join');

  if (signBtn) signBtn.onclick = () => toggleModal('signin');
  if (joinBtn) joinBtn.onclick = () => toggleModal('signup');

  window.toggleModal = function(type) {
    if (signInModal) signInModal.classList.add('hidden');
    if (signUpModal) signUpModal.classList.add('hidden');
    if (type === 'signin' && signInModal) signInModal.classList.remove('hidden');
    else if (type === 'signup' && signUpModal) signUpModal.classList.remove('hidden');
  };

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      if (signInModal) signInModal.classList.add('hidden');
      if (signUpModal) signUpModal.classList.add('hidden');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (signInModal) signInModal.classList.add('hidden');
      if (signUpModal) signUpModal.classList.add('hidden');
    }
  });

  document.querySelectorAll('.signIn-here').forEach(btn => {
    btn.addEventListener('click', () => toggleModal('signin'));
  });
  document.querySelectorAll('.signup-here').forEach(btn => {
    btn.addEventListener('click', () => toggleModal('signup'));
  });

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

  window.logout = function() {
    localStorage.removeItem('loggedInUser');
    updateLoginState();
    showNotification('Logged out successfully', 'info');
  };
  
  if (logoutBtn) logoutBtn.onclick = window.logout;

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
    } else {
      if (signBtn) signBtn.style.display = 'inline-block';
      if (joinBtn) joinBtn.style.display = 'inline-block';
      if (userAccountDiv) userAccountDiv.style.display = 'none';
    }
  };

  updateLoginState();

  const toggleBtn = document.getElementById("toggle-theme");
  const toggleBtnDropdown = document.getElementById("toggle-theme-dropdown");

  function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  }

  if (toggleBtn) toggleBtn.onclick = toggleDarkMode;
  if (toggleBtnDropdown) toggleBtnDropdown.onclick = toggleDarkMode;

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  const userAccountDiv = document.querySelector('.user-account');
  const userDropdown = document.querySelector('.user-dropdown');

  if (userAccountDiv && userDropdown) {
    userAccountDiv.addEventListener('click', e => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => userDropdown.classList.add('hidden'));
  }

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
      document.getElementById("update-name").value = user.name || "";
      const preview = document.getElementById("preview-image");
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
});

if (!document.querySelector('#notification-style')) {
  const style = document.createElement('style');
  style.id = 'notification-style';
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
}