let ws;
let username;
let mode = 0; // 0=register, 1=chat
$("#chatroom-container").on("click", () => {
  switch (mode) {
    case 0:
      $("#enter-username").get(0).focus();
      break;
    case 1:
      $("#enter-message").get(0).focus();
      break;
  }
})

$("#register-form").on("keydown", (e) => {
  if (($("#enter-username").text().length >= 10) && (e.keyCode != 8)) {
    e.preventDefault();
    return;
  }
})

$("#register-form").on("keyup", (e) => {
  e.preventDefault();
  if (e.key === 'Enter')  {
    username = $("#enter-username").text().trim();
    if (username == "") {
      return;
    }
  
    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username })
    }).then((response) => {
      console.log(response);
      if (response.ok) {
        console.log("User created");
        ws = new WebSocket('ws://localhost:8080'); 
        hideRegisterShowChat();
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          const { type, payload } = data;
          console.log("here", event);
          switch (type) {
            case "connectedUser":
              connectCurrentUser(payload);
              console.log("User connected:", username);
              break;
            case "disconnectedUser":
              removeCurrentUser(payload);
              console.log("User disconnected:", username);
              break;
            case "message":
              sendMessage(payload);
              break;
          }
        };
        mode = 1;
      } else {
        response.json().then((data) => {
          console.log("Error creating user:", data.message);
              $("#register-message").css("display", "block").css("color", "red");
          $("#register-message").text(data.message);
        });
      }
    })
  }
});

$("#message-form").on("keydown", (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    return;
  }
  if (($("#enter-message").text().length >= 45) && (e.keyCode != 8)) {
    e.preventDefault();
    return;
  }
})

$("#message-form").on("keyup", (e) => {
  if (e.key === 'Enter') {
    const message = $("#enter-message").text().trim();
    if (message == "") {
      return;
    }
    if (ws && ws.readyState === WebSocket.OPEN) { 
      ws.send(JSON.stringify({ type:  "message", payload: message }))
      console.log("Message sent");
      $("#enter-message").text("");
    } else {
      console.log("WebSocket connection is not open");
    } 
  }
});

function sendMessage(payload) {
  console.log("Received message:", payload);
  const { username, message, timestamp } = payload;
  displayMessageAndTime(`${username}: ${message}`, timestamp);
}

function hideRegisterShowChat() {
  $("#register-form").css("display", "none");
  $("#chatroom").css("display", "flex");
  $("#enter-message").focus();
  $("#pre-enter-message").css("display", "block").html("Enter message:&nbsp;");
}

function updateUserList(usernameList) {
  const currentList = $("#users");
  currentList.empty();
  usernameList.forEach(user => {
    const li = $("<li>").text(user);
    currentList.append(li);
  });
}

function connectCurrentUser(payload) {
  const { username, usernameList, timestamp } = payload;
  displayMessageAndTime(`${username} has joined.`, timestamp);
  updateUserList(usernameList);
}

function removeCurrentUser(payload) {
  const { username, usernameList, timestamp} = payload;
  displayMessageAndTime(`${username} has left.`, timestamp);
  updateUserList(usernameList);
}

function displayMessageAndTime(message, timestamp) {
  const formattedTimestamp = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
  const li = $("<li>").addClass("messages-item");
  const liMessage = $("<li>").text(message);
  const liTime = $("<li>").text(formattedTimestamp);
  li.append(liMessage).append(liTime);
  $("#messages").append(li);
  $("#message-container").scrollTop($("#message-container")[0].scrollHeight);
}