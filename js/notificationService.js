// Notification Service for O-Learning Path
export const notificationService = {
  // Get all notifications for a user
  getUserNotifications(userEmail) {
    const key = `notifications_${userEmail}`;
    const notifications = localStorage.getItem(key);
    return notifications ? JSON.parse(notifications) : [];
  },

  // Add a notification
  addNotification(userEmail, notification) {
    const key = `notifications_${userEmail}`;
    const notifications = this.getUserNotifications(userEmail);
    
    const newNotification = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
      ...notification
    };
    
    notifications.unshift(newNotification);
    localStorage.setItem(key, JSON.stringify(notifications));
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: key,
      newValue: JSON.stringify(notifications)
    }));
    
    return newNotification;
  },

  // Mark notification as read
  markAsRead(userEmail, notificationId) {
    const key = `notifications_${userEmail}`;
    const notifications = this.getUserNotifications(userEmail);
    const index = notifications.findIndex(n => n.id === notificationId);
    
    if (index !== -1) {
      notifications[index].read = true;
      localStorage.setItem(key, JSON.stringify(notifications));
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: key,
        newValue: JSON.stringify(notifications)
      }));
    }
  },

  // Mark all notifications as read
  markAllAsRead(userEmail) {
    const key = `notifications_${userEmail}`;
    const notifications = this.getUserNotifications(userEmail);
    
    notifications.forEach(n => n.read = true);
    localStorage.setItem(key, JSON.stringify(notifications));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: key,
      newValue: JSON.stringify(notifications)
    }));
  },

  // Get unread count
  getUnreadCount(userEmail) {
    const notifications = this.getUserNotifications(userEmail);
    return notifications.filter(n => !n.read).length;
  },

  // Add a course reminder notification
  addCourseReminder(userEmail, courseName, daysLeft) {
    this.addNotification(userEmail, {
      type: 'course',
      title: 'Course Reminder',
      message: `You have ${daysLeft} days left to complete "${courseName}". Keep going!`,
      icon: 'bi-book'
    });
  },

  // Add a message notification
  addMessageNotification(userEmail, senderName, message) {
    this.addNotification(userEmail, {
      type: 'message',
      title: `New message from ${senderName}`,
      message: message.substring(0, 100),
      icon: 'bi-chat'
    });
  },

  // Add a system alert
  addSystemAlert(userEmail, title, message) {
    this.addNotification(userEmail, {
      type: 'system',
      title: title,
      message: message,
      icon: 'bi-gear'
    });
  },

  // Setup storage listener for real-time updates
  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('notifications_')) {
        // Trigger custom event for components to listen to
        window.dispatchEvent(new CustomEvent('notifications-updated', {
          detail: { userEmail: e.key.replace('notifications_', '') }
        }));
      }
    });
  },

  // Add event listener for notifications updates
  addListener(callback) {
    window.addEventListener('notifications-updated', callback);
  }
};