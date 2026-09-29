export const BOUTIQUE_PROFILE = {
  id: "boutique",
  label: "Boutique",

  categories: [
    { id: "ropa", label: "Ropa" },
    { id: "calzados", label: "Calzados" },
    { id: "accesorios", label: "Accesorios" }
  ],

  products: [
    {
      id: "btq-remera-001",
      sku: "BTQ-001",
      name: "Remera Oversize",
      categoryId: "ropa",
      description: "Remera oversize de corte relajado y uso diario.",
      image: "./assets/demo/boutique/remera-oversize.webp",
      gallery: [],
      badge: "Nuevo",
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
          amount: 89000
        },

        optionGroups: []
      }
    },

    {
      id: "btq-jean-001",
      sku: "BTQ-002",
      name: "Jean Mom Fit",
      categoryId: "ropa",
      description: "Jean mom fit de tiro alto y calce relajado.",
      image: "./assets/demo/boutique/jean-mom.webp",
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
          amount: 175000
        },

        optionGroups: []
      }
    },

    {
      id: "btq-zapatilla-001",
      sku: "BTQ-003",
      name: "Zapatilla Urbana",
      categoryId: "calzados",
      description: "Zapatilla urbana de diseño limpio para uso cotidiano.",
      image: "./assets/demo/boutique/zapatilla-urbana.webp",
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
          amount: 220000
        },

        optionGroups: []
      }
    },

    {
      id: "btq-cartera-001",
      sku: "BTQ-004",
      name: "Cartera Mini",
      categoryId: "accesorios",
      description: "Cartera compacta con formato versátil para todos los días.",
      image: "./assets/demo/boutique/cartera-mini.webp",
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
          amount: 135000
        },

        optionGroups: []
      }
    }
  ]
};
