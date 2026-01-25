/**
 * Formats a date to "DD MMM" format (e.g., "12 Jan").
 */
export const formatHeaderDate = (date: Date = new Date()): string => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return date.toLocaleDateString('en-GB', options);
};

/**
 * Returns a greeting based on the current time of day.
 */
export const getTimeBasedGreeting = (name: string): string => {
  const hour = new Date().getHours();
  if (hour < 12) return `Good Morning, ${name}`;
  if (hour < 18) return `Good Afternoon, ${name}`;
  return `Good Evening, ${name}`;
};
