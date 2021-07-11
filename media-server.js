const NodeMediaServer = require('node-media-server')
const ffmpeg = require('child_process').exec
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

const mediaServer = () => {
    const nodeMediaServer = new NodeMediaServer(config)

    nodeMediaServer.on('prePublish', (id, StreamPath, args) => {
        console.log('++++++++++++++++++++++++++++++[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`)
        const rtmpUrl = `rtmp://${process.env.RTMP_HOST}${StreamPath}`
        const redirectingUrl = `rtmp://${process.env.RTMP_HOST}/live/stream2`
        const url = `ffmpeg -i ${rtmpUrl} -c:v copy -c:a copy -map 0 -f tee "[f=flv]${redirectingUrl}"`
        ffmpeg(url)
    })
        
    nodeMediaServer.on('donePublish', (id, StreamPath, args) => {
        console.log('-------------------------------[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    })

    return nodeMediaServer
}

module.exports = mediaServer()
