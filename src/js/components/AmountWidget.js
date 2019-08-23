import {select, settings} from '../settings.js';

export class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    const val = element.querySelector('.amount').value;

    if (val == settings.amountWidget.defaultValue) {
      thisWidget.value = settings.amountWidget.defaultValue;
    } else {
      thisWidget.value = val;
    }


    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.value);
    thisWidget.initActions(thisWidget.input.value);

    // console.log('AmounWidget:', thisWidget);
    // console.log('constructor arguments:', element);
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

    // console.log('newValue:', newValue);
    // console.log('actual value:',thisWidget.value);

    if (thisWidget.value != newValue && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
      thisWidget.value = newValue;
      thisWidget.announce();
      thisWidget.input.value = thisWidget.value;
    } else {
      thisWidget.input.value = thisWidget.value;
    }

  }

  initActions(value) {
    const thisWidget = this;
    console.log('value', value);
    thisWidget.input.addEventListener('change', function () {
      let val = thisWidget.input.value;
      thisWidget.setValue(val);
    });
    thisWidget.linkDecrease.addEventListener('click', function () {
      let val = parseInt(thisWidget.input.value);
      // console.log('value:', val);
      thisWidget.setValue(val - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function () {
      let val = parseInt(thisWidget.input.value);
      // console.log('value +', val);
      thisWidget.setValue(val + 1);
    });
  }

  announce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}
