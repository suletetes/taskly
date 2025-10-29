// Date utility functions for the application

export const formatDate = (date, format = 'medium') => {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return 'Invalid Date';
  }

  const options = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' }
  };

  return date.toLocaleDateString('en-US', options[format] || options.medium);
};

export const formatRelativeTime = (date) => {
  if (!date || !(date instanceof Date)) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (Math.abs(diffInSeconds) < 60) {
    return 'just now';
  } else if (Math.abs(diffInMinutes) < 60) {
    return diffInMinutes > 0 
      ? `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
      : `in ${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) !== 1 ? 's' : ''}`;
  } else if (Math.abs(diffInHours) < 24) {
    return diffInHours > 0
      ? `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
      : `in ${Math.abs(diffInHours)} hour${Math.abs(diffInHours) !== 1 ? 's' : ''}`;
  } else {
    return diffInDays > 0
      ? `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
      : `in ${Math.abs(diffInDays)} day${Math.abs(diffInDays) !== 1 ? 's' : ''}`;
  }
};

export const isOverdue = (date) => {
  if (!date || !(date instanceof Date)) {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return compareDate < today;
};

export const getDaysUntilDue = (date) => {
  if (!date || !(date instanceof Date)) {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffInTime = dueDate - today;
  return Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
};

export const isToday = (date) => {
  if (!date || !(date instanceof Date)) {
    return false;
  }

  const now = new Date();
  return date.getDate() === now.getDate() &&
         date.getMonth() === now.getMonth() &&
         date.getFullYear() === now.getFullYear();
};

export const isTomorrow = (date) => {
  if (!date || !(date instanceof Date)) {
    return false;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return date.getDate() === tomorrow.getDate() &&
         date.getMonth() === tomorrow.getMonth() &&
         date.getFullYear() === tomorrow.getFullYear();
};

export const isThisWeek = (date) => {
  if (!date || !(date instanceof Date)) {
    return false;
  }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return date >= weekStart && date <= weekEnd;
};

export const getWeekRange = (date, startOfWeek = 1) => {
  // startOfWeek: 0 = Sunday, 1 = Monday
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : startOfWeek);

  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};