import jsmediatags from 'jsmediatags/dist/jsmediatags';

import './music-library.styl';
import svgLoader from '../../assets/loader.svg';

class Slider {
  constructor(itemsInfo, playTrack) {
    this.slider = document.querySelector('.music-library__slider');
    this.itemsInfo = itemsInfo;
    this.currentSlide = 0;
    this.playTrack = playTrack;

    this.init();
  }

  init() {
    const item = this.slider.querySelector('.music-library__item');

    for (let i = 0; i < this.itemsInfo.length; i += 1) {
      const newItem = item.cloneNode(true);
      newItem.querySelector('.cassette__title').textContent = this.itemsInfo[i].title;
      newItem.querySelector('.cassette__artist').textContent = this.itemsInfo[i].artist;
      newItem.dataset.trackId = i;
      this.slider.appendChild(newItem);
    }

    item.remove();

    this.updateSlider();
  }

  updateSlider() {
    const sliderItems = this.slider.querySelectorAll('.music-library__item');

    // Clean css classes
    for (let i = 0; i < sliderItems.length; i += 1) {
      sliderItems[i].classList.remove(
        'music-library__item--active',
        'music-library__item--prev',
        'music-library__item--next'
      );
    }

    // Active slide
    const activeSlide = sliderItems[this.currentSlide];
    activeSlide.classList.add('music-library__item--active');

    activeSlide.querySelector('.music-library__item__play-btn').onclick = () => {
      const currentTrack = parseInt(activeSlide.dataset.trackId, 10);
      this.setSlide(currentTrack);
      this.playTrack(currentTrack);
    };

    // Prev slide
    if (this.currentSlide > 0) {
      sliderItems[this.currentSlide - 1].classList.add('music-library__item--prev');

      this.slider.querySelector('.music-library__item--prev').onclick = (e) => {
        if (!e.currentTarget.classList.contains('music-library__item--prev')) return;
        this.prev();
      };
    }

    // Next slide
    if (this.currentSlide + 1 < this.itemsInfo.length) {
      sliderItems[this.currentSlide + 1].classList.add('music-library__item--next');

      this.slider.querySelector('.music-library__item--next').onclick = (e) => {
        if (!e.currentTarget.classList.contains('music-library__item--next')) return;
        this.next();
      };
    }
  }

  setSlide(index) {
    if (index >= 0 && index < this.itemsInfo.length) {
      this.currentSlide = index;
      this.updateSlider();
    }
  }

  next() {
    if (this.currentSlide + 1 < this.itemsInfo.length) {
      this.currentSlide += 1;
      this.updateSlider();
    }
  }

  prev() {
    if (this.currentSlide - 1 >= 0) {
      this.currentSlide -= 1;
      this.updateSlider();
    }
  }
}

class MusicLibrary {
  constructor(elemSelector, player) {
    this.element = document.querySelector(elemSelector);
    this.player = player;
    this.loader = this.element.querySelector('.music-library__loader');

    this.loader.classList.add('music-library__loader--active');
    this.loader.style.backgroundImage = `url('${svgLoader}')`;
    setTimeout(() => {
      MusicLibrary.getTracksInfo(this.player.tracks)
      .then(
        (result) => {
          this.init(result);
          this.loader.classList.remove('music-library__loader--active');
        },
        (err) => {
          console.log(err);
        }
      );
    }, 2000);
  }

  init(tracksInfo) {
    const slider = new Slider(tracksInfo, (track) => {
      this.player.setTrack(track);
    });

    document.addEventListener('setTrack', (e) => {
      slider.setSlide(e.detail.track);
    });

    // Close on click outside
    this.element.onclick = () => {
      this.close();
    };

    this.element.querySelector('.music-library__content').onclick = (event) => {
      event.stopPropagation();
    };
  }

  static getTracksInfo(links) {
    return new Promise((resolve) => {
      const getTrack = (linksArr, index, infoArr) => {
        new jsmediatags.Reader(window.location + linksArr[index])
          .setTagsToRead(['title', 'artist'])
          .read({
            onSuccess: (tag) => {
              infoArr.push({
                title: tag.tags.title,
                artist: tag.tags.artist
              });

              if (index < linksArr.length - 1) {
                getTrack(linksArr, (index + 1), infoArr);
              } else {
                resolve(infoArr);
              }
            },
            onError: (error) => { console.error(error); }
          });
      };

      getTrack(links, 0, []);
    });
  }

  open() {
    this.element.classList.add('music-library--visible');
  }

  close() {
    this.element.classList.remove('music-library--visible');
  }
}

module.exports = MusicLibrary;
