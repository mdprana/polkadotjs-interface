const WebSocket = require('ws');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { endpoint, payload } = body;

    if (!endpoint) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Missing endpoint parameter' }) 
      };
    }

    // Validate endpoint (only allow known public nodes)
    const allowedEndpoints = [
      'wss://rpc.polkadot.io',
      'wss://kusama-rpc.polkadot.io',
      'wss://westend-rpc.polkadot.io',
      'wss://rococo-rpc.polkadot.io'
    ];

    if (!allowedEndpoints.includes(endpoint)) {
      return { 
        statusCode: 403, 
        body: JSON.stringify({ error: 'Endpoint not allowed' }) 
      };
    }

    // Create a new WebSocket connection to the requested endpoint
    const ws = new WebSocket(endpoint);

    // Wait for connection to open
    const connectPromise = new Promise((resolve, reject) => {
      ws.on('open', () => resolve());
      ws.on('error', (err) => reject(err));
      
      // Set a timeout
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    await connectPromise;

    // Send the payload
    if (payload) {
      ws.send(JSON.stringify(payload));
    }

    // Get the response
    const responsePromise = new Promise((resolve, reject) => {
      ws.on('message', (data) => {
        resolve(data.toString());
        ws.close();
      });
      
      ws.on('error', (err) => reject(err));
      
      // Set a timeout
      setTimeout(() => {
        ws.close();
        reject(new Error('Response timeout'));
      }, 5000);
    });

    const response = await responsePromise;

    return {
      statusCode: 200,
      body: response
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};