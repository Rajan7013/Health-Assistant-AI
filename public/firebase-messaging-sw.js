importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAGAdn6hT9fhaGqmqN5LpcUlWV3FW-rNTw",
    authDomain: "studio-2526433000-2e931.firebaseapp.com",
    projectId: "studio-2526433000-2e931",
    storageBucket: "studio-2526433000-2e931.firebasestorage.app",
    messagingSenderId: "548223774566",
    appId: "1:548223774566:web:16693942e42061dd6a22a7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
