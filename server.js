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
        socket.user = {
            username: username,
            user_id: socket.id
        }
        users.push(socket.user)
        io.sockets.emit("users", users)
    })
    
    socket.on("message", (message) => {
        io.sockets.emit("message_client", {
            message: message,
            user: socket.user
        })
    })

    socket.on("display_my_hand", (userList) => {
        userList.forEach(u => {
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

// function game() {
//     const options = {
//         hostname: 'encrypted.google.com',
//         port: 443,
//         path: '/',
//         method: 'GET'
//       };
      
//       const req = globalThis.https.request(options, (res) => {
//         console.log('statusCode:', res.statusCode);
//         console.log('headers:', res.headers);
      
//         res.on('data', (d) => {
//           process.stdout.write(d);
//         });
//       });
      
//       req.on('error', (e) => {
//         console.error(e);
//       });
//       req.end();
// }

// let gameOn = false
// let deck = {}


// function game() {
//     if(users.length === 2) {
//         gameOn = true
//         console.log("game ran")
        
//         deal()
//     }
// }

// async function deal() {
//     console.log("deal ran")
//     const response1 = await fetch(`https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`)
//     const deckFromAPI = await response1.json().then(_deck => {
//         // console.log(_deck)
//         deck = _deck
//     })

//     console.log("deckFromAPI, ", deckFromAPI)

//     const response2 = await fetch(`https://www.deckofcardsapi.com/api/deck/${deck.deck_id}/draw/?count=${10}`)
//     const pileFromAPI = await response2.json().then(_pile => {
//         console.log("pile, ", _pile)
//         cleanPile = _pile.cards
//         pile2 = cleanPile.splice(5)
//         users[0].hand = cleanPile
//         users[1].hand = pile2

//     })

//     console.log("pileFromAPI, ", pileFromAPI)

// }

// function display() {
//     return

// }

