import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApiProvider } from './context/ApiContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import GitHubCorner from './components/common/GitHubCorner';
import ChainState from './pages/ChainState';
import Extrinsics from './pages/Extrinsics';
import Transfer from './pages/Transfer';
import Home from './pages/Home';

function App() {
  return (
    <ApiProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Header />
          <GitHubCorner url="https://github.com/mdprana" />
          <main className="container mx-auto py-20 px-4 flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chainstate" element={<ChainState />} />
              <Route path="/extrinsics" element={<Extrinsics />} />
              <Route path="/transfer" element={<Transfer />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ApiProvider>
  );
}

export default App;