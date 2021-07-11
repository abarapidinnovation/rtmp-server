const express = require('express')
const nodeMediaServer = require('./media-server')

const app = express()
nodeMediaServer.run()

app.listen(5000)