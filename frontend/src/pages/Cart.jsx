import { useCart } from "../Context/CartContext.jsx";

function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();

  if (cart.length === 0) {
    return <p className="text-center text-lg">🛒 El carrito está vacío</p>;
  }

  // calcular total
  const total = cart.reduce(
    (sum, item) => sum + item.priceARS * item.quantity,
    0
  );

  // preparar mensaje para WhatsApp
  const mensaje = `Hola, quiero hacer un pedido:\n\n${cart
    .map(
      (item) =>
        `- ${item.name} (Código: ${item.productCode}) x${
          item.quantity
        } - $${item.priceARS.toLocaleString("es-AR")} c/u`
    )
    .join("\n")}\n\nTotal: $${total.toLocaleString("es-AR")} ARS`;

  const urlWhatsapp = `https://wa.me/541168815837?text=${encodeURIComponent(
    mensaje
  )}`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tu pedido</h1>
      <ul className="space-y-4">
        {cart.map((item) => (
          <li
            key={item._id}
            className="flex justify-between items-center bg-white text-ayp p-4 rounded-lg shadow"
          >
            <div>
              <h2 className="font-bold">{item.name}</h2>
              <p>Cantidad: {item.quantity}</p>
              <p>{item.priceARS.toLocaleString("es-AR")} ARS c/u</p>
            </div>
            <button
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              onClick={() => removeFromCart(item._id)}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xl font-bold">
        Total: {total.toLocaleString("es-AR")} ARS
      </p>

      <div className="mt-6 flex space-x-4">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={clearCart}
        >
          Vaciar carrito
        </button>

        <a
          href={urlWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Finalizar pedido en WhatsApp
        </a>
      </div>
    </div>
  );
}

export default Cart;
