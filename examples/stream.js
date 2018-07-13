const fs = require('fs')
const stream = fs.createReadStream('./data/resource.json', 'utf8')

stream.on('data', chunk => {
  console.log(chunk)
})

stream.on('end', () => {
  console.log('finished')
})