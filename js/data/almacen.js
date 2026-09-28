export const ALMACEN_PROFILE = {
  id: "almacen",
  label: "Almacén",

  categories: [
    { id: "frescos", label: "Frescos" },
    { id: "despensa", label: "Despensa" },
    { id: "bebidas", label: "Bebidas" }
  ],

  products: [
    {
      id: "alm-tomate-001",
      sku: "ALM-001",
      name: "Tomate",
      categoryId: "frescos",
      description: "Tomate fresco seleccionado, vendido por peso.",
      image: "./assets/demo/almacen/tomate.webp",
      gallery: [],
      badge: "Venta por peso",
      active: true,

      purchase: {
        quantity: {
          unit: "kg",
          label: "kg",
          min: 0.5,
          step: 0.5
        },

        pricing: {
          mode: "fixed",
          amount: 12000
        },

        optionGroups: []
      }
    },

    {
      id: "alm-queso-001",
      sku: "ALM-002",
      name: "Queso Paraguay",
      categoryId: "frescos",
      description: "Queso Paraguay fresco, fraccionado por peso.",
      image: "./assets/demo/almacen/queso-paraguay.webp",
      gallery: [],
      badge: "Venta por peso",
      active: true,

      purchase: {
        quantity: {
          unit: "kg",
          label: "kg",
          min: 0.25,
          step: 0.25
        },

        pricing: {
          mode: "fixed",
          amount: 48000
        },

        optionGroups: []
      }
    },

    {
      id: "alm-gaseosa-001",
      sku: "ALM-003",
      name: "Gaseosa Cola 2 L",
      categoryId: "bebidas",
      description: "Botella de gaseosa cola de 2 litros.",
      image: "./assets/demo/almacen/gaseosa-cola.webp",
      gallery: [],
      badge: null,
      active: true,

      purchase: {
        quantity: {
          unit: "unit",
          label: "unidad",
          min: 1,
          step: 1
        },

        pricing: {
          mode: "fixed",
          amount: 11000
        },

        optionGroups: []
      }
    },

    {
      id: "alm-yerba-001",
      sku: "ALM-004",
      name: "Yerba Mate 1 kg",
      categoryId: "despensa",
      description: "Paquete de yerba mate de 1 kg.",
      image: "./assets/demo/almacen/yerba-mate.webp",
      gallery: [],
      badge: null,
      active: true,

      purchase: {
        quantity: {
          unit: "unit",
          label: "unidad",
          min: 1,
          step: 1
        },

        pricing: {
          mode: "fixed",
          amount: 26000
        },

        optionGroups: []
      }
    }
  ]
};
