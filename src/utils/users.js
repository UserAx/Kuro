const users = [];

const addUser = ({id, username, room}) => {
    username = username.toLowerCase();
    room = room.toLowerCase();

    if(!username || !room){
        return {
            error: "Username and room required."
        }
    }
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room; 
    });
    if(existingUser){
        return {
            error: "User is present in chat."
        }
    }
    const user = {id, username, room};
    users.push(user);
    return {user};
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    
    const user = users.find((user) => user.id === id);
    if(!user){
        return {
            error: "Unable to find a user."
        }
    }
    return user;
}

const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => user.room === room);
    if(!usersInRoom){
        return {
            error: "Unable to find any users in this room"
        }
    }
    return usersInRoom;
}

module.exports = {addUser, removeUser, getUser, getUsersInRoom};