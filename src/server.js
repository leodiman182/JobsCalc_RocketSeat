const express = require('express')
const server = express()
const routes = require('./routes')

// usando o template engine
server.set('view engine', 'ejs')

//habilitar os arquivos estáticos e criar uma rota para cada elemento dentro dessa pasta "public"
server.use(express.static('public'))

//para usar o req.body
server.use(express.urlencoded({ extended: true }))

//ROUTES - As rotas
server.use(routes)

server.listen(3000, () => console.log('Server is online'))

// PARA INICIAR O SERVIDOR - npm run dev
