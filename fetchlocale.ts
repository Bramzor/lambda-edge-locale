// tslint:disable-next-line:no-var-requires
const parser = require("accept-language-parser")
import queryString from "query-string"
let coldStart = true

const defaultlanguage = "en-US"
const supportedLanguages = ["en-US", "nl-BE"]
let printlogs = true

function log(msg: string) {
    if (!printlogs) {
        return
    }
    console.log(msg)
}

export default function(event: any, context: any, callback: any): any {
    if (coldStart) { log("coldStart detected"); coldStart = false }

    const request = event.Records[0].cf.request
    const headers = request.headers
    log("Header accept-language: " + JSON.stringify(headers["accept-language"]))
    const acceptLanguageString = headers["accept-language"] && headers["accept-language"][0]
        ? headers["accept-language"][0].value : null
    let locale
    const params = request.querystring ? queryString.parse(request.querystring) : {}

    if (params.fb_locale) {
        log("Query param fb_locale set with data: " + params.fb_locale)
        locale = parser.pick(supportedLanguages, params.fb_locale, { loose: true })
    } else if (params.lang) {
        log("Query param lang set with data: " + params.lang)
        locale = parser.pick(supportedLanguages, params.lang, { loose: true })
    }
    if (locale) {
        log("Locale set by querystring parser to: " + locale)
    }
    if (!locale) { locale = parser.pick(supportedLanguages, acceptLanguageString, { loose: true }) || defaultlanguage }

    const language = locale.indexOf("-") !== -1 ? locale.split("-")[0] : locale
    log("Setting X-CVC-Language to: " + language + " and Accept-Language and X-CVC-Locale to: " + locale)
    headers["X-CVC-Language".toLowerCase()] = [ { key: "X-CVC-Language", value: language } ]
    headers["X-CVC-Locale".toLowerCase()] = [ { key: "X-CVC-Locale", value: locale } ]
    headers["Accept-Language".toLowerCase()] = [ { key: "Accept-Language", value: locale } ]
    return callback(null, request)
}

export let disablelog = (): void => {
    printlogs = false
}
