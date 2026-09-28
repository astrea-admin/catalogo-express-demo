export const MAYORISTAS_PROFILE = {
  id: "mayoristas",
  label: "Mayoristas",

  categories: [
    { id: "descartables", label: "Descartables" },
    { id: "limpieza", label: "Limpieza" },
    { id: "insumos", label: "Insumos" }
  ],

  products: [
    {
      id: "may-vasos-001",
      sku: "MAY-001",
      name: "Caja de vasos térmicos",
      categoryId: "descartables",
      description: "Caja de vasos térmicos para cafeterías, eventos y comercios.",
      image: "./assets/demo/mayoristas/vasos-termicos.webp",
      gallery: [],
      badge: "Precio por volumen",
      active: true,

      purchase: {
        quantity: {
          unit: "box",
          label: "caja",
          min: 1,
          step: 1
        },

        pricing: {
          mode: "tiered",
          tiers: [
            { minQty: 1, amount: 85000 },
            { minQty: 3, amount: 72000 }
          ]
        },

        optionGroups: []
      }
    },

    {
      id: "may-servilletas-001",
      sku: "MAY-002",
      name: "Pack de servilletas",
      categoryId: "descartables",
      description: "Pack mayorista de servilletas para gastronomía y eventos.",
      image: "./assets/demo/mayoristas/servilletas.webp",
      gallery: [],
      badge: null,
      active: true,

      purchase: {
        quantity: {
          unit: "pack",
          label: "pack",
          min: 1,
          step: 1
        },

        pricing: {
          mode: "tiered",
          tiers: [
            { minQty: 1, amount: 55000 },
            { minQty: 3, amount: 46000 }
          ]
        },

        optionGroups: []
      }
    },

    {
      id: "may-detergente-001",
      sku: "MAY-003",
      name: "Caja de detergente",
      categoryId: "limpieza",
      description: "Caja cerrada de detergente para reposición comercial.",
      image: "./assets/demo/mayoristas/detergente.webp",
      gallery: [],
      badge: null,
      active: true,

      purchase: {
        quantity: {
          unit: "box",
          label: "caja",
          min: 1,
          step: 1
        },

        pricing: {
          mode: "tiered",
          tiers: [
            { minQty: 1, amount: 145000 },
            { minQty: 3, amount: 128000 }
          ]
        },

        optionGroups: []
      }
    },

    {
      id: "may-bolsas-001",
      sku: "MAY-004",
      name: "Pack bolsas camiseta",
      categoryId: "insumos",
      description: "Pack de bolsas camiseta para uso comercial y reposición.",
      image: "./assets/demo/mayoristas/bolsas-camiseta.webp",
      gallery: [],
      badge: null,
      active: true,

      purchase: {
        quantity: {
          unit: "pack",
          label: "pack",
          min: 1,
          step: 1
        },

        pricing: {
          mode: "tiered",
          tiers: [
            { minQty: 1, amount: 68000 },
            { minQty: 3, amount: 59000 }
          ]
        },

        optionGroups: []
      }
    }
  ]
};
