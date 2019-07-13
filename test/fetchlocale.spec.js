const fetchLocale = require('../index')
const chai = require('chai')
const expect = chai.expect;

describe('lambda', () => {
    describe('fetchLocale', () => {
        beforeEach(function () {
            this.handler = fetchLocale.handler
            fetchLocale.disablelog(false)
            this.event = {
                Records: [
                    {
                        cf: {
                            request: {
                                headers: {
                                    'accept-language': [],
                                    'x-cvc-language': [],
                                    'x-cvc-locale': []
                                }
                            },
                            querystring: ""
                        }
                    }
                ]
            }
            this.context = {}
        })

        it('should return the default language if no valid accept-language is set and no language passed via query', function (cb) {
            return this.handler(this.event, this.context, (e, request) => {
                expect(e).to.be.null
                expect(request.headers['accept-language'][0].value).to.equal('en-US');
                expect(request.headers['x-cvc-language'][0].value).to.equal('en');
                expect(request.headers['x-cvc-locale'][0].value).to.equal('en-US');
                return cb()
            })
        })
        it('should return locale if language is passed via query with fb_locale', function (cb) {
            this.event.Records[0].cf.request.querystring = "fb_locale=nl-BE&something=empty"
            return this.handler(this.event, this.context, (e, request) => {
                expect(e).to.be.null
                expect(request.headers['accept-language'][0].value).to.equal('nl-BE');
                expect(request.headers['x-cvc-language'][0].value).to.equal('nl');
                expect(request.headers['x-cvc-locale'][0].value).to.equal('nl-BE');
                return cb()
            })
        })
        it('should return locale if language is passed via query with lang', function (cb) {
            this.event.Records[0].cf.request.querystring = "lang=nl"
            return this.handler(this.event, this.context, (e, request) => {
                expect(e).to.be.null
                expect(request.headers['accept-language'][0].value).to.equal('nl-BE');
                expect(request.headers['x-cvc-language'][0].value).to.equal('nl');
                expect(request.headers['x-cvc-locale'][0].value).to.equal('nl-BE');
                return cb()
            })
        })
        it('should should fail back to default if no matching language is found', function (cb) {
            this.event.Records[0].cf.request.headers['accept-language'].push({key: 'Accept-Language', value:'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5'})
            return this.handler(this.event, this.context, (e, request) => {
                expect(e).to.be.null
                expect(request.headers['accept-language'][0].value).to.equal('en-US');
                expect(request.headers['x-cvc-language'][0].value).to.equal('en');
                expect(request.headers['x-cvc-locale'][0].value).to.equal('en-US');
                return cb()
            })
        })
        it('should be able to get valid language as return', function (cb) {
            this.event.Records[0].cf.request.headers['accept-language'].push({key: 'Accept-Language', value:'nl-BE,nl;q=0.9,*;q=0.8'})
            return this.handler(this.event, this.context, (e, request) => {
                expect(e).to.be.null
                expect(request.headers['accept-language'][0].value).to.equal('nl-BE');
                expect(request.headers['x-cvc-language'][0].value).to.equal('nl');
                expect(request.headers['x-cvc-locale'][0].value).to.equal('nl-BE');
                return cb()
            })
        })
        it('should be able to get valid language as return', function (cb) {
            this.event.Records[0].cf.request.headers['accept-language'].push({key: 'Accept-Language', value:'en-GB,en;q=0.9,*;q=0.8'})
            return this.handler(this.event, this.context, (e, request) => {
                expect(e).to.be.null
                expect(request.headers['accept-language'][0].value).to.equal('en-US');
                expect(request.headers['x-cvc-language'][0].value).to.equal('en');
                expect(request.headers['x-cvc-locale'][0].value).to.equal('en-US');
                return cb()
            })
        })
        it('should return locale if language is passed via query in favor of accept-language', function (cb) {
            this.event.Records[0].cf.request.querystring = "fb_locale=nl-BE&something=empty"
            this.event.Records[0].cf.request.headers['accept-language'].push({key: 'Accept-Language', value:'en-GB,en;q=0.9,*;q=0.8'})
            return this.handler(this.event, this.context, (e, request) => {
                expect(e).to.be.null
                expect(request.headers['accept-language'][0].value).to.equal('nl-BE');
                expect(request.headers['x-cvc-language'][0].value).to.equal('nl');
                expect(request.headers['x-cvc-locale'][0].value).to.equal('nl-BE');
                return cb()
            })
        })
        it('should be able to get valid language as return', function (cb) {
            this.event.Records[0].cf.request.headers['accept-language'].push({key: 'Accept-Language', value:'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7'})
            return this.handler(this.event, this.context, (e, request) => {
                expect(e).to.be.null
                expect(request.headers['accept-language'][0].value).to.equal('nl-BE');
                expect(request.headers['x-cvc-language'][0].value).to.equal('nl');
                expect(request.headers['x-cvc-locale'][0].value).to.equal('nl-BE');
                return cb()
            })
        })
    })
})