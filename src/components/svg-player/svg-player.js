import * as d3 from 'd3';

import './svg-player.styl';

class SvgPlayer {
  constructor(player) {
    this.el = document.querySelector('.svg-player');
    this.player = player;
    this.timer = () => {};
    this.leftSpeaker = {
      high: { el: d3.select('.left-speaker__high-speaker') },
      low: { el: d3.select('.left-speaker__low-speaker') }
    };
    this.rightSpeaker = {
      high: { el: d3.select('.right-speaker__high-speaker') },
      low: { el: d3.select('.right-speaker__low-speaker') }
    };
    this.playerSpeaker = {
      left: { el: d3.select('.player__left-speaker') },
      right: { el: d3.select('.player__right-speaker') }
    };

    this.init();
  }

  init() {
    // Create audio analyser
    const { audioCtx, audioSrc } = this.player;

    this.analyser = audioCtx.createAnalyser();

    audioSrc.connect(this.analyser);
    audioSrc.connect(audioCtx.destination);

    // Store speakers radius
    this.leftSpeaker.high.radius = this.leftSpeaker.high.el.attr('r');
    this.leftSpeaker.low.radius = this.leftSpeaker.low.el.attr('r');
    this.rightSpeaker.high.radius = this.rightSpeaker.high.el.attr('r');
    this.rightSpeaker.low.radius = this.rightSpeaker.low.el.attr('r');
    this.playerSpeaker.left.radius = this.playerSpeaker.left.el.attr('r');
    this.playerSpeaker.right.radius = this.playerSpeaker.right.el.attr('r');

    // Bind events
    document.addEventListener('playTrack', () => {
      this.gearAnimation().start();
      this.renderSpeakerAnimation();
    }, false);

    document.addEventListener('pauseTrack', this.gearAnimation().stop, false);
  }

  gearAnimation() {
    const gearOne = this.el.querySelector('.svg-player__gear-1');
    const gearTwo = this.el.querySelector('.svg-player__gear-2');
    const bBoxOne = gearOne.getBBox();
    const bBoxTwo = gearTwo.getBBox();

    gearOne.style.transformOrigin = `${bBoxOne.x + (bBoxOne.width / 2)}px ${bBoxOne.y + (bBoxOne.height / 2)}px`;
    gearTwo.style.transformOrigin = `${bBoxTwo.x + (bBoxTwo.width / 2)}px ${bBoxTwo.y + (bBoxTwo.height / 2)}px`;

    return {
      start: () => {
        gearOne.classList.add('gear--active');
        gearTwo.classList.add('gear--active');
      },
      stop: () => {
        gearOne.classList.remove('gear--active');
        gearTwo.classList.remove('gear--active');
      }
    };
  }

  renderSpeakerAnimation() {
    const frequencyData = new Uint8Array(3);
    this.analyser.getByteFrequencyData(frequencyData);

    const getRadius = (value, range) => {
      const valPercent = (range[1] - range[0]) / 100;
      let result = (value / 2.55) * valPercent;
      result = (result >= range[0]) ? result : range[0];
      result = (result <= range[1]) ? result : range[1];
      return result;
    };

    this.leftSpeaker.high.el.attr('r', getRadius(frequencyData[2], [this.leftSpeaker.high.radius, 25]));
    this.leftSpeaker.low.el.attr('r', getRadius(frequencyData[0], [this.leftSpeaker.low.radius, 42]));

    this.rightSpeaker.high.el.attr('r', getRadius(frequencyData[2], [this.rightSpeaker.high.radius, 25]));
    this.rightSpeaker.low.el.attr('r', getRadius(frequencyData[0], [this.rightSpeaker.low.radius, 42]));

    this.playerSpeaker.left.el.attr('r', getRadius(frequencyData[1], [this.playerSpeaker.left.radius, 37]));
    this.playerSpeaker.right.el.attr('r', getRadius(frequencyData[1], [this.playerSpeaker.right.radius, 37]));


    this.timer = requestAnimationFrame(() => {
      this.renderSpeakerAnimation();
    });

    // stop animation if all frequency levels = 0
    if (this.player.isPaused) {
      let maxNum = 0;
      for (let i = 0; i < frequencyData.length; i += 1) {
        maxNum = (frequencyData[i] > maxNum) ? frequencyData[i] : maxNum;
      }
      if (maxNum <= 0) {
        cancelAnimationFrame(this.timer);
      }
    }
  }

}

module.exports = SvgPlayer;
