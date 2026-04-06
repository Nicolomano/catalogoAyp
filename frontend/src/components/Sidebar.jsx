import { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";

function AccordionSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-semibold text-gray-700 hover:text-blue-600"
      >
        {title}
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

function Sidebar({
  categories,
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  brands,
  selectedBrands,
  onBrandToggle,
  onClearAll,
  activeFilterCount,
  onClose, // para el drawer mobile
}) {
  const selectedCatData = categories.find((c) => c.category === selectedCategory);
  const subcategories = selectedCatData?.subcategories || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header (solo en drawer mobile) */}
      {onClose && (
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="font-bold text-gray-800 text-base">Filtros</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Limpiar filtros */}
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="w-full text-xs text-red-500 hover:text-red-700 text-left mb-2 flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Limpiar filtros ({activeFilterCount})
          </button>
        )}

        {/* Categorías */}
        <AccordionSection title="CATEGORÍAS" defaultOpen={true}>
          <div className="space-y-1">
            <button
              onClick={() => onCategoryChange("all")}
              className={`w-full text-left text-sm px-2 py-1.5 rounded transition ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Todas las categorías
            </button>
            {categories.map((c) => (
              <div key={c.category}>
                <button
                  onClick={() => onCategoryChange(c.category)}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded transition ${
                    selectedCategory === c.category
                      ? "bg-blue-600 text-white font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {c.category}
                </button>

                {/* Subcategorías si esta cat está seleccionada */}
                {selectedCategory === c.category && subcategories.length > 0 && (
                  <div className="ml-3 mt-1 space-y-0.5">
                    <button
                      onClick={() => onSubcategoryChange("all")}
                      className={`w-full text-left text-xs px-2 py-1 rounded transition ${
                        selectedSubcategory === "all"
                          ? "text-blue-600 font-semibold"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      — Todas
                    </button>
                    {subcategories.map((s) => (
                      <button
                        key={s}
                        onClick={() => onSubcategoryChange(s)}
                        className={`w-full text-left text-xs px-2 py-1 rounded transition ${
                          selectedSubcategory === s
                            ? "text-blue-600 font-semibold"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        — {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* Marcas */}
        {brands.length > 0 && (
          <AccordionSection title="MARCAS" defaultOpen={true}>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {brands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 px-1 py-1 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => onBrandToggle(brand)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{brand}</span>
                </label>
              ))}
            </div>
          </AccordionSection>
        )}
      </div>

      {/* Botón aplicar en drawer mobile */}
      {onClose && (
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm"
          >
            Ver resultados
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
