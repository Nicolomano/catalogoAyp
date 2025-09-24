import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";

function ProductDetail() {
  const { productCode } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/products/code/${productCode}`) // o `/products/code/${code}` si usás productCode
      .then((res) => setProduct(res.data))
      .catch((err) => console.error("❌ Error cargando producto:", err))
      .finally(() => setLoading(false));
  }, [productCode]);
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-ayp">
        <p className="text-white text-xl">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-ayp">
        <p className="text-white text-xl mb-4">Producto no encontrado</p>
        <Link
          to="/"
          className="bg-white text-ayp px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-ayp min-h-screen p-8">
      <div className="bg-white text-ayp rounded-xl shadow-lg max-w-3xl mx-auto overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-80 object-cover"
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold uppercase">{product.name}</h1>
          <p className="text-gray-600 mt-2">{product.description}</p>
          <p className="text-2xl font-bold text-ayp mt-4">
            {product.priceARS} ARS
          </p>
          <button className="mt-6 bg-ayp text-white px-6 py-2 rounded-lg hover:bg-ayp-dark transition">
            Agregar al pedido
          </button>
          <Link
            to="/"
            className="block mt-4 text-sm text-blue-600 hover:underline"
          >
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
