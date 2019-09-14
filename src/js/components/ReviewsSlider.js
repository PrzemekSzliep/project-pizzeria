

class ReviewsSlider {
  constructor() {
    const thisSlider = this;
    thisSlider.wrapper = document.querySelector('.content-reviews');
    thisSlider.reviews = thisSlider.wrapper.querySelectorAll('.content-review');
    thisSlider.firstreview = thisSlider.wrapper.firstElementChild;
    thisSlider.navs = thisSlider.wrapper.querySelector('.content-reviews-nav');
    thisSlider.index = 0;
    thisSlider.activeSlide = 0;

    thisSlider.initWidget();
    thisSlider.setFirstActive();
    setInterval(function(){
      thisSlider.changeSlide();
    }, 3000);

  }

  initWidget() {
    const thisSlider = this;

    for (let review of thisSlider.reviews) {
      thisSlider.index++;
      review.setAttribute('data-id', thisSlider.index);
      thisSlider.initNav();
    }
  }

  initNav() {
    const thisSlider = this;
    thisSlider.navs.insertAdjacentHTML('beforeend', '<div class="content-reviews-nav-btn" data-id="'+thisSlider.index+'"></div>');
  }

  setFirstActive() {
    const thisSlider = this;
    thisSlider.firstnavbtn = thisSlider.navs.firstElementChild;
    thisSlider.firstreview.classList.add('active');
    thisSlider.firstnavbtn.classList.add('active');
    thisSlider.activeSlide = 1;
  }

  changeSlide() {
    const thisSlider = this;
    thisSlider.wrapper.querySelector('.content-review.active').classList.remove('active');
    thisSlider.wrapper.querySelector('.content-reviews-nav-btn.active').classList.remove('active');
    if (thisSlider.activeSlide == thisSlider.index) {
      thisSlider.activeSlide = 1;
      thisSlider.wrapper.querySelector('.content-review[data-id="'+thisSlider.activeSlide+'"]').classList.add('active');
      thisSlider.wrapper.querySelector('.content-reviews-nav-btn[data-id="'+thisSlider.activeSlide+'"]').classList.add('active');
    } else {
      thisSlider.activeSlide++;
      thisSlider.wrapper.querySelector('.content-review[data-id="'+thisSlider.activeSlide+'"]').classList.add('active');
      thisSlider.wrapper.querySelector('.content-reviews-nav-btn[data-id="'+thisSlider.activeSlide+'"]').classList.add('active');
    }
  }
}

new ReviewsSlider();
