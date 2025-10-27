import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NetworkDiagram from './pages/NetworkDiagram';
import { Toaster } from './components/ui/sonner';
import '@/App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NetworkDiagram />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;