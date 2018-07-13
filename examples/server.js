const http = require('http')
const fs = require('fs')
const server = http.createServer()

server.on('request', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'image/jpeg'
  })
  fs.createReadStream('./images/1.jpeg').pipe(res)
})

server.listen(3000)

console.log('Server running at http://localhost:3000/')