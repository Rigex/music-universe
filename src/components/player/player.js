import './player.styl';

class Player {
  constructor(tracks) {
    this.element = new Audio();
    this.tracks = tracks;
    this.currentTrack = 0;
    this.delay = () => {};

    this.init();
  }

  get isPaused() {
    return this.element.paused;
  }

  init() {
    this.element.src = window.location + this.tracks[this.currentTrack];

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.audioSrc = this.audioCtx.createMediaElementSource(this.element);

    this.element.addEventListener('ended', () => {
      this.setTrack(this.currentTrack + 1, false);
    });
  }

  play() {
    this.element.play();
    document.dispatchEvent(new CustomEvent('playTrack'));
  }

  pause() {
    this.element.pause();
    document.dispatchEvent(new CustomEvent('pauseTrack'));
  }

  setTrack(trackId, pauseBeforeNextTrack = true) {
    if (trackId >= 0) {
      if (pauseBeforeNextTrack || trackId === this.tracks.length) {
        this.pause();
      }

      this.currentTrack = (trackId < this.tracks.length) ? trackId : 0;
      this.element.src = window.location + this.tracks[this.currentTrack];

      clearInterval(this.delay);
      this.delay = setTimeout(() => {
        this.play();
      }, 1500);

      const setTrackEvent = new CustomEvent('setTrack', {
        detail: { track: this.currentTrack }
      });

      document.dispatchEvent(setTrackEvent);
    }
  }

  next() {
    this.setTrack(this.currentTrack + 1);
  }

  prev() {
    this.setTrack(this.currentTrack - 1);
  }
}

module.exports = Player;
