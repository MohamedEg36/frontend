document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const carID = urlParams.get('carID');
    const user = localStorage.getItem('user');

    if (carID) {
        fetch(`http://localhost:3000/api/cars/id/${carID}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(car => {
            currentCar = car;
            document.getElementById('car-image').src = car.image;
            document.getElementById('plate-number').innerText = car.plate;
            loadMessages();
        })
        .catch(error => {
            console.error('Error fetching car details:', error);
        });
    } else {
        console.error('Car ID is missing or invalid in the URL.');
    }

    if (user) {
        try {
            currentUser = JSON.parse(user);
        } catch (error) {
            console.error('Error parsing user details:', error);
        }
    } else {
        console.error('User is not logged in or user details are missing.');
    }
});

let currentCar = null;
let currentUser = null;

function loadMessages() {
    const token = localStorage.getItem('token');

    if (!currentCar || !currentUser) {
        console.error('currentUser or currentCar is not set');
        return;
    }

    fetch(`http://localhost:3000/api/messages?carID=${currentCar.carID}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(messages => {
        const messageContent = document.getElementById('message-content');
        messageContent.innerHTML = '';

        messages.forEach(message => {
            const messageBubble = document.createElement('div');
            messageBubble.classList.add('message-bubble', message.fromUserID === currentUser.userID ? 'sent' : 'received');

            const messageText = document.createElement('div');
            messageText.classList.add('message-text');
            messageText.textContent = message.message;

            const messageTime = document.createElement('span');
            messageTime.classList.add('message-time');
            messageTime.textContent = new Date(message.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            messageBubble.appendChild(messageText);
            messageBubble.appendChild(messageTime);

            messageContent.appendChild(messageBubble);
        });

        messageContent.scrollTop = messageContent.scrollHeight;
    })
    .catch(error => console.error('Error fetching messages:', error));
}

function sendMessage() {
    if (!currentUser || !currentCar) {
        console.error('currentUser or currentCar is not set');
        return;
    }

    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value;
    if (messageText.trim() === '') {
        return;
    }

    const token = localStorage.getItem('token');
    const message = {
        fromUserID: currentUser.userID,
        toUserID: currentCar.userID,
        carID: currentCar.carID, 
        message: messageText,
        date: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    console.log('Sending message:', message); 

    fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(message)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        messageInput.value = '';
        loadMessages();
    })
    .catch(error => console.error('Error sending message:', error));
}
