(function () {
    function ready(fn) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
      } else {
        fn();
      }
    }
  
    ready(function () {
      var group = document.querySelector('.actions-12[role="radiogroup"]');
      if (!group) return;
  
      var vehicleOptions = Array.prototype.slice.call(document.querySelectorAll('.vehicle-option'));
      vehicleOptions.forEach(function (opt) {
        if (!opt.hasAttribute('role')) opt.setAttribute('role', 'radio');
        if (!opt.hasAttribute('tabindex')) opt.setAttribute('tabindex', '0');
        if (!opt.hasAttribute('aria-checked')) opt.setAttribute('aria-checked', 'false');
      });
  
      var PRICES = {
        sedan: {
          quickExterior: 49,
          fullExterior: 99,
          quickInterior: 59,
          fullInterior: 109,
          maintenance: 99,
          showroom: 179,
          addonPetHair: 19,
          addonFabricProtect: 29,
          addonIronDecon: 39
        },
        suv: {
          quickExterior: 59,
          fullExterior: 109,
          quickInterior: 69,
          fullInterior: 119,
          maintenance: 109,
          showroom: 189,
          addonPetHair: 19,
          addonFabricProtect: 29,
          addonIronDecon: 39
        },
        truck: {
          quickExterior: 69,
          fullExterior: 139,
          quickInterior: 79,
          fullInterior: 129,
          maintenance: 119,
          showroom: 199,
          addonPetHair: 19,
          addonFabricProtect: 29,
          addonIronDecon: 39
        }
      };
  
      var priceEls = {};
      document.querySelectorAll('[data-price-id]').forEach(function (el) {
        priceEls[el.getAttribute('data-price-id')] = el;
      });
  
      function fmt(n) { return '$' + Number(n).toFixed(0); }
  
      function applyPrices(vehicleKey) {
        var set = PRICES[vehicleKey];
        if (!set) return;
        Object.keys(set).forEach(function (key) {
          if (priceEls[key]) {
            priceEls[key].textContent = fmt(set[key]);
          }
        });
      }
  
      function setActive(el) {
        vehicleOptions.forEach(function (opt) {
          opt.classList.remove('vehicle-active');
          opt.setAttribute('aria-checked', 'false');
        });
        el.classList.add('vehicle-active');
        el.setAttribute('aria-checked', 'true');
      }
  
      vehicleOptions.forEach(function (opt) {
        opt.addEventListener('click', function (e) {
          e.preventDefault();
          var key = this.getAttribute('data-vehicle');
          setActive(this);
          applyPrices(key);
        });
        opt.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
          }
        });
      });
  
      var defaultEl = document.querySelector('.vehicle-option[data-vehicle="sedan"]');
      if (defaultEl) {
        setActive(defaultEl);
        applyPrices('sedan');
      }
    });
  })();