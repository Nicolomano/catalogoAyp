import React from "react";
import { useState } from "react";
import { createProduct } from "../api/products.js";
import toast from "react-hot-toast";

export default function ProductsAdmin() {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      priceUSD: '',
      category: '',
      productCode: '',
      image: null,
    });
  
    const handleChange = (e) => {
      const { name, value, files } = e.target;
      if (name === 'image') {
        setFormData({ ...formData, image: files[0] });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
  
      try {
        await createProduct(data);
        toast.success("Producto creado");
        setFormData({
          name: '',
          description: '',
          priceUSD: '',
          category: '',
          productCode: '',
          image: null,
        });
      } catch (error) {
        toast.error("Hubo un error al crear el producto");
        console.error(error);
      }
    };
  
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Crear nuevo producto</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <input className="w-full p-2 border" type="text" name="name" placeholder="Nombre" onChange={handleChange} value={formData.name} />
          <input className="w-full p-2 border" type="text" name="description" placeholder="Descripción" onChange={handleChange} value={formData.description} />
          <input className="w-full p-2 border" type="number" name="priceUSD" placeholder="Precio (USD)" onChange={handleChange} value={formData.priceUSD} />
          <input className="w-full p-2 border" type="text" name="category" placeholder="Categoría" onChange={handleChange} value={formData.category} />
          <input className="w-full p-2 border" type="text" name="productCode" placeholder="Código de producto" onChange={handleChange} value={formData.productCode} />
          <input className="w-full p-2 border" type="file" name="image" accept="image/*" onChange={handleChange} />
          <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">Crear producto</button>
        </form>
      </div>
    );
  }
