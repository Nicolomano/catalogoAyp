import React from "react";

const Navbar = () => {
    return (
        <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
            <div className="text-lg font-bold">
                <p href="/" >Catalogo Refrigeracion AyP</p>
            </div>
            <ul className="flex space-x-4">
            <li>
                <a href="/" className="hover:text-gray-400">Inicio</a>
            </li>
            <li>
                <a href="/admin" className="hover:text-gray-400">Admin</a>
            </li>
            </ul>
        </div>
        </nav>
    );
}

export default Navbar;
