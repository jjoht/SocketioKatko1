const express = require("express")
const Socket = require("socket.io")

const app = express()

const server = require("http").createServer(app)

const io = Socket(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

let PORT = 3000

server.listen(PORT, () => {
    console.log("listening on ", PORT)
})

// Tee userseista lista objekteista, johon sisältyy socket.id
let users = []


io.on("connection", (socket) => {
    console.log("connected to ", socket.id)
    socket.on("adduser", (username) => {
        socket.user = { // Temporarily added a hand
            username: username,
            user_id: socket.id,
            hand: [`King ${username}`, `Queen ${username}`, `Jack ${username}`]
        }
        users.push(socket.user)
        io.sockets.emit("users", users)
        if(users.length === 2) {
            // game() // This emits the userlist to client
            return
        }
    })
    
    socket.on("message", (message) => {
        io.sockets.emit("message_client", {
            message: message,
            user: socket.user
        })
    })

    socket.on("display_my_hand", (userList) => {
        userList.forEach(u => {
            console.log(u)
            io.to(u.user_id).emit("server_response_to_display_hand", u.hand)
        })
        
    })

    socket.on("disconnect", () => {
        console.log("We are disconnecting ", socket.user)
        if(socket.user) {
            users.splice(users.indexOf(socket.user), 1)

            io.sockets.emit("users", users)
        }
    })
})

// API CALLS

function game() {
    console.log("game ran")
    const options = {
        hostname: 'www.deckofcardsapi.com',
        port: 443,
        path: '/api/deck/new/shuffle/?deck_count=1',
        method: 'GET'
    }
              
    const req = require("https").request(options, (res) => {
        // console.log('statusCode:', res.statusCode);
        // console.log('headers:', res.headers);
        
        res.on('data', (d) => {
            // process.stdout.write(d)
            deck = JSON.parse(d)
            deal(deck.deck_id)
        })
    })
        
    req.on('error', (e) => {
        console.error("VIRHE OLI:", e)
    })
    req.end()
}

function deal(id) {
    console.log("deal ran")

    const options = {
        hostname: `www.deckofcardsapi.com`,
        port: 443,
        path: `/api/deck/${id}/draw/?count=${10}`, // This line has error
        method: 'GET'
    }

    let output = ""
              
    const req = require("https").request(options, (res) => {
        // console.log('statusCode:', res.statusCode);
        // console.log('headers:', res.headers);
        
        res.on('data', (d) => {
            // process.stdout.write(d)
            output += d
            // tenCards = JSON.parse(d)

        })

        res.on('end', () => {
            tenCards = JSON.parse(output)
            cleanPile = tenCards.cards
            const pile2 = cleanPile.splice(5)
            users[0].hand = cleanPile
            users[1].hand = pile2
            console.log(users[0].hand)
            io.sockets.emit("users", users)
        })
    })
        
    req.on('error', (e) => {
        console.error("DEAL VIRHE OLI", e)
    })
    req.end()
}
