const http = require('http')

const server = http.createServer()

const fs = require('fs')

const path = require('path')

const mime = require('mime')

const chatServer = require('./server/chat_server')

const cache = {}

const send404 = (res) => {
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.write('Error 404: File not Found')
  res.end()
}

const sendFile = (res, filePath, fileContents) => {
  res.writeHead(200, {
    'Content-Type': mime.getType(path.basename(filePath))
  })
  res.end(fileContents)
}

const serveStatic = (res, cache, absPath) => {
  fs.exists(absPath, exists => {
    if (exists) {
      fs.readFile(absPath, (err, data) => {
        if (err) {
          send404(res)
        } else {
          cache[absPath] = data
          sendFile(res, absPath, data)
        }
      })
    } else {
      send404(res)
    }
  })
  // if (cache[absPath]) {
  //   sendFile(res, absPath, cache[absPath])
  // } else {
  //   fs.exists(absPath, exists => {
  //     if (exists) {
  //       fs.readFile(absPath, (err, data) => {
  //         if (err) {
  //           send404(res)
  //         } else {
  //           cache[absPath] = data
  //           sendFile(res, absPath, data)
  //         }
  //       })
  //     } else {
  //       send404(res)
  //     }
  //   })
  // }
}

server.on('request', (req, res) => {
  let filePath = false
  if (req.url === '/') {
    filePath = 'client/index.html'
  } else {
    filePath = 'client' + req.url
  }
  const absPath = './' + filePath
  serveStatic(res, cache, absPath)
})

server.listen(3000)
chatServer.listen(server)

console.log('Server running at http://localhost:3000/')