const express = require('express');
const app = express();
const path = require('path');
const nunjucks = require('nunjucks');
const server = require('http').Server(app);
const io = require('socket.io')(server,{serveClient:true});


nunjucks.configure('./client/views',{
    autoescape:true,
    express:app
});

const PORT = process.env.PORT || 3000;
app.use('/assets',express.static(path.join(__dirname,'..','client/public')))

app.get('/',(req,res)=>[
    res.render('index.html',{date: new Date()})
]);
io.on('connection',(socket)=>{
    socket.emit('connected','You`re connected')
})
server.listen(PORT, ()=>{
    console.log(`Server start on: ${PORT}`);
});