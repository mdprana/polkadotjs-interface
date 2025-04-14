import React from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../context/ApiContext';

const Home: React.FC = () => {
  const { isApiReady, connectionError, isConnecting } = useApi();

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center my-12">
        <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Polkadot Parachain Interface
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A modern interface for interacting with Substrate-based blockchains
        </p>
      </div>
      
      {/* Connection Status Pill */}
      <div className="flex justify-center mb-12">
        {connectionError ? (
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-800 shadow-lg border border-red-200">
            <span className="h-3 w-3 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            Connection Error
          </div>
        ) : isApiReady ? (
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 shadow-lg border border-green-200">
            <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
            Connected Successfully
          </div>
        ) : (
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 shadow-lg border border-yellow-200">
            <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>
            {isConnecting ? 'Connecting...' : 'Not Connected'}
          </div>
        )}
      </div>
      
      {/* Interface Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <Link 
          to="/chainstate" 
          className="group block relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-800 opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-8 text-white">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">ChainState</h2>
            <p className="text-white/80 mb-6">
              Query blockchain state storage and view data stored on-chain
            </p>
            <div className="inline-flex items-center text-white/90 font-medium">
              Explore
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/extrinsics" 
          className="group block relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-rose-800 opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-8 text-white">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Extrinsics</h2>
            <p className="text-white/80 mb-6">
              Submit transactions and interact with the blockchain
            </p>
            <div className="inline-flex items-center text-white/90 font-medium">
              Interact
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/transfer" 
          className="group block relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-blue-800 opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-8 text-white">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Transfer</h2>
            <p className="text-white/80 mb-6">
              Send tokens to other accounts on the network
            </p>
            <div className="inline-flex items-center text-white/90 font-medium">
              Transfer
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Footer */}
      <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Substrate Dev Template</h3>
            <p className="text-gray-600">
              Built with React, TypeScript, and PolkadotJS API
            </p>
          </div>
          <div className="flex gap-4">
            <a 
              href="https://github.com/MandalaChain/substrate-dev-template" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
            <a 
              href="https://polkadot.js.org/docs/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;