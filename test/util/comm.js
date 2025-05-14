console.log('test/comm.js loaded');

// This JS file is injected into the iframe'd HTML content that we're testing.
// It sets up a postMessage listener to receive messages from the parent test window.
// General usage is:
// 1. After load, the iframe will send a message to the parent window that its ready
// 2. And it will setup a faked test.chrome.runtime.onMessage handler that depends on messaging
// the parent window.
// 3. The parent window will send a message back of the fake URI to set

window.test = {};

// Setup message event
// Valid messages:
//  { type: 'ready', uri: 'https://example.com' }
//  { type: 'runtimeMessage', message: { ... } }

window.addEventListener('message', function(event) {
  // Handle the message
  const message = event.data;
  switch (message.type) {
    case 'ready': {
      console.log('Iframe is ready');
      test.location = new URL(message.uri);
      break;
    }

    case 'runtimeMessage': {
      onMessageCallback(message.message, this, (response) => {
        window.parent.postMessage({
          type: 'runtimeMessage',
          message: response,
        }, '*');
      });
      break;
    }

    default: {
      throw new Error('Unknown message type:', message.type);
    }
  }
});

test.chrome = {};
test.chrome.runtime = {};
test.chrome.runtime.onMessage = {};
// callback is (message, sender, sendResponse) => { ... }
let onMessageCallback = () => {};
test.chrome.runtime.onMessage.addListener = (callback) => {
    onMessageCallback = callback;
};

