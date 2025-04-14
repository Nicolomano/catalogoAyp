import { useEffect, useState } from "react";
import React from "react";
import axiosInstance from "../api/axios.js";

const UpdateExchangeRate = () => {
    const [exchangeRate, setExchangeRate] = useState('');
    const [loading, setLoading] = useState(false);

    

    useEffect(() => {
        const fetchRate = async () => {
          try {
            const res = await axiosInstance.get('/config');
            setExchangeRate(res.data.exchangeRate);
          } catch (error) {
            console.error('Error al obtener el tipo de cambio', error);
          }
        };
        fetchRate();
      }, []);


      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await axiosInstance.put('/config', { exchangeRate });
          alert('Tipo de cambio actualizado correctamente');
        } catch (error) {
          console.error(error);
          alert('Error al actualizar el tipo de cambio');
        } finally {
          setLoading(false);
        }
      };


      return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Actualizar tipo de cambio</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              step="0.01"
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nuevo tipo de cambio"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Actualizar'}
            </button>
          </form>
        </div>
      );
    };
    
export default UpdateExchangeRate;