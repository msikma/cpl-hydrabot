// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

/** Time values used to generate relative dates. */
const timeDivisions = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' }
]

/**
 * Returns a date string for making daily backups.
 * 
 * E.g. "20210420".
 */
const getDateForDailyBackup = (dateObj = new Date()) => {
  const [date] = getDateSegments(dateObj)
  return date.join('')
}

/**
 * Returns a date string for making hourly backups.
 * 
 * E.g. "20210420_14" for 2 o'clock.
 */
const getDateForHourlyBackup = (dateObj = new Date()) => {
  const [date, time] = getDateSegments(dateObj)
  return [date.join(''), time[0]].join('_')
}

/**
 * Returns a date as two arrays of date and time string values.
 * 
 * E.g. [['2021', '04', '20'], ['14', '30', '57']].
 */
const getDateSegments = (dateObj = new Date()) => {
  const [date, time] = dateObj.toISOString().split('T')
  const dateArr = date.split('-')
  const timeArr = time.slice(0, 8).split(':')
  return [dateArr, timeArr]
}

/**
 * Returns a simple date for the console logger.
 * 
 * E.g. "15:14:46Z".
 */
const getDateForLogger = (dateObj = new Date()) => {
  const [_, time] = getDateSegments(dateObj)
  return `${[time.join(':')].join(' ')}Z`
}

/**
 * Returns a formatted string representing a date.
 */
const getFormattedDate = (dateObj = new Date()) => {
  // TODO: use a proper formatter
  return dateObj.toUTCString()
}

/**
 * Returns a relative time string.
 */
const getRelativeTime = (tsA, tsB = new Date(), isDuration = false, formatter = new Intl.RelativeTimeFormat('en-US', {numeric: 'auto'})) => {
  let seconds = (tsA - tsB) / 1000
  for (const division of timeDivisions) {
    if (Math.abs(seconds) < division.amount) {
      const result = formatter.format(Math.round(seconds), division.name)
      if (isDuration) {
        // TODO: this isn't locale safe.
        return result.replace(/ago$/, '').trim()
      }
      return result
    }
    seconds /= division.amount
  }
  return null
}

module.exports = {
  getDateForLogger,
  getDateForDailyBackup,
  getDateForHourlyBackup,
  getDateSegments,
  getFormattedDate,
  getRelativeTime
}
