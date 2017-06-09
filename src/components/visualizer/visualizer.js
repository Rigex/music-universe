import * as d3 from 'd3';
import '../../helpers/canvas-5-polyfill';

import './visualizer.styl';
import backgroundImg from '../../assets/visualizer-bg.jpg';

class Visualizer {
  constructor(radius, frequency, player) {
    this.configRadius = radius;
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

    this.radius = d3.scaleLinear()
        .range([0, (this.configRadius / 2) - 10]);

    this.area = d3.radialLine()
        .angle(d => this.angle(d.index))
        .radius(d => this.radius(d.value))
        .curve(d3.curveCardinalClosed);

    this.canvas = d3.select('.visualizer')
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight);

    this.canvasWidth = this.canvas.node().width;
    this.canvasHeight = this.canvas.node().height;

    this.ctx = this.canvas.node().getContext('2d');
    this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);

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
      m.e = 500; m.f = 0;

      p.addPath(p2, m);
      m.e = -500;
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
    }, this.canvas.node());

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
