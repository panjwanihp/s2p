System.config({
    packages: {
        ...
        "socket.io-client": {"defaultExtension": "js"}
    },
    map: {
        "socket.io-client": "node_modules/@types/socket.io-client/socket.io.js"
    }
});