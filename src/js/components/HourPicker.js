/* global rangeSlider */

import {BaseWidget} from './BaseWidget.js';
import {select, settings} from '../settings.js';
import {utils} from '../utils.js';

export class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);

    const thisWidget = this;
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapper;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);

    thisWidget.value = settings.hours.open;

    thisWidget.initPlugin(thisWidget.value);
  }

  initPlugin() {
    const thisWidget = this;

    rangeSlider.create(thisWidget.dom.input, {
      onSlide: function(value) {
        thisWidget.value = value;
      },
    });

  }

  parseValue(newValue) {
    return utils.numberToHour(newValue);
  }

  isValid() {
    return true;
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}
