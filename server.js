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
  console.log("Client connected");
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