import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";

import AdminLogin from "./pages/AdminLogin.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminConfig from "./pages/AdminConfig.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Catalogo />} />
          <Route path="product/:productCode" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route
            path="contacto"
            element={<div>📞 Próximamente contacto</div>}
          />
        </Route>

        {/* Admin: login público */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin: rutas protegidas anidadas */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} /> {/* /admin */}
          <Route path="dashboard" element={<AdminDashboard />} />{" "}
          {/* /admin/dashboard */}
          <Route path="products" element={<AdminProducts />} />{" "}
          {/* /admin/products */}
          <Route path="config" element={<AdminConfig />} />{" "}
          {/* /admin/config */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
