const fs = require('fs');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { log } = require('console');

const app = express();

app.use(express.static("public"));
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let users = [];

app.post("/register", (req, res) => {
  const username = req.body.username;
  if (users.find((user) => user.username === username)) {
    console.log("Username already exists");
    res.status(409).json({ message: "Username already exists" });
    return;
  }
  users.push({ username, ws: null });
  res.status(200).json({ message: "Username registered successfully", username });
});

wss.on('connection', (ws) => {
  const user = users.find((user) => user.ws === null);
  if (user) {
    user.ws = ws;
    const userEntry = {
      username: user.username,
      timestamp: new Date().toISOString()
    }
    broadcastConnectedUser(userEntry);
  } else {
    console.log("No user slot available");
    ws.close();
  }
  ws.on('message', (message) => {
    const { type, payload } = JSON.parse(message);
    const user = users.find((user) => user.ws === ws);
    switch (type) {
      case "message":
        console.log(`Received message from ${user.username}: ${payload}`);
        const chatEntry = {
          username: user.username,
          message: payload,
          timestamp: new Date().toISOString()
        };
        broadcastChat(chatEntry);
        break;
      case "garbage":
        others = users.filter((u) => u.username !== user.username);
        others[Math.floor(Math.random()*others.length)].ws.send(JSON.stringify({ type: "garbage", payload: payload }));
        break;
      case "matrix":
        // User 1 sends matrix0 to 2 3 4 
        // User 2 sends matrix0 to 1 and matrix1 to 3 4 
        // User 3 sends matrix1 to 1 2 and matrix2 to 4
        // User 4 sends matrix2 to 1 2 3
        let userIndex = users.indexOf(user);
        let displayOrdering = (userIndex) => {
          switch (userIndex) {
            case 0:
              return [0, 0, 0];
            case 1:
              return [0, 1, 1];
            case 2:
              return [1, 1, 2];
            case 3:
              return [2, 2, 2];
          };
        }
        let count = 0;
        const matrixEntry = {
          username: user.username,
          matrix: payload.matrix,
          shape: payload.shape,
          displayIndex: -1,
          timestamp: new Date().toISOString()
        };
        for (let i = 0; i < users.length; i++) {
          if (users[i].username !== user.username) {
            matrixEntry.displayIndex = displayOrdering(userIndex)[count];
            users[i].ws.send(JSON.stringify({ type: `opponentMatrix`, payload: matrixEntry }));
            count++;
          }
        }
        break;
    }
  });

  ws.on('close', () => {
    const disconnectedUser = users.find((user) => user.ws === ws);
    if (disconnectedUser) {
      const username = disconnectedUser.username;
      users = users.filter((user) => user.username !== username);
      const userEntry = {
        username,
        timestamp: new Date().toISOString()
      }
      broadcastDisconnectedUser(userEntry);
      console.log("Disconnected user:", username);
    }
  });
});

server.listen(8080, () => {
  console.log('Listening on http://localhost:8080');
});

function broadcastConnectedUser(userEntry) {
  const { username, timestamp } = userEntry;
  const usernameList = users.map((user) => user.username);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "connectedUser", payload: {username, usernameList, timestamp} }));
    }
  })
}

function broadcastDisconnectedUser(userEntry) {
  const { username, timestamp } = userEntry;
  const usernameList = users.map((user) => user.username);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "disconnectedUser", payload: {username, usernameList, timestamp} }));
    }
  })
}

function broadcastChat(chatEntry) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "message", payload: chatEntry }));
    }
  });
}