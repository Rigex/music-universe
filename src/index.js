import Player from './components/player/player';
import SvgPlayer from './components/svg-player/svg-player';
import Visualizer from './components/visualizer/visualizer';
import MusicLibrary from './components/music-library/music-library';

import tracks from './components/player/tracks';
import './components/footer/footer';
import './style.styl';

window.onload = () => {
  const musicPlayer = new Player(tracks);
  new SvgPlayer(musicPlayer); // eslint-disable-line no-new
  new Visualizer(0.8, 100, musicPlayer); // eslint-disable-line no-new
  const musicLibrary = new MusicLibrary('#music-library', musicPlayer);

  const playerBtn = {
    play: document.querySelector('.svg-player__play'),
    pause: document.querySelector('.svg-player__pause'),
    prev: document.querySelector('.svg-player__prev'),
    next: document.querySelector('.svg-player__next'),
    eject: document.querySelector('.svg-player__eject')
  };

  playerBtn.play.addEventListener('click', () => {
    musicPlayer.play();
  });

  playerBtn.pause.addEventListener('click', () => {
    musicPlayer.pause();
  });

  playerBtn.prev.addEventListener('click', () => {
    musicPlayer.prev();
  });

  playerBtn.next.addEventListener('click', () => {
    musicPlayer.next();
  });

  playerBtn.eject.addEventListener('click', () => {
    musicLibrary.open();
  });
};
