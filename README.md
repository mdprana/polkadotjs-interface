# 🚀 Polkadot Parachain Interface

<div align="center">

![Polkadot Parachain Interface Logo](https://github.com/user-attachments/assets/88a8d34f-604c-45b5-9c92-cf14464a7a87)

A modern, responsive interface for interacting with blockchain

[![Netlify Status](https://api.netlify.com/api/v1/badges/c722a0b9-4db4-4e02-911e-4e92259f2c91/deploy-status)](https://app.netlify.com/sites/mdprana-polkadotjs-interface/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![Polkadot.js](https://img.shields.io/badge/Polkadot.js-API-e6007a)

[Live Demo](https://mdprana-polkadotjs-interface.netlify.app/) •
[Features](#features) •
[Getting Started](#getting-started) •
[Zombienet Setup](#zombienet-setup) •
[Development](#development) •
[Deployment](#deployment)

</div>

![Interface Screenshot1](https://github.com/user-attachments/assets/34dd6ae1-b151-4af6-9855-04cbb4d27ea2)
![Interface Screenshot2](https://github.com/user-attachments/assets/965f6d4a-b436-4fd0-bf67-4c52c8715aec)
![Interface Screenshot3](https://github.com/user-attachments/assets/a1645b8f-5259-4135-b696-a73b542bb3da)
![Interface Screenshot4](https://github.com/user-attachments/assets/b4eff895-687b-406d-8799-9027a47a7676)
![Interface Screenshot5](https://github.com/user-attachments/assets/a3c58238-7fdf-47e7-bb62-f4a409a5e1e8)

## ✨ Features

- **🌍 Flexible Network Connection** - Connect to any chain, including local Zombienet and public nodes
- **🔍 Chain State Explorer** - Query and visualize on-chain storage
- **📝 Extrinsics Submission** - Submit transactions with proper parameter handling
- **💸 Token Transfers** - User-friendly interface for sending tokens
- **🔐 Multiple Wallet Support** - Compatible with Polkadot.js Extension and Sub Wallet Extension
- **📱 Responsive Design** - Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Polkadot.js browser extension (for signing transactions)
- Zombienet (for local development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mdprana/substrate-dev-template.git
   cd polkadot-parachain-interface
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Zombienet Setup

To test with a local network, you can use Zombienet to spawn a development chain.

### Install Zombienet and Required Binaries

1. Download Zombienet from the [official GitHub repository](https://github.com/paritytech/zombienet/releases).

2. Make Zombienet executable and add it to your PATH:
   ```bash
   chmod +x zombienet-linux # or zombienet-macos, etc.
   sudo mv zombienet-linux /usr/local/bin/zombienet
   ```

3. Download the required binaries:
   ```bash
   zombienet setup polkadot polkadot-parachain
   ```

4. Make the binaries executable and add them to your PATH:
   ```bash
   sudo mv ./polkadot ./polkadot-execute-worker ./polkadot-parachain ./polkadot-prepare-worker /usr/local/bin
   ```

### Create Network Configuration

Create a file named `network.toml` with the following content:

```bash
[settings]
timeout = 120

[relaychain]

[[relaychain.nodes]]
name = "alice"
validator = true

[[relaychain.nodes]]
name = "bob"
validator = true

[[parachains]]
id = 100

[parachains.collator]
name = "collator01"
```

### Spawn the Network

Run the following command to start your local network:

```bash
zombienet -p native spawn network.toml
```

You should see output similar to this:

```
Network launched 🚀🚀
Namespace: zombie-75a01b93c92d571f6198a67bcb380fcd
Provider: native

Node Information
Name: alice
Direct Link: https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55308#explorer
Prometheus Link: http://127.0.0.1:55310/metrics
...
```

### Connect to the Local Node

Note the WebSocket URL from the output (e.g., `ws://127.0.0.1:55308`). You'll use this to connect your interface to the local node.

## 💻 Development

### Connecting to Different Networks

In the application, use the Network Selector in the Home page to:

1. Select from predefined networks (Polkadot, Kusama, Westend)
2. Enter a custom endpoint (like your local Zombienet node)

**Note**: The WebSocket port for local Zombienet changes each time you restart it. Update the endpoint accordingly.

### Local Development with Zombienet

1. Start Zombienet using the command above
2. Copy the WebSocket URL from the output (e.g., `ws://127.0.0.1:55308`)
3. Run your React application locally (`npm start`)
4. Use the Network Selector to enter the WebSocket URL and connect

## 🚢 Deployment

The project is configured for easy deployment to Netlify. You can see a live demo at [https://mdprana-polkadotjs-interface.netlify.app/](https://mdprana-polkadotjs-interface.netlify.app/).

### Deploying to Netlify

1. Fork this repository
2. Sign up for Netlify and connect your GitHub account
3. Create a new site from the repository
4. Configure the build settings:
   - Build command: `npm run build` or `yarn build`
   - Publish directory: `build`
5. Add the environment variable: `REACT_APP_WS_ENDPOINT=wss://westend-rpc.polkadot.io`
6. Deploy!

**Note**: When deployed to Netlify, the application can't directly connect to your local Zombienet node due to browser security restrictions. Use public nodes (like Westend) for testing the deployed version.

## 🎨 Customizing

### Interface Images

You can customize the interface by replacing the images in the `public/images` and `src/assets` directories:

- **Logo**: Update `public/logo.png` and `public/logo192.png` with your project logo
- **Interface Screenshot**: Replace `docs/images/interface-screenshot.png` with a screenshot of your interface
- **Favicon**: Replace `public/favicon.ico` with your own favicon

## 📖 Documentation

For more information on the Polkadot.js API and associated libraries, check out:

- [Polkadot.js Documentation](https://polkadot.js.org/docs/)
- [Polkadot Wiki](https://wiki.polkadot.network/)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Polkadot.js](https://polkadot.js.org/) for the excellent API
- [Zombienet](https://docs.polkadot.com/tutorials/polkadot-sdk/testing/spawn-basic-chain/) for local development tools
