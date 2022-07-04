const {SerialPort} = require("serialport");
//define name of port of arduino
var port = "COM4";
const {ReadlineParser} = require('@serialport/parser-readline')
const {createServer} = require("http");
const {Server} = require("socket.io");

const httpServer = createServer();
//creat socket server
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});
httpServer.listen(7214)

var serialPort;
io.on("connection", (socket) => {

    SerialPort.list().then((ports) => {
        if (!checkPort(ports))
        {  socket.emit('noExist');
            serialPort=undefined;

        }
        else {
            socket.emit('Exist');
            console.log("return "+getPort(ports))
            if (serialPort===undefined)
             serialPort = new SerialPort({
                path: getPort(ports),
                baudRate: 9600,
            })
            const parser = serialPort.pipe(new ReadlineParser({delimiter: '\r\n'}))
            //reading data
            parser.on('data', (data) => {
                    parser.pause();
                    if(serialPort!==undefined)
                        serialPort.close()
                    serialPort=undefined
                    socket.emit('message',data)
                    socket.disconnect()

            })

        }}
    )

    });
  //check port if exist
    function checkPort(ports) {
        var b=false
         ports.forEach(p => {
            // console.log(p.path)
             console.log(p.path.startsWith('COM'))
            if( p.path.startsWith('COM'))
                b=true

        })
        return b;
    }
  //get arduino port path
    function getPort(ports){
        var path;
        ports.forEach(p => {
             console.log(p.path)
            // if( p.path.startsWith('COM'))
            //     path= p.path
            if( p.path==='COM4')
                path= p.path
        })
        return path;
    }
