const registerWordleHandlers = (io, socket) => {
    if (!socket.request.session.socketUser) {
        socket.request.session.socketUser = {
            sessionId: socket.request.session.id,
            name: socket.request.session.username
        };

        const { socketUser } = socket.request.session;
    }
};

module.exports = registerWordleHandlers;
