import React from 'react';

const ProductCard = ({ product }) => {
  const { name, description, priceARS, image, productCode } = product;

  const whatsappMessage = `Hola! Estoy interesado en el producto "${name}" (código ${productCode}). ¿Podrían darme más info? Precio: $${priceARS}`;

  const whatsappLink = `https://wa.me/5491168815837?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-full max-w-sm hover:shadow-lg transition">
      <img
        src={image}
        alt={name}
        className="w-full h-64 object-cover rounded-xl mb-4"
      />
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
      <p className="text-lg font-bold text-green-700 mt-2">${priceARS.toLocaleString('es-AR')}</p>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
      >
        Consultar por WhatsApp
      </a>
    </div>
  );
};

export default ProductCard;

