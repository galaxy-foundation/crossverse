import numeral from 'numeral'
import { APP_NAME } from '@/config'

/**
 * format number
 * @param num
 */
export function toNumeral(num?: number | string): string {
  return numeral(num).format('0,0.00')
}

/**
 * fixed number
 * @param num
 */
export function toFixed(num?: number | string): string {
  return numeral(num).format('0.00')
}

/**
 * to thousands
 * @param num
 */
export function toThousands(num?: number | string): string {
  return numeral(num).format('0.0a')
}

/**
 * getPageName
 * @param title
 */
export function getPageName(title?: string): string {
  if (title) {
    return `${title} - ${APP_NAME}`
  }

  return APP_NAME
}

/**
 * getAuthorName like @xxx
 * @param str
 */
export function getAuthorName(str?: string): string {
  return `@${str}`
}
