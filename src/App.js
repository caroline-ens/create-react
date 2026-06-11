// import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <header className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <p>
//             Hello from Render!
//           </p>
//           <a
//             className="App-link"
//             href="https://reactjs.org"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Learn React
//           </a>
//         </header>
//       </div>
//     );
//   }
// }

// export default App;

import { useState } from "react";

function App() {
  const [data, setData] = useState("");

  const getPassport = async () => {
    try {
      const res = await fetch("/api/passport");
      const json = await res.json();

      setData(json.cookie);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Vercel API Demo</h1>

      <button onClick={getPassport}>
        Load Secret
      </button>

      <pre>{data}</pre>
    </div>
  );
}

export default App;
