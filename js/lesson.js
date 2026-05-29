import { courses, trendingCourses, JustForYou, courseLessons } from '../data/lessons.js';
import { notificationService } from './notificationService.js';
import { requireVerifiedUser } from './verify-check.js';
import { userUtils } from './user-utils.js';

// Wrap top-level await in an async IIFE
(async () => {
  try {
    const isVerified = await requireVerifiedUser();
    if (!isVerified) return;
  } catch (error) {
    console.error('Verification failed:', error);
    window.location.href = '/html/index.html';
    return;
  }

  // Initialize user data
  userUtils.initUserData();

  // Initialize notification service
  notificationService.setupStorageListener();

  const allCourses = [...courses, ...trendingCourses, ...JustForYou];
  let activeId = localStorage.getItem("activeCourseId") || "html"; 
  let currentCourseIdx = allCourses.findIndex(c => c.id === activeId);
  if (currentCourseIdx === -1) currentCourseIdx = 0; 
  
  // Get saved lesson index from enrolled courses
  const userEmail = localStorage.getItem('loggedInUser');
  let savedLessonIdx = 0;
  
  if (userEmail) {
    const enrolledCourses = JSON.parse(localStorage.getItem(`enrolled_${userEmail}`)) || [];
    const enrolledCourse = enrolledCourses.find(c => c.courseId === activeId);
    if (enrolledCourse && enrolledCourse.currentLesson !== undefined) {
      savedLessonIdx = enrolledCourse.currentLesson;
      console.log('Found saved lesson index:', savedLessonIdx);
    }
  }
  
  let currentLessonIdx = savedLessonIdx;
  let sidebarOpen = false;
  let activePanel = null;

  // Get current course and lessons
  const currentCourse = allCourses[currentCourseIdx];
  const lessons = courseLessons[currentCourse?.id] || [];

  console.log('Current Course:', currentCourse);
  console.log('Lessons:', lessons);
  console.log('Starting at lesson:', currentLessonIdx);

  // Notification Tracker
  let unreadCount = 0;

  // Elements - Initialize after DOM is ready
  let lessonSidebar, panelHeader, panelList, videoFrame, lessonTitleHeader, 
      lessonDescription, progressFill, progressText, lessonsTrigger, msgTrigger,
      msgletgrowTrigger, chatBox, userInput, sendBtn, msgBadge, notificationBell,
      notificationDropdown, notificationList, downloadBtn, nextLessonBtn, prevLessonBtn;

  // User Identity
  const userData = (() => {
    if (userEmail) {
      try {
        const data = localStorage.getItem('user-' + userEmail);
        return data ? JSON.parse(data) : { name: "Anonymous", image: "https://via.placeholder.com/32" };
      } catch (error) {
        console.error('Error parsing user data:', error);
        return { name: "Anonymous", image: "https://via.placeholder.com/32" };
      }
    }
    return { name: "Anonymous", image: "https://via.placeholder.com/32" };
  })();

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
    if (!notificationList || !userEmail) return;
    
    const notifications = notificationService.getUserNotifications(userEmail).slice(0, 5);
    
    if (notifications.length === 0) {
      notificationList.innerHTML = `
        <div class="notification-empty">
          <i class="bi bi-bell"></i>
          <p>No new notifications</p>
        </div>
      `;
      return;
    }
    
    notificationList.innerHTML = notifications.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
        <img src="${n.senderImage || 'https://via.placeholder.com/40'}" class="notification-avatar" onerror="this.src='https://via.placeholder.com/40'">
        <div class="notification-content">
          <div class="notification-title">${n.title}</div>
          <div class="notification-message">${n.message.substring(0, 50)}${n.message.length > 50 ? '...' : ''}</div>
          <div class="notification-time">${formatTime(n.timestamp)}</div>
        </div>
      </div>
    `).join('');
    
    notificationList.querySelectorAll('.notification-item').forEach(item => {
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

  // Add listener for real-time updates
  notificationService.addListener(updateNotificationBadge);

  // Update course progress
  function updateCourseProgress(courseId, lessonIndex, totalLessons) {
    const userEmail = localStorage.getItem('loggedInUser');
    if (!userEmail) return;

    const enrolledCourses = JSON.parse(localStorage.getItem(`enrolled_${userEmail}`)) || [];
    const courseIndex = enrolledCourses.findIndex(c => c.courseId === courseId);
    
    const progress = Math.round(((lessonIndex + 1) / totalLessons) * 100);
    
    if (courseIndex >= 0) {
      enrolledCourses[courseIndex].progress = progress;
      enrolledCourses[courseIndex].lastAccessed = Date.now();
      enrolledCourses[courseIndex].currentLesson = lessonIndex;
    } else {
      enrolledCourses.push({
        courseId: courseId,
        enrolledDate: Date.now(),
        lastAccessed: Date.now(),
        progress: progress,
        currentLesson: lessonIndex
      });
    }

    localStorage.setItem(`enrolled_${userEmail}`, JSON.stringify(enrolledCourses));
    console.log(`Progress updated for ${courseId}: lesson ${lessonIndex + 1}/${totalLessons} (${progress}%)`);
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: `enrolled_${userEmail}`,
      newValue: JSON.stringify(enrolledCourses)
    }));
  }

  /* ================= SIDEBAR TOGGLE ================= */

  function toggleSidebar(panelName) {
    if (!lessonSidebar) return;
    
    if (sidebarOpen && activePanel === panelName) {
      lessonSidebar.classList.remove('active');
      sidebarOpen = false;
      activePanel = null;
      updateActiveIcon(null);
      return;
    }

    lessonSidebar.classList.add('active');
    sidebarOpen = true;
    activePanel = panelName;

    if (panelName === 'lessons') openLessons();
    if (panelName === 'chat') openChat();
  }

  /* ================= COURSE LESSONS ================= */

  function openLessons() {
    if (!panelHeader || !panelList) return;
    
    const course = allCourses[currentCourseIdx];
    const lessons = courseLessons[course?.id] || [];
    
    panelHeader.innerText = `Lessons for ${course?.head_1 || 'Course'}`;
    panelList.innerHTML = '';

    if (!lessons || lessons.length === 0) {
      panelList.innerHTML = '<div class="no-lessons">No lessons available for this course</div>';
      return;
    }

    lessons.forEach((lesson, i) => {
      const item = document.createElement('div');
      item.className = `lesson-item ${i === currentLessonIdx ? 'active' : ''}`;
      item.innerHTML = `
        <h5>${i + 1}. ${lesson.title}</h5>
        <small>Duration: ${lesson.duration}</small>
      `;

      item.onclick = () => {
        loadLesson(currentCourseIdx, i);
        if (window.innerWidth <= 768) {
            toggleSidebar(null); 
        } else {
            openLessons(); 
        }
      };

      panelList.appendChild(item);
    });

    updateActiveIcon('lessonsTrigger');
  }

  /* ================= MESSAGE INSTRUCTOR (PRIVATE) ================= */

  function openChat() {
    if (!panelHeader || !panelList) return;
    
    panelHeader.innerText = 'Message Instructor';
    panelList.innerHTML = `
      <div class="chat-container">
        <div id="sidebarMsgBox" class="chat-messages-dynamic">
          <div class="msg-bubble msg-instructor">
            👩‍🏫 Instructor: ${currentCourse?.instructor || 'Judy Richardson'}<br>
            Hello! How can I help you with this lesson?
          </div>
        </div>
        <div class="chat-input-row">
          <input type="text" id="sidebarChatInput" placeholder="Write message...">
          <button id="sidebarSendBtn"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
    `;
    
    const sidebarSendBtn = document.getElementById('sidebarSendBtn');
    const sidebarInput = document.getElementById('sidebarChatInput');
    
    if (sidebarSendBtn && sidebarInput) {
      sidebarSendBtn.addEventListener('click', () => {
        const message = sidebarInput.value.trim();
        if (message) {
          showNotification('Message sent to instructor!', 'success');
          sidebarInput.value = '';
        }
      });
    }
    
    updateActiveIcon('msgTrigger');
  }

  /* ================= LET'S GROW (COMMUNITY CHAT) ================= */

  function renderMessage(data, isOwnMessage) {
      if (!chatBox) return;
      
      const row = document.createElement('div');
      row.className = `message-row ${isOwnMessage ? 'user-me' : 'other-user'}`;
      
      row.innerHTML = `
          <div class="avatar-container">
              <img src="${data.image}" class="profile-pic" alt="${data.name}" onerror="this.src='https://via.placeholder.com/32'">
          </div>
          <div class="msg-content">
              <small class="sender-name">${isOwnMessage ? 'You' : data.name}</small>
              <div class="msg-bubble">${data.text}</div>
          </div>
      `;
      chatBox.appendChild(row);
      chatBox.scrollTop = chatBox.scrollHeight;
  }

  function sendMessage() {
      if (!userEmail) {
          showNotification('Please sign in to send messages', 'error');
          return;
      }
      
      if (!userInput) {
          console.error('User input element not found');
          return;
      }
      
      const text = userInput.value.trim();
      if (!text) return;

      const messageData = {
          courseId: activeId,
          name: userData.name,
          image: userData.image || 'https://via.placeholder.com/32',
          text: text,
          time: Date.now()
      };

      const chatHistory = JSON.parse(localStorage.getItem(`chat_${activeId}`)) || [];
      chatHistory.push(messageData);
      localStorage.setItem(`chat_${activeId}`, JSON.stringify(chatHistory));

      renderMessage(messageData, true);

      const allUsers = getAllCourseUsers(activeId);
      allUsers.forEach(email => {
          if (email !== userEmail) {
              notificationService.addNotification(email, {
                  type: 'message',
                  title: `New message in ${getCourseName(activeId)}`,
                  message: `${userData.name}: ${text}`,
                  sender: userData.name,
                  senderImage: userData.image || 'https://via.placeholder.com/32',
                  courseId: activeId,
                  courseName: getCourseName(activeId),
                  threadId: `course_${activeId}_${Date.now()}`
              });
          }
      });

      userInput.value = '';
      showNotification('Message sent!', 'success');
      
      // Trigger update in index.html
      window.dispatchEvent(new StorageEvent('storage', {
          key: `chat_${activeId}`,
          newValue: JSON.stringify([...chatHistory, messageData])
      }));
  }

  // Helper functions
  function getAllCourseUsers(courseId) {
      const users = [];
      for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('progress-') && key.includes(courseId)) {
              const parts = key.split('-');
              if (parts.length >= 2) {
                  const email = parts[1];
                  if (email) users.push(email);
              }
          }
      }
      return [...new Set(users)];
  }

  function getCourseName(courseId) {
      const course = allCourses.find(c => c.id === courseId);
      return course ? course.head_1 : 'Course';
  }

  // Real-time Storage Listener
  window.addEventListener('storage', (e) => {
      if (e.key === `chat_${activeId}`) {
          try {
              const history = JSON.parse(e.newValue);
              if (history && history.length > 0) {
                  const lastMsg = history[history.length - 1];

                  if (lastMsg.name !== userData.name) {
                      const chatColumn = document.querySelector('.chat-column');
                      if (chatColumn && (chatColumn.style.display === 'none' || window.getComputedStyle(chatColumn).display === 'none')) {
                          unreadCount++;
                          updateMsgBadge();
                      }
                      renderMessage(lastMsg, false);
                  }
              }
          } catch (error) {
              console.error('Error parsing storage event:', error);
          }
      }
  });

  function updateMsgBadge() {
      if (!msgBadge) return;
      
      if (unreadCount > 0) {
          msgBadge.style.display = 'flex';
          msgBadge.innerText = unreadCount;
      } else {
          msgBadge.style.display = 'none';
      }
  }

  /* ================= VIDEO + PROGRESS ================= */

  function loadLesson(courseIdx, lessonIdx) {
    const course = allCourses[courseIdx]; 
    const lessons = courseLessons[course?.id] || []; 
    
    if (!lessons || !lessons[lessonIdx]) {
      console.error('Lesson not found:', course?.id, lessonIdx);
      showNotification('Lesson not found', 'error');
      return;
    }

    const lesson = lessons[lessonIdx];
    const previousLessonIdx = currentLessonIdx;
    currentCourseIdx = courseIdx;
    currentLessonIdx = lessonIdx;

    // Update video
    if (videoFrame) {
      videoFrame.src = lesson.video || '';
      console.log('Video src set to:', lesson.video);
    } else {
      console.error('Video frame element not found');
    }
    
    // Update title
    if (lessonTitleHeader) {
      lessonTitleHeader.innerText = lesson.title || 'Lesson';
    } else {
      console.error('Lesson title header not found');
    }
    
    // Update description
    if (lessonDescription) {
      lessonDescription.innerText = `Lesson ${lessonIdx + 1}: ${lesson.title}`;
    } else {
      console.error('Lesson description element not found');
    }
    
    // Update download button
    if (downloadBtn) {
      downloadBtn.href = lesson.download || "#";
    }

    // Update progress
    const percent = Math.round(((lessonIdx + 1) / lessons.length) * 100);
    if (progressFill) {
      progressFill.style.width = percent + '%';
    } else {
      console.error('Progress fill element not found');
    }
    if (progressText) {
      progressText.innerText = percent + '%';
    }
    
    // Update course progress in localStorage
    updateCourseProgress(course.id, lessonIdx, lessons.length);
    
    // Update lessons list
    openLessons();

    // Check if this is the last lesson and we just completed it
    if (lessonIdx === lessons.length - 1 && previousLessonIdx !== lessonIdx) {
      setTimeout(() => {
        showCourseCompletionMessage(course);
      }, 500);
    }
  }

  // Simple completion message
  function showCourseCompletionMessage(course) {
    const userEmail = localStorage.getItem('loggedInUser');
    if (!userEmail) return;
    
    // Add course to completed list
    const completedCourses = JSON.parse(localStorage.getItem(`completed_${userEmail}`)) || [];
    if (!completedCourses.includes(course.id)) {
      completedCourses.push(course.id);
      localStorage.setItem(`completed_${userEmail}`, JSON.stringify(completedCourses));
    }
    
    // Show success message
    showNotification(`🎉 Congratulations! You've completed ${course.head_1}!`, 'success');
    
    // Create a simple completion modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 400px; text-align: center;">
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        <i class="bi bi-trophy" style="font-size: 60px; color: #FFD700; margin: 20px 0;"></i>
        <h2>Congratulations!</h2>
        <p style="margin: 20px 0;">You've successfully completed</p>
        <h3 style="color: #007BFF; margin-bottom: 20px;">${course.head_1}</h3>
        <button class="sign-button" onclick="this.closest('.modal').remove()">Continue Learning</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Quick start for related courses
  window.quickStart = function(courseId) {
    const course = allCourses.find(c => c.id === courseId);
    if (course) {
      localStorage.setItem("selectedCourse", JSON.stringify(course));
      localStorage.setItem("activeCourseId", course.id || 'html');
      window.location.href = "/course/course.html";
    }
  };

  /* ================= ACTIVE ICON ================= */

  function updateActiveIcon(activeId) {
    document.querySelectorAll('.nav-icon').forEach(icon =>
      icon.classList.remove('active')
    );
    if (activeId) {
      const element = document.getElementById(activeId);
      if (element) element.classList.add('active');
    }
  }

  // Setup notification dropdown after DOM is ready
  function setupNotificationDropdown() {
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
  }

  /* ================= INITIALIZATION ================= */

  // Wait for DOM to be fully loaded
  function initializePage() {
    console.log('Initializing lesson page...');
    console.log('Starting with saved lesson index:', currentLessonIdx);
    
    // Initialize all DOM elements
    lessonSidebar = document.getElementById('lessonSidebar');
    panelHeader = lessonSidebar ? lessonSidebar.querySelector('.panel-header') : null;
    panelList = document.getElementById('lessonList');

    videoFrame = document.getElementById('mainVideo');
    lessonTitleHeader = document.getElementById('current-lesson-title');
    lessonDescription = document.getElementById('lessonDesc');
    progressFill = document.getElementById('progress-fill');
    progressText = document.getElementById('progress-text');
    downloadBtn = document.getElementById('downloadBtn');
    nextLessonBtn = document.getElementById('nextLessonBtn');
    prevLessonBtn = document.getElementById('prevLessonBtn');

    lessonsTrigger = document.getElementById('lessonsTrigger');
    msgTrigger = document.getElementById('msgTrigger');
    msgletgrowTrigger = document.getElementById('msgletgrowTrigger');

    // Chat Elements
    chatBox = document.getElementById('chatBox');
    userInput = document.getElementById('userInput');
    sendBtn = document.getElementById('sendBtn');
    msgBadge = document.getElementById('msgBadge');

    // Notification Elements
    notificationBell = document.getElementById('notificationBell');
    notificationDropdown = document.getElementById('notificationDropdown');
    notificationList = document.getElementById('notificationList');

    console.log('User Email:', userEmail);
    console.log('Active Course ID:', activeId);
    console.log('Current Course:', currentCourse);
    console.log('Lessons Available:', lessons);
    console.log('Video Frame:', videoFrame);
    console.log('Lesson Title Header:', lessonTitleHeader);
    console.log('Lesson Description:', lessonDescription);

    if (!userEmail) {
        console.log('No user email, redirecting to home');
        window.location.href = '/html/index.html';
        return;
    }
    
    if (!currentCourse) {
      console.error('Course not found:', activeId);
      showNotification('Course not found', 'error');
      setTimeout(() => {
        window.location.href = '/html/index.html';
      }, 2000);
      return;
    }
    
    // Setup notification dropdown
    setupNotificationDropdown();
    
    // Initialize the page
    updateNotificationBadge();
    
    // Load the saved lesson or first lesson if no progress
    if (lessons && lessons.length > 0) {
      // Ensure currentLessonIdx is within bounds
      if (currentLessonIdx >= lessons.length) {
        currentLessonIdx = lessons.length - 1;
      }
      if (currentLessonIdx < 0) {
        currentLessonIdx = 0;
      }
      
      console.log('Loading lesson at index:', currentLessonIdx);
      loadLesson(currentCourseIdx, currentLessonIdx);
    } else {
      console.error('No lessons available for course:', activeId);
      showNotification('No lessons available for this course', 'error');
    }

    // Add event listeners
    if (lessonsTrigger) {
        lessonsTrigger.addEventListener('click', () => toggleSidebar('lessons'));
    }
    
    if (msgTrigger) {
        msgTrigger.addEventListener('click', () => toggleSidebar('chat'));
    }
    
    if (msgletgrowTrigger) {
        msgletgrowTrigger.addEventListener('click', () => {
            unreadCount = 0;
            updateMsgBadge();
        });
    }
    
    if (nextLessonBtn) {
        nextLessonBtn.addEventListener('click', () => {
            const course = allCourses[currentCourseIdx];
            const lessons = courseLessons[course?.id] || [];
            if (lessons && currentLessonIdx < lessons.length - 1) {
                loadLesson(currentCourseIdx, currentLessonIdx + 1);
            } else {
              showNotification('This is the last lesson', 'info');
            }
        });
    }
    
    if (prevLessonBtn) {
        prevLessonBtn.addEventListener('click', () => {
            if (currentLessonIdx > 0) {
                loadLesson(currentCourseIdx, currentLessonIdx - 1);
            } else {
              showNotification('This is the first lesson', 'info');
            }
        });
    }

    const mobileVideoBtn = document.getElementById('mobileVideoBtn');
    const mobileChatBtn = document.getElementById('mobileChatBtn');
    const videoColumn = document.querySelector('.video-column');
    const chatColumn = document.querySelector('.chat-column');

    function setActiveTab(tab) {
        if (!videoColumn || !chatColumn) return;
        
        if (tab === 'video') {
            videoColumn.style.display = "block";
            chatColumn.style.display = "none";
            if (mobileVideoBtn) mobileVideoBtn.classList.add('active');
            if (mobileChatBtn) mobileChatBtn.classList.remove('active');
        } else {
            videoColumn.style.display = "none";
            chatColumn.style.display = "flex";
            if (mobileChatBtn) mobileChatBtn.classList.add('active');
            if (mobileVideoBtn) mobileVideoBtn.classList.remove('active');
            unreadCount = 0;
            updateMsgBadge();
        }
        if (lessonSidebar) lessonSidebar.classList.remove('active');
    }

    if (mobileVideoBtn && mobileChatBtn) {
        mobileVideoBtn.addEventListener('click', () => setActiveTab('video'));
        mobileChatBtn.addEventListener('click', () => setActiveTab('chat'));
        if (window.innerWidth <= 768) setActiveTab('video');
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    if (userInput) {
        userInput.addEventListener('keypress', (e) => { 
            if(e.key === 'Enter') {
                e.preventDefault();
                sendMessage(); 
            }
        });
    }
    
    try {
        const history = JSON.parse(localStorage.getItem(`chat_${activeId}`)) || [];
        history.forEach(m => renderMessage(m, m.name === userData.name));
    } catch (error) {
        console.error('Error loading chat history:', error);
    }

    // Logout
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('selectedCourse');
            localStorage.removeItem('activeCourseId');
            window.location.href = '/html/index.html';
        });
    }

    // Dark mode toggle
    const toggleThemeDropdown = document.getElementById('toggle-theme-dropdown');
    if (toggleThemeDropdown) {
        toggleThemeDropdown.addEventListener('click', (e) => {
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
    const userPic = document.getElementById('user-pic');
    const userDropPic = document.getElementById('user-drop-pic');
    const dropdownUsername = document.getElementById('dropdown-username');
    const dropdownEmail = document.getElementById('dropdown-email');

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

    if (userEmail) {
        try {
          const userData = userUtils.getUserData();
          if (userData) {
            userUtils.updateProfilePictures(userData.image);
            if (dropdownUsername) dropdownUsername.textContent = userData.name || 'User';
            if (dropdownEmail) dropdownEmail.textContent = userEmail;
          }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }

    // Make modal functions globally available
    window.toggleModal = function(type) {
        const signInModal = document.getElementById('signin-modal');
        const signUpModal = document.getElementById('signup-modal');
        if (signInModal) signInModal.classList.add('hidden');
        if (signUpModal) signUpModal.classList.add('hidden');
        if (type === 'signin' && signInModal) signInModal.classList.remove('hidden');
        else if (type === 'signup' && signUpModal) signUpModal.classList.remove('hidden');
    };

    window.toggleAccountSettings = function() {
        const modal = document.getElementById("account-settings");
        if (modal) modal.classList.toggle("hidden");
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
        location.reload();
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
            toggleModal(null);
            toggleModal('signin');
        };
        reader.readAsDataURL(file);
    };

    window.signInWithGoogle = async function() {
        try {
            const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
            const { initializeApp } = await import('firebase/app');
            
            const firebaseConfig = {
                apiKey: "AIzaSyBkNiAwnoUeY6dZgWq3vQzXQ8Q8Q8Q8Q8Q",
                authDomain: "your-auth-domain.firebaseapp.com",
                projectId: "your-project-id",
                storageBucket: "your-storage-bucket.appspot.com",
                messagingSenderId: "your-sender-id",
                appId: "your-app-id"
            };
            
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const provider = new GoogleAuthProvider();
            
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const userData = {
                name: user.displayName,
                email: user.email,
                image: user.photoURL,
                password: '',
                google: true
            };
            
            localStorage.setItem('user-' + user.email, JSON.stringify(userData));
            localStorage.setItem('loggedInUser', user.email);
            showNotification(`Welcome, ${user.displayName}!`, 'success');
            location.reload();
        } catch (error) {
            console.error('Google sign in error:', error);
            showNotification('Failed to sign in with Google', 'error');
        }
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
  } else {
    initializePage();
  }
})();

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

// Export functions
window.loadLesson = loadLesson;
window.sendMessage = sendMessage;
