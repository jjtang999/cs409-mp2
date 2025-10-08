import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ListView from './components/ListView';
import GalleryView from './components/GalleryView';
import DetailView from './components/DetailView';
import './App.css';

function App() {
  return (
    <Router basename="/cs409-mp2">
      <div className="App">
        <header className="App-header">
          <h1>Marvel Characters</h1>
          <nav className="App-nav">
            <Link to="/" className="nav-link">List View</Link>
            <Link to="/gallery" className="nav-link">Gallery View</Link>
          </nav>
        </header>
        <main className="App-main">
          <Routes>
            <Route path="/" element={<ListView />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/character/:id" element={<DetailView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
