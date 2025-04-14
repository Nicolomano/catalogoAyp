import axiosInstance from './axios.js';

export const getProducts = async (category = '') => {

    try {
        const res = await axiosInstance.get(`/products?category=${category}`);
  return res.data;
    } catch (error) {
        console.error("Error al obtener productos:", error);
        throw error;
    }
};


export const createProduct = async (product) => {
    console.log("🔗 API base:", import.meta.env.VITE_API_URL);

    try {
      const res = await axiosInstance.post('/products', product, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    } catch (error) {
      console.error("Error al crear producto:", error.response?.data || error.message);
      throw error;
    }
}
