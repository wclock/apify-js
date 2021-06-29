/* eslint-disable no-continue */
import * as _ from 'underscore';
import * as cheerio from 'cheerio';
import log from './utils_log';
import { publicUtils } from './utils';

// TODO: We could support URLs like https://www.linkedin.com/company/some-company-inc

// Regex inspired by https://zapier.com/blog/extract-links-email-phone-regex/
// eslint-disable-next-line max-len
const EMAIL_REGEX_STRING = '(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])';

/**
 * Regular expression to exactly match a single email address.
 * It has the following form: `/^...$/i`.
 * @type {RegExp}
 * @memberOf social
 */
const EMAIL_REGEX = new RegExp(`^${EMAIL_REGEX_STRING}$`, 'i');

/**
 * Regular expression to find multiple email addresses in a text.
 * It has the following form: `/.../ig`.
 * @type {RegExp}
 * @memberOf social
 */
const EMAIL_REGEX_GLOBAL = new RegExp(EMAIL_REGEX_STRING, 'ig');

const EMAIL_URL_PREFIX_REGEX = /^mailto:/i;

/**
 * The function extracts email addresses from a plain text.
 * Note that the function preserves the order of emails and keep duplicates.
 * @param {string} text Text to search in.
 * @return {string[]} Array of emails addresses found.
 * If no emails are found, the function returns an empty array.
 * @memberOf social
 */
const emailsFromText = (text) => {
    if (!_.isString(text)) return [];
    return text.match(EMAIL_REGEX_GLOBAL) || [];
};

/**
 * The function extracts email addresses from a list of URLs.
 * Basically it looks for all `mailto:` URLs and returns valid email addresses from them.
 * Note that the function preserves the order of emails and keep duplicates.
 * @param {string[]} urls Array of URLs.
 * @return {string[]} Array of emails addresses found.
 * If no emails are found, the function returns an empty array.
 * @memberOf social
 */
const emailsFromUrls = (urls) => {
    if (!Array.isArray(urls)) throw new Error('The "urls" parameter must be an array');

    const emails = [];
    for (const url of urls) {
        if (!url) continue;
        if (!EMAIL_URL_PREFIX_REGEX.test(url)) continue;

        const email = url.replace(EMAIL_URL_PREFIX_REGEX, '').trim();
        if (EMAIL_REGEX.test(email)) emails.push(email);
    }
    return emails;
};


/**
 * Representation of social handles parsed from a HTML page.
 *
 * The object has the following structure:
 *
 * ```
 * {
 *   emails: String[],
 *   
 * }
 * ```
 * @typedef SocialHandles
 * @property {string[]} emails
 
 */

/**
 * The function attempts to extract emails, phone numbers and social profile URLs from a HTML document,
 * specifically LinkedIn, Twitter, Instagram and Facebook profile URLs.
 * The function removes duplicates from the resulting arrays and sorts the items alphabetically.
 *
 * Note that the `phones` field contains phone numbers extracted from the special phone links
 * such as `[call us](tel:+1234556789)` (see {@link social#phonesFromUrls})
 * and potentially other sources with high certainty, while `phonesUncertain` contains phone numbers
 * extracted from the plain text, which might be very inaccurate.
 *
 * **Example usage:**
 * ```javascript
 * const Apify = require('apify');
 *
 * const browser = await Apify.launchPuppeteer();
 * const page = await browser.newPage();
 * await page.goto('http://www.example.com');
 * const html = await page.content();
 *
 * const result = Apify.utils.social.parseHandlesFromHtml(html);
 * console.log('Social handles:');
 * console.dir(result);
 * ```
 *
 * @param {string} html HTML text
 * @param {*|null} [data] Optional object which will receive the `text` and `$` properties
 *   that contain text content of the HTML and `cheerio` object, respectively. This is an optimization
 *   so that the caller doesn't need to parse the HTML document again, if needed.
 * @return {SocialHandles} An object with the social handles.
 *
 * @memberOf social
 */
const parseHandlesFromHtml = (html, data = null) => {
    const result = {
        emails: []
        
    };

    

    result.emails = emailsFromUrls(linkUrls).concat(emailsFromText(text));
    

    

    // Sort and deduplicate handles
    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (const key in result) {
        result[key].sort();
        result[key] = _.uniq(result[key], true);
    }

    return result;
};

/**
 * A namespace that contains various utilities to help you extract social handles
 * from text, URLs and and HTML documents.
 *
 * **Example usage:**
 *
 * ```javascript
 * const Apify = require('apify');
 *
 * const emails = Apify.utils.social.emailsFromText('alice@example.com bob@example.com');
 * ```
 * @namespace social
 */
export const socialUtils = {
    emailsFromText,
    emailsFromUrls,
    phonesFromText,
    parseHandlesFromHtml,

    EMAIL_REGEX,
    EMAIL_REGEX_GLOBAL
};
