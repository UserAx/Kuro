const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');

const $messages = document.querySelector('#messages');
const messageTemplate = document.querySelector('#message-template').innerHTML;

const locationTemplate = document.querySelector('#location-template').innerHTML;

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


$messageForm.addEventListener('submit', (e) =>{
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = document.querySelector('input').value;
    socket.emit('sendMessage', message, (message) => {
        if(message){
            return console.log(message);
        }
        console.log("Message delivered!");
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value ='';
        $messageFormInput.focus();
    });
});

$sendLocationButton.addEventListener('click', (e)=>{
   
    if(!navigator.geolocation){
        return alert("Your browser doesn't support geolocation");
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) =>{
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) =>{
            $sendLocationButton.removeAttribute('disabled');
            if(error){
                return console.log("Unable to send location.");
            }
        });
    });
});

socket.on('message', (message)=>{
    const html = Mustache.render(messageTemplate, {username: message.username,
                                                    message: message.text,
                                                    createdAt: moment(message.createdAt).format('h: mm a')});
    $messages.insertAdjacentHTML('beforeend', html);
    console.log(message);
});

socket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {username: location.username,
                                                    url : location.url,
                                                    createdAt: moment(location.createdAt).format('h: mm a')});
    $messages.insertAdjacentHTML('beforeend', html);
});

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room, users});
        document.querySelector('#sidebar').innerHTML = html;
});