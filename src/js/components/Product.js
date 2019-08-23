import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product {
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
    // console.log('new Product:', thisProduct);
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
    // console.log(button);

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
    // console.log('initOrderForm');

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
      thisProduct.addToCart();
    });

  }

  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  processOrder() {
    const thisProduct = this;
    // console.log('processOrder');

    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData:', formData);

    thisProduct.params = {};
    let price = thisProduct.data.price;
    // console.log(price);
    let paramsData = thisProduct.data.params;
    // console.log('params:', paramsData);

    /* START LOOP for every params */

    for (let paramId in paramsData) {

      const param = thisProduct.data.params[paramId];
      // console.log('param:', param);

      /* START LOOP for optionId */

      for (let optionId in param.options) {
        // console.log('optionId:', optionId);

        const option = param.options[optionId];
        // console.log('option:', option);

        /* START IF for check price */
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

        // console.log('option default:', option.default);
        if (optionSelected && !option.default) {
          /* add new option price to price variable */
          price = price + option.price;

          // console.log('new price:', price);

          /* END IF */

        }

        /* START IF for default options */

        else if (!optionSelected && option.default) {

          /* decrese option price to price variable */

          price = price - option.price;

          // console.log('new price after minus default:', price);

          /* END ELSE IF */
        }

        const images = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

        if (!thisProduct.params[paramId]) {
          thisProduct.params[paramId] = {
            label: param.label,
            options: {},
          };
        }

        thisProduct.params[paramId].options[optionId] = option.label;

        /* START IF */
        if (optionSelected) {
          for (let image of images) {
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          for (let image of images) {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }

        /* END LOOP */
      }

      /* END LOOP for every param */

    }

    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    thisProduct.priceElem.innerHTML = thisProduct.price;
    // console.log('params', thisProduct.params);
  }

  addToCart() {
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }


}
