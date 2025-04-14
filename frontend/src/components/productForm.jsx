import { useState } from "react";
import { createProduct } from "../api/products.js";

function ProductForm(){
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        priceUSD: "",
        category: "",
        productCode: "",
        image: null,
    })

    const [message, setMessage] = useState("");

    const handleChange =  (e) =>{
        const { name, value, files } = e.target;
        if(name === "image"){
            setFormData({
                ...formData,
                image: files[0]
            })
        }else{
            setFormData({
                ...formData, [name]: value
            })
        }
    }

    const handleSubmit = async (e) =>{
        e.preventDefault()
        try {
            const data = new FormData();
            for (const key in formData) {
                data.append(key, formData[key]);
            }
            const response = await createProduct(data);
            setMessage("Producto creado con exito")
            console.log(response);
        } catch (error) {
            console.error(error);
            setMessage("Error creando producto")
        }
    }


    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Crear nuevo producto</h2>
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <input type="text" name="name" placeholder="Nombre" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <input type="text" name="description" placeholder="Descripción" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <input type="number" name="priceUSD" placeholder="Precio (USD)" value={formData.priceUSD} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <input type="text" name="category" placeholder="Categoría" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <input type="text" name="productCode" placeholder="Código del producto" value={formData.productCode} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <input type="file" name="image" accept="image/*" onChange={handleChange} className="w-full px-4 py-2 border rounded-xl file:bg-blue-500 file:text-white file:border-none file:px-4 file:py-2 file:rounded-md hover:file:bg-blue-600" required />
            <button type="submit"  className="w-full py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition duration-200">Crear producto</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      );
}

export default ProductForm;