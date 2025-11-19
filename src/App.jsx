import React from 'react';
import SmartHomeInterface from '../src/components/SmartHomeInterface';
import './App.css'; // Assuming you have an App.css file for global styles

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>My Smart Home</h1>
      </header>
      <main>
        <SmartHomeInterface />
      </main>
      <footer>
        <p>© 2025 Smart Home Control System</p>
      </footer>
    </div>
  );
}

export default App;