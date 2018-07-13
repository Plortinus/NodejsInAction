var socket = io.connect()
var chatApp = new Chat(socket)

new Vue({
  el: '#app',
  data: function () {
    return {
      roomList: [],
      messageList: [],
      currentRoom: '',
      yourName: '',
      form: {
        message: ''
      }
    }
  },
  methods: {
    send: function () {
      const message = this.form.message
      if (message[0] === '/') {
        chatApp.processCommand(message)
      } else {
        chatApp.sendMessage(this.currentRoom, message)
      }
      this.form.message = ''
    }
  },
  created () {
    socket.on('message', (message) => {
      this.messageList.push(message.text)
    })
    socket.on('nameResult', data => {
      if (data.success) {
        this.yourName = data.name
      } else {
        this.messageList.push(data.message)
      }
    })
    socket.on('joinResult', data => {
      this.currentRoom = data.room
      this.messageList.push('Room Changed')
    })
    socket.on('rooms', data => {
      this.roomList = data
    })
    setInterval(() => {
      socket.emit('rooms')
    }, 1000)
  }
})