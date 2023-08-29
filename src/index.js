const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
	console.log("New WebSocket connection");

	socket.emit("message", "Welcome!");
	socket.broadcast.emit("message", "A new user has joined");

	socket.on("sendMessage", (message, calback) => {
		const filter = new Filter();

		if (filter.isProfane(message)) {
			return calback("Profanity is not allowed!");
		}

		io.emit("message", message);
		calback();
	});

	socket.on("sendLocation", (coords, callback) => {
		io.emit(
			"message",
			`https://google.com/maps?q=${coords.latitude},${coords.longitude}`
		);
		callback();
	});

	socket.on("disconnect", () => {
		io.emit("message", "A user has left!");
	});
});

server.listen(port, () => {
	console.log(`Server is up on port ${port}!`);
});
