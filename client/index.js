console.log("Index.js linked")

const socket = io("http://localhost:3000")

const messageForm = document.querySelector(".chatbox form")
const messageList = document.querySelector("#messagelist")
const userList = document.querySelector("ul#users")
const chatBoxInput = document.querySelector(".chatbox input")
const userAddForm = document.querySelector(".modal")
const backDrop = document.querySelector(".backdrop")
const userAddInput = document.querySelector(".modal input")

const chatapp = document.querySelector(".chatapp")
const elseCard = document.querySelector(".else-card")
const yourCard = document.querySelector(".your-card")
const yourHand = document.querySelector("#your-hand")



let messages = []
let users = []
console.log(users.length)


// SOCKET LISTENERS
socket.on("message_client", (receivedMessage) => {
    messages.push(receivedMessage)
    updateMessages()
})

socket.on("users", (_users) => {
    users = _users

    updateUsers()
    console.log(users.length)
})

socket.on("server_response_to_display_hand", (hand) => {
    updateGame(hand)
})

// EVENT LISTENERS
messageForm.addEventListener("submit", messageSubmitHandler)
userAddForm.addEventListener("submit", userAddHandler)
chatapp.addEventListener("click", chatappHandler)

/* 
`<li>
<p>${messages[i].user.username}</p>
<p>${messages[i].message}</p>
<div class="aa">
<img class="a" width="30px" height="45px" src="${messages[i].user.hand[0].image}">
<img class="a" width="30px" height="45px" src="${messages[i].user.hand[1].image}">
<img class="a" width="30px" height="45px" src="${messages[i].user.hand[2].image}">
<img class="a" width="30px" height="45px" src="${messages[i].user.hand[3].image}">
<img class="a" width="30px" height="45px" src="${messages[i].user.hand[4].image}">
</div>
</li>`
*/

function messageSubmitHandler(e) {
    e.preventDefault()
    let message = chatBoxInput.value

    if(!message) {
        return alert("Message must not be empty")
    }

    socket.emit("message", message)
    // socket.emit("display_my_hand", users)

    chatBoxInput.value = ""
}

function updateMessages() {
    messageList.textContent = ""
    for(let i = 0; i < messages.length; i++) {
        // let userId = messages[i].user.user_id
        // const indexOfUser = users.findIndex(u => u.user_id == userId)
        // console.log(users[indexOfUser])
        messageList.innerHTML += `<li>
            <p>${messages[i].user.username}</p>
            <p>${messages[i].message}</p>
            </li>`
    }
}

function updateUsers() {
    userList.textContent = ""
    for(let i = 0; i < users.length; i++) {
        let node = document.createElement("LI")
        let textNode = document.createTextNode(`${users[i].username} ${users[i].user_id}`)
        node.appendChild(textNode)
        userList.appendChild(node)
    }
}

function userAddHandler(e) {
    e.preventDefault()
    let username = userAddInput.value
    if(!username) {
        return alert("You must add username")
    }
    socket.emit("adduser", username)
    userAddForm.classList.add("disappear")
    backDrop.classList.add("disappear")

}

function chatappHandler() {
    console.log(users[0].hand)
    socket.emit("display_my_hand", users)
}

function updateGame(hand) {
    yourHand.textContent = ""


    for(let i = 0; i < hand.length; i++) {
        // yourHand.innerHTML += `<span><img class="a" width="30px" height="45px" src="${hand[i].image}"></span>`
        yourHand.innerHTML += `<span class="span-hand">${hand[i]}</span>`
    }

}
