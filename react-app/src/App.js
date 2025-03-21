import logo from './logo.svg';
import './App.css';
import Header from './components/Header';
import Home from './components/Home';
import VerifyEmail from "./components/VerifyEmail";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

function App() {
  return (
    <div className="App">


      <Header />
      <Home />
      <Route path="/verify-email" element={<VerifyEmail />} />
    </div>
  );
}

export default App;
