import React from 'react';
import './App.css';
import { TicTacToeGame } from './TicTacToeGame';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import Lobby from './Lobby';
function App() {
  return (
    <div className="App">
      <Lobby />

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
      />
    </div>
  );
}

export default App;


