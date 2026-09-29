export const COCINA_PROFILE = {
  id: "cocina",
  label: "Cocina",

  categories: [
    { id: "platos", label: "Platos" },
    { id: "combos", label: "Combos" },
    { id: "bebidas", label: "Bebidas" }
  ],

  products: [
    {
      id: "coc-milanesa-001",
      sku: "COC-001",
      name: "Milanesa de carne",
      categoryId: "platos",
      description: "Milanesa de carne con guarnición a elección.",
      image: "./assets/demo/cocina/milanesa-carne.webp",
      gallery: [],
      badge: "Plato del día",
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
          amount: 38000
        },

        optionGroups: [
          {
            id: "side",
            label: "Elegí tu guarnición",
            required: true,
            maxSelections: 1,

            options: [
              { id: "arroz-kesu", label: "Arroz kesú" },
              { id: "fideo-pesto", label: "Fideo al pesto" },
              { id: "pure-papas", label: "Puré de papas" }
            ]
          }
        ]
      }
    },

    {
      id: "coc-pollo-001",
      sku: "COC-002",
      name: "Pollo grillado",
      categoryId: "platos",
      description: "Pollo grillado con guarnición a elección.",
      image: "./assets/demo/cocina/pollo-grillado.webp",
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
          amount: 42000
        },

        optionGroups: [
          {
            id: "side",
            label: "Elegí tu guarnición",
            required: true,
            maxSelections: 1,

            options: [
              { id: "arroz-kesu", label: "Arroz kesú" },
              { id: "ensalada-fresca", label: "Ensalada fresca" },
              { id: "papas-rusticas", label: "Papas rústicas" }
            ]
          }
        ]
      }
    },

    {
      id: "coc-hamburguesa-001",
      sku: "COC-003",
      name: "Combo hamburguesa",
      categoryId: "combos",
      description: "Hamburguesa, papas y bebida en una opción simple.",
      image: "./assets/demo/cocina/combo-hamburguesa.webp",
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
          amount: 39000
        },

        optionGroups: []
      }
    },

    {
      id: "coc-limonada-001",
      sku: "COC-004",
      name: "Limonada de la casa",
      categoryId: "bebidas",
      description: "Limonada fresca preparada al momento.",
      image: "./assets/demo/cocina/limonada.webp",
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
          amount: 15000
        },

        optionGroups: []
      }
    }
  ]
};
