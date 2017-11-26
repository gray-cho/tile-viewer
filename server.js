var request = require('request-promise');

function Proxy() {

}

Proxy.prototype.initialize = function() {
    this.header = {
        // header
    }

  var payload = {
    initialization: {
        // initialize condition
    },
    authToken: {
        // auth token info
    }
  }

  var _this = this

  request({
      // initialize url
      url: 'url',
      headers: _this.header,
      method: "POST",
      body: payload.initialization,
      json: true
    }).then((res) => {
        console.log('url')
        console.log(JSON.stringify(res, null, '\t'))
        console.log('------------------------------------')

        payload.authToken.requestToken = res.requestToken

        request({
            url: 'url',
            headers: _this.header,
            method: "POST",
            body: payload.authToken,
            json: true
        }).then((res) => {
            console.log('url')
            console.log(JSON.stringify(res, null, '\t'))
            console.log('------------------------------------')

            _this.header['access-token'] = res.accessToken
            _this.initializeApp()
            // _this.refresh()
        })
    })
}

Proxy.prototype.refreshToken = function(){
  console.log('refreshToken')
  console.log('------------------------------------')
  var _this = this

  var payload = {
    initialization: {
        // initi
    },
    authToken: {
        // auth token
    }
  }

  request({
      url: 'url',
      headers: _this.header,
      method: "POST",
      body: payload.initialization,
      json: true
    }).then((res) => {
        console.log('url')
        console.log(JSON.stringify(res, null, '\t'))
        console.log('------------------------------------')

        payload.authToken.requestToken = res.requestToken

        request({
            url: 'url',
            headers: _this.header,
            method: "POST",
            body: payload.authToken,
            json: true
        }).then((res) => {
            console.log('url')
            console.log(JSON.stringify(res, null, '\t'))
            console.log('------------------------------------')

            _this.header['access-token'] = res.accessToken
        })
    })
}


Proxy.prototype.initializeApp = function() {
    // console.log('accessToken is set: ' + this.header['access-token'])
    // console.log('------------------------------------')

    var _this = this;
    var express = require('express'),
        bodyParser = require('body-parser'),
        errorHandler = require('errorhandler'),
        methodOverride = require('method-override'),
        hostname = process.env.HOSTNAME || 'localhost',
        port = parseInt(process.env.PORT, 10) || 5000,
        publicDir = process.argv[2] || __dirname + '/public',
        path = require('path')

    var app = express()

    app.use(methodOverride())
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({
        extended: true
    }))
    app.use(express.static(publicDir))
    app.use(errorHandler({
        dumpExceptions: true,
        showStack: true
    }))

    var staticPath = path.join(__dirname, '/public');
    app.use(express.static(staticPath))

    // POST method route
    app.all('/v2/*', function (req, response) {
        var method = 'POST'
        var url = 'url' + req.originalUrl

        // console.log('get request=' + req.method)
        // console.log('data= ' + JSON.stringify(req.body))
        // console.log('header= ' + JSON.stringify(_this.header))
        // console.log('query= ' + JSON.stringify(req.query))
        // console.log('redirect to ' + url)
         if(req.originalUrl == '/v2/refresh'){
          console.log('req.originalURl : '+url)
          _this.refreshToken();
         }

        var payload = req.body
        if (!payload && 'lat' in req.query && 'lon' in req.query) {
            payload = {
                geoData: {
                    latitude: req.query.lat,
                    longitude: req.query.lon
                }
            }
        }

        var options = {
            url: url,
            qs: req.query,
            headers: _this.header,
            method: req.method,
            body: payload,
            json: true
        }

        console.log('options.qs=' + JSON.stringify(options.qs, null, '\t'))
        // console.log('options=' + JSON.stringify(options, null, '\t'))
        // console.log('payload=' + JSON.stringify(payload))

        request(options).then((res) => {
            var result = JSON.stringify(res)
            console.log('received ' + result.length + ' bytes data from server')

            response.json(res)
            console.log('------------------------------------')
        }).catch((res) => {
            console.error('------------------------------------')
            response.json(res)
        })
    })

    app.listen(port)
    console.log('Started listening: http://localhost:' + port)
    console.log('------------------------------------')
}

var proxy = new Proxy()

// proxy.initialize()
proxy.initializeApp()
