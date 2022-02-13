import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Resolve from "./components/Resolve";
import Search from "./components/Search";
import NotFound from "./components/NotFound";
import About from "./components/About";
import Footer from "./components/Footer";
import Product from "./components/Product";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} key={Date.now()} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
          <Route path="/product" element={<Product />} />
          <Route path="/:alias" element={<Resolve />} />
          <Route path="/404" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
