import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Catalogo />} />
          <Route
            path="product/:productCode"
            element={<ProductDetail />}
          ></Route>
          <Route path="cart" element={<Cart />} />
          <Route path="contacto" element={<div>📞 Contacto pronto aquí</div>} />
          <Route path="admin" element={<div>🔑 Panel admin</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
