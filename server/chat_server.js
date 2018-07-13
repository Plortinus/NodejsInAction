const socketio = require('socket.io')

let io
let guestNumber = 1
let nickNames = {}
let nameUsed = []
let currentRoom = {}

const assignGuestName = (socket, guestNumber, nickNames, nameUsed) => {
  const name = `Guest${guestNumber}`
  nickNames[socket.id] = name
  socket.emit('nameResult', {
    success: true,
    name: name
  })
  nameUsed.push(name)
  return guestNumber + 1
}

const joinRoom = (socket, room) => {
  socket.join(room)  // 加入房间
  currentRoom[socket.id] = room // 房间列表
  socket.emit('joinResult', {room: room}) // 通知加入房间的结果
  // 通知房间里的所有人
  io.to(room).emit('message', {
    text: `${nickNames[socket.id]} has joined ${room}.`
  })
  // 查询当前房间其他人都有哪些
  io.of('/').in(room).clients((err, clients) => {
    if (err) throw err
    if (clients.length > 1) {
      let usersInRoomSummary = `Uses currently in ${room}:`
      clients.forEach(el => {
        if (el !== socket.id) {
          usersInRoomSummary += ','
        }
      })
      usersInRoomSummary += '.'
      socket.emit('message', {
        text: usersInRoomSummary
      })
    }
  })
}

const handleNameChangeAttempts = (socket, nickNames, nameUsed) => {
  socket.on('nameAttempt', name => {
    if (name.indexOf('Guest') == 0) {
      socket.emit('nameResult', {
        success: false,
        message: 'Names cannot begin with "Guest"'
      })
    } else {
      if (nameUsed.indexOf(name) === -1) {
        const previousName = nickNames[socket.id]
        const previousNameIndex = nameUsed.indexOf(previousName)
        nameUsed.push(name)
        nickNames[socket.id] = name
        delete nameUsed[previousNameIndex]

        socket.emit('nameResult', {
          success: true,
          name: name
        })
        io.to(currentRoom[socket.id]).emit('message', {
          text: `${previousName} is now known as ${name}`
        })
      } else {
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use'
        })
      }
    }
  })
}

const hanldeRoomJoining = socket => {
  socket.on('join', room => {
    socket.leave(currentRoom[socket.id])
    joinRoom(socket, room.newRoom)
  })
}

const handleMessageBroadcasting = (socket, nickNames) => {
  socket.on('message', message => {
    io.to(message.room).emit('message', {
      text: `${nickNames[socket.id]}:${message.text}`
    })
  })
}

const handleClientDisconnection = (socket, nickNames, nameUsed) => {
  socket.on('disconnect', () => {
    const nameIndex = nameUsed.indexOf(nickNames[socket.id])
    delete nameUsed[nameIndex]
    delete nickNames[socket.id]
  })
}

exports.listen = server => {
  io = socketio.listen(server)
  io.set('log level', 1)
  io.sockets.on('connection', socket => {
    guestNumber = assignGuestName(socket, guestNumber, nickNames, nameUsed)
    joinRoom(socket, 'Lobby')

    handleMessageBroadcasting(socket, nickNames)
    handleNameChangeAttempts(socket, nickNames, nameUsed)
    hanldeRoomJoining(socket)

    socket.on('rooms', () => {
      socket.emit('rooms', currentRoom)
    })

    handleClientDisconnection(socket, nickNames, nameUsed)
  })
}