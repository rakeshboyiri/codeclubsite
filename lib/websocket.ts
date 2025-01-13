import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

export function initWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer)

  io.on('connection', (socket) => {
    console.log('A user connected')

    socket.on('joinNotice', (noticeId) => {
      socket.join(noticeId)
    })

    socket.on('leaveNotice', (noticeId) => {
      socket.leave(noticeId)
    })

    socket.on('disconnect', () => {
      console.log('A user disconnected')
    })
  })

  return io
}

