export function initPricing() {
  if (typeof document === "undefined") return;

  const vehicleOptions = document.querySelectorAll(".vehicle-option");
  const priceElements = document.querySelectorAll("[data-price-id]");

  // Fallback example pricing map — adjust to your real numbers if needed
  const priceMap: Record<string, Record<string, string>> = {
    sedan: {
      quickExterior: "$49",
      fullExterior: "$119",
      quickInterior: "$79",
      fullInterior: "$149",
      maintenance: "$109",
      showroom: "$199",
      addonPetHair: "$19",
      addonFabricProtect: "$29",
      addonIronDecon: "$39",
    },
    suv: {
      quickExterior: "$59",
      fullExterior: "$139",
      quickInterior: "$99",
      fullInterior: "$169",
      maintenance: "$129",
      showroom: "$219",
      addonPetHair: "$25",
      addonFabricProtect: "$35",
      addonIronDecon: "$45",
    },
    truck: {
      quickExterior: "$69",
      fullExterior: "$159",
      quickInterior: "$119",
      fullInterior: "$189",
      maintenance: "$149",
      showroom: "$239",
      addonPetHair: "$35",
      addonFabricProtect: "$45",
      addonIronDecon: "$55",
    },
  };

  vehicleOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Toggle active class
      vehicleOptions.forEach((o) => o.classList.remove("vehicle-active"));
      option.classList.add("vehicle-active");

      const type = option.getAttribute("data-vehicle") || "sedan";

      // Update pricing
      priceElements.forEach((el) => {
        const id = el.getAttribute("data-price-id");
        if (!id) return;

        const newPrice = priceMap[type]?.[id];
        if (newPrice) el.textContent = newPrice;
      });
    });
  });
}