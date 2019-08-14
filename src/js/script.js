/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      console.log('new Product:', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;

      /* generate HTML baseod on templte */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */

      const button = thisProduct.accordionTrigger;
      console.log(button);

      /* START: click event listener to trigger */

      button.addEventListener('click', function (event) {

        /* prevent default action for event */
        event.preventDefault();

        /* toggle active class on element of thisProduct */

        thisProduct.element.classList.toggle('active');

        /* find all active products */

        const activeProducts = document.querySelectorAll('.product.active');


        /* START LOOP: for each active product */
        for (let activeProduct of activeProducts) {

          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct != thisProduct.element) {

            /* remove class active for the active product */
            activeProduct.classList.remove('active');

            /* END: if the active product isn't the element of thisProduct */
          }

          /* END LOOP: for each active product */
        }

        /* END: click event listener to trigger */
      });

    }

    initOrderForm() {
      const thisProduct = this;
      console.log('initOrderForm');

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

    }

    initAmountWidget () {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', thisProduct.processOrder());
    }

    processOrder() {
      const thisProduct = this;
      console.log('processOrder');

      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData:', formData);

      let price = thisProduct.data.price;
      console.log(price);
      let paramsData = thisProduct.data.params;
      console.log('params:', paramsData);

      /* START LOOP for every params */

      for (let paramId in paramsData) {

        const param = thisProduct.data.params[paramId];
        console.log('param:', param);

        /* START LOOP for optionId */

        for (let optionId in param.options) {
          console.log('optionId:', optionId);

          const option = param.options[optionId];
          console.log('option:', option);

          /* START IF for check price */
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

          console.log('option default:', option.default);
          if (optionSelected && !option.default) {
            /* add new option price to price variable */
            price = price + option.price;

            console.log('new price:', price);

            /* END IF */

          }

          /* START IF for default options */

          else if (!optionSelected && option.default) {

            /* decrese option price to price variable */

            price = price - option.price;

            console.log('new price after minus default:', price);

            /* END ELSE IF */
          }

          const images = thisProduct.imageWrapper.querySelectorAll('.'+paramId+'-'+optionId);

          /* START IF */
          if (optionSelected) {
            for (let image of images) {
              image.classList.add('active');
            }
          }

          else {
            for (let image of images) {
              image.classList.remove('active');
            }
          }

          /* END LOOP */
        }

        /* END LOOP for every param */

      }

      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;

    }

  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.value);
      thisWidget.initActions(thisWidget.input.value);

      console.log('AmounWidget:', thisWidget);
      console.log('constructor arguments:', element);
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      /* TODO: Add validation */
      console.log('newValue:', newValue);
      console.log('actual value:',thisWidget.value);

      if (thisWidget.value != newValue && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
        thisWidget.announce();
        thisWidget.input.value = thisWidget.value;
      }
      else {
        thisWidget.input.value = thisWidget.value;
      }

    }

    initActions(value) {
      const thisWidget = this;
      console.log('value:',value);
      thisWidget.input.addEventListener('change', function(){
        var val = thisWidget.input.value;
        thisWidget.setValue(val);
      });
      thisWidget.linkDecrease.addEventListener('click', function() {
        var val = parseInt(thisWidget.input.value);
        console.log('value:', val);
        thisWidget.setValue(val - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(){
        var val = parseInt(thisWidget.input.value);
        console.log('value +', val);
        thisWidget.setValue(val + 1);
      });
    }

    announce() {
      const thisWidget = this;
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  const app = {
    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initMenu: function () {
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
