import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminProductForm from "./pages/productPage.jsx";
import "./App.css";
import CatalogPage from "./pages/catalogPage.jsx";
import Navbar from "./components/Navbar.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import UpdateExchangeRate from "./pages/UpdateExchangeRate.jsx";


function App() {
  return (
    <>
      <Navbar />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/admin" element={<AdminProductForm />} />
          <Route path="/admin" element={<AdminPanel />}>
            <Route path="products" element={<AdminProductForm />} />
            <Route path="exchange-rate" element={<UpdateExchangeRate />} />
          </Route>

          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
