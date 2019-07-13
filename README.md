# Lambda Edge (CloudFront CDN) function that allows caching based on language or locale

[![Build Status](https://api.travis-ci.org/Bramzor/lambda-edge-locale.svg?branch=master)](https://travis-ci.org/Bramzor/lambda-edge-locale)

Based on NodeJS
Frequently languages are computed based on the Accept-Language header. Problem with this header is that it can be a lot of different values, for example:
Accept-Language: fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
Accept-Language: fr-CH
Accept-Language: fr
Accept-Language: en-US,en;q=0.5
or even:
Accept-Language: *
Adding `Accept-Language` to CloudFront to whitelist header to keep different caches for different languages results in saying goodbye to efficient caching. It will save maybe 10s or even 100s of versions of a page, while in fact, it might only be 4 different pages/languages.
**Notice**: If you take into account other methods that systems provide their language, query parameters like fb_locale or lang, you are completely lost.
The solution: Lambda@Edge for CloudFront

The following function will look for any allowed language (or locale) and will update the Accept-Language header before it reaches CloudFront caching. Result is that instead of caching every different Accept-Language header possible, you will only cache the number of versions you specify in fetchlocale.ts supportedLanguages array. Passing a query parameter like mypage?lang=nl will be used to check if that language is available and if so, change the Accept-Language header.

Result: CloudFront will always cache the version of the languages you support.


To use this plugin:

* Clone this repo: git clone 
* npm install
* npm run createzip

`npm run createzip` will remove all development modules and install the minimum production packages to create a zipfile at ../lambda-edge-locale.zip

 * create a function on AWS for Lambda Edge (inside region us-east-1)
 * create a trigger for that function in your CloudFront distribution for "Viewer Request"
 * add a whitelist header to your CloudFront distribution behavior for the custom header you are using and want to use as caching parameter. For example: Accept-Language or X-CVC-Language


 Other nice things in this example:
 * Log if a function is a coldstart or not (**)

 (**) Coldstart is the event when a Lambda function was stopped because of inactivity for a long time (appr. 30-40min??) and has to be started from scratch. This increases the response time of the request. So it is beneficial to keep it running on multiple locations, a good way to do this is with an uptime monitoring tool like for example [updown.io](https://updown.io/r/HV6RD)
 It can help to change CloudFront price class to "Use Only U.S., Canada and Europe" so you only need to keep your function running in fewer locations.
