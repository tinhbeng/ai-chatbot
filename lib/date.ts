import { addMinutes, format, formatDistanceToNowStrict } from 'date-fns';
import { isNumber } from './number';

/**
 * Retrieves the name of the local timezone.
 * @returns The name of the local timezone.
 */
export const getLocalTimezoneName = () => {
  let timeZoneName = '';
  const dateLocal = new Date();

  try {
    timeZoneName = dateLocal.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];
  } catch (error) {
    console.error(error);
  }

  return timeZoneName;
};

export const timeFormatLocal = (
  timestamp: number | undefined,
  pattern = 'MMMM dd, yyyy HH:mm:ss',
) => {
  if (!timestamp || isNaN(+timestamp)) {
    return '';
  }

  const dateLocal = new Date(timestamp * 1000);
  return format(dateLocal, pattern);
};

// Formats a Unix timestamp to local time.
export const formatTime = (unixTimestamp: number | undefined, pattern = 'MM/dd/yyyy HH:mm') => {
  if (!unixTimestamp || !isNumber(unixTimestamp)) {
    return '';
  }

  return format(unixTimestamp * 1000, pattern);
};

/**
 * Formats a Unix timestamp to UTC time.
 * @param unixTimestamp - The Unix timestamp to format.
 * @param pattern - The pattern to format the timestamp. Defaults to "MMMM dd, yyyy HH:mm:ss a '+UTC'".
 * @returns The formatted UTC time.
 */
export const formatTimeToUtc = (
  unixTimestamp: number | undefined,
  pattern = "MM/dd/yyyy HH:mm:ss a '+UTC'",
) => {
  if (!unixTimestamp || !isNumber(unixTimestamp)) {
    return '';
  }

  const dateLocal = new Date(unixTimestamp * 1000);
  return format(addMinutes(dateLocal, dateLocal.getTimezoneOffset()), pattern);
};

/**
 * Formats the time distance between a timestamp and the current time.
 * @param timestamp - The timestamp to calculate the distance from.
 * @returns The formatted time distance.
 */
export const formatTimeDistance = (timestamp: number | undefined, addSuffix = true) => {
  if (!timestamp) {
    return;
  }

  const timeDistance = formatDistanceToNowStrict(timestamp * 1000, {
    addSuffix,
  });

  return timeDistance
    .replace(/ second(s)?/, 's')
    .replace(/ minute(s)?/, 'm')
    .replace(/ hour(s)?/, 'h')
    .replace(/ day(s)?/, 'd')
    .replace(/ month(s)?/, 'mo')
    .replace(/ year(s)?/, 'y');
};
