const http = require('http')
const data = [
    require('./mockServer/success.json'),
    require('./mockServer/error.json'),
    require('./mockServer/progress.json')
]

const server = http.createServer((req, res) => {
    const formResponse = data[Math.floor(Math.random() * data.length)]
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.end(JSON.stringify(formResponse))
})

server.listen(3000, () => {
    console.log(`Server running at http://localhost:3000/`)
})