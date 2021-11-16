const cors = require('cors')
const express = require('express')
const urlencoded = express.urlencoded
const json = express.json

function config (app) {
    app.disable('x-powered-by')

    app.use(urlencoded({ extended: false }))
    app.use(json())
    app.use(cors())
}

module.exports = config