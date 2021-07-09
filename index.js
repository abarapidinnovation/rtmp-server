const NodeMediaServer = require('node-media-server')
const ffmpeg = require('child_process').exec
const express = require('express')
const app = express()
require('dotenv').config()

const config = {
  rtmp: { cport: 1935, chunk_size: 60000, gop_cache: true, ping: 30, ping_timeout: 60 },
  http: { port: 8000, mediaroot: './media', allow_origin: '*' },
  trans: { ffmpeg: '/usr/bin/ffmpeg', tasks: [
    {
      app: 'live',
      hls: true,
      hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
      dash: true,
      dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
    }
  ]}
}

app.listen( 5000 )

const nodeMediaServer = new NodeMediaServer(config)
nodeMediaServer.run()

nodeMediaServer.on('postPublish', (id, StreamPath, args) => {
  console.log('++++++++++++++++++++++++++++++[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`)
  const server1 = `rtmp://${process.env.RTMP_HOST}${StreamPath}`
  const server2 = `rtmp://${process.env.RTMP_HOST}/live/stream2`
  const url = `ffmpeg -i ${server1} -c:v copy -c:a copy -map 0 -f tee "[f=flv]${server2}"`
  console.log('server1---->', server1)
  console.log('server2---->', server2)
  console.log('url---->', url)
  ffmpeg(url)
})
    
nodeMediaServer.on('donePublish', (id, StreamPath, args) => {
  console.log('-------------------------------[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
})
