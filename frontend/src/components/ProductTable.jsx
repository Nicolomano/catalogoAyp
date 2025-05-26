import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';

export default function ProductTable() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axiosInstance.get('/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("❌ Error fetching products:", err));
  }, []);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Productos existentes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 border">Nombre</th>
              <th className="px-4 py-2 border">Precio USD</th>
              <th className="px-4 py-2 border">Precio ARS</th>
              <th className="px-4 py-2 border">Categoría</th>
              <th className="px-4 py-2 border">Código</th>
              <th className="px-4 py-2 border">Imagen</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 border">{product.name}</td>
                <td className="px-4 py-2 border">${product.priceUSD}</td>
                <td className="px-4 py-2 border">${product.priceARS}</td>
                <td className="px-4 py-2 border">{product.category}</td>
                <td className="px-4 py-2 border">{product.productCode}</td>
                <td className="px-4 py-2 border">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
