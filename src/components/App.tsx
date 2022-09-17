import { ToastContainer } from "react-toastify";
import "./App.css";

import "react-toastify/dist/ReactToastify.css";
import Lobby from "./Lobby";
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
