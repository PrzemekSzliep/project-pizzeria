import {templates, select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    thisBooking.html = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom.peopleAmount = thisBooking.html.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.html.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.html.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.html.querySelector(select.widgets.hourPicker.wrapper);


    thisBooking.dom.wrapper.appendChild(thisBooking.html);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.table = '';
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector('.booking-form');
    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function () {
        if (thisBooking.table) {
          document.querySelector('[data-table="' + thisBooking.table + '"]').classList.remove(classNames.booking.tableBooked);
        }
        let id = table.getAttribute('data-table');
        table.classList.add(classNames.booking.tableBooked);
        thisBooking.table = id;
      });
    }

    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.Book();
    });

  }

  getData() {
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };


    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function ([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]) {
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let event of eventsCurrent) {
      thisBooking.makeBooked(event.date, event.hour, event.duration, event.table);
    }

    for (let event of bookings) {
      thisBooking.makeBooked(event.date, event.hour, event.duration, event.table);
    }

    for (let event of eventsRepeat) {
      thisBooking.makeBooked(event.date, event.hour, event.duration, event.table);
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (!thisBooking.booked[date]) {
      thisBooking.booked[date] = {};
    }

    let time = hour.split(':');
    if (time[1] === '30') hour = `${time[0]}.5`;
    else hour = time[0];

    if (!thisBooking.booked[date][hour]) {
      thisBooking.booked[date][hour] = [];
    }

    thisBooking.booked[date][hour].push(table);

    hour = hour - (-duration);

    if (!thisBooking.booked[date][hour]) {
      thisBooking.booked[date][hour] = [];
    }

    thisBooking.booked[date][hour].push(table);

    console.log('BOOKED', thisBooking.booked);

  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    for (let table of thisBooking.dom.tables) {
      const tableNumber = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
      if (thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour] && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableNumber)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }

  Book() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;
    thisBooking.starters = thisBooking.dom.wrapper.querySelectorAll('input[name="starter"]');

    const bookinfo = {
      date: thisBooking.date,
      hour: thisBooking.hour,
      table: thisBooking.table,
      repeat: false,
      duration: thisBooking.hoursAmount,
      ppl: thisBooking.peopleAmount,
      starters: []
    };
    for (let starter of thisBooking.starters) {
      let name = '';
      if (starter.checked) {
        name = starter.value;
      }
      bookinfo.starters.push(name);
    }


    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookinfo),

    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }
}
