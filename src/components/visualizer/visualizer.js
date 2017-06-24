import * as d3 from 'd3';
import '../../helpers/canvas-5-polyfill';

import './visualizer.styl';
import backgroundImg from '../../assets/visualizer-bg.jpg';

class Visualizer {
  constructor(radiusRatio, frequency, player) {
    this.radiusRatio = radiusRatio;
    this.frequency = frequency;
    this.player = player;

    this.init();
  }

  init() {
    // Create audio analyser
    const { audioCtx, audioSrc } = this.player;

    this.analyser = audioCtx.createAnalyser();

    audioSrc.connect(this.analyser);
    audioSrc.connect(audioCtx.destination);

    // Create canvas
    this.angle = d3.scaleTime()
        .range([0, 2 * Math.PI]);

    this.canvas = document.querySelector('.visualizer');
    this.ctx = this.canvas.getContext('2d');

    this.setVisualizerSize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', () => {
      this.setVisualizerSize(window.innerWidth, window.innerHeight);
    });

    this.bgImg = new Image();
    this.bgImg.src = backgroundImg;
    this.bgImg.onload = () => {
      this.player.element.onplay = () => {
        this.render();
      };
    };
  }

  static formatData(data) {
    const result = [];
    for (let i = 0; i < data.length; i += 1) {
      result.push({
        index: i,
        value: data[i]
      });
    }
    return result;
  }

  setVisualizerSize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);

    this.configRadius = ((width + height) / 2) * this.radiusRatio;
    this.radius = d3.scaleLinear()
        .range([0, this.configRadius / 2]);

    this.area = d3.radialLine()
        .angle(d => this.angle(d.index))
        .radius(d => this.radius(d.value))
        .curve(d3.curveCardinalClosed);

    this.elemOffset = (((width + height) / 2) - this.configRadius) / 2;
    this.elemOffset = (this.configRadius / 2) - this.elemOffset;
  }

  render() {
    const frequencyData = new Uint8Array(this.frequency);

    this.analyser.getByteFrequencyData(frequencyData);
    const data = Visualizer.formatData(frequencyData);

    this.angle.domain([0, d3.max(data, d => d.index + 1)]);
    this.radius.domain([0, d3.max(data, d => d.value)]);

    const p = new Path2D(`${this.area(data)}Z`);
    const p2 = new Path2D(p);
    const p3 = new Path2D(p);

    if (Path2D.prototype.addPath !== undefined) {
      // Transform matrix
      const m = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGMatrix();
      m.a = 1; m.b = 0;
      m.c = 0; m.d = 1;
      m.e = this.elemOffset;
      m.f = 0;

      p.addPath(p2, m);
      m.e = -this.elemOffset;
      p.addPath(p3, m);
    }

    this.ctx.save();
    this.ctx.clip(p);
    this.ctx.drawImage(
      this.bgImg,
      -this.canvasWidth / 2,
      -this.canvasHeight / 2,
      this.bgImg.width,
      this.bgImg.height
    );
    this.ctx.restore();

    this.timer = requestAnimationFrame(() => {
      this.ctx.clearRect(
        -this.canvasWidth / 2,
        -this.canvasHeight / 2,
        this.canvasWidth,
        this.canvasHeight
      );
      this.render();
    }, this.canvas);

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

module.exports = Visualizer;
