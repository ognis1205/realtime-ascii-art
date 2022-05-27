import * as THREE from 'three';
import mp4 from '../assets/video.mp4';
import fragment from '../shader/fragment.glsl';
import vertex from '../shader/vertex.glsl';
import * as DAT from 'dat.gui';
import { TimelineMax } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();
    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xEEEEEE, 1);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);
    var frustumSize = 1.4;
    var aspect = 1;
    this.camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      -1000,
      1000);
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;
    this.isPlaying = true;
    this.gridSize = 1;
    this.size = 50;
    this.cellSize = this.gridSize / this.size;
    this.createTexture();
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    this.initVideo();
  }

  initVideo() {
//    this.video = document.getElementById('video');
    this.video = document.createElement('video');
    this.video.src = mp4;
    this.video.muted = true;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.size;
    this.canvas.height = this.size;
//    document.body.appendChild(this.canvas);
//    this.video.addEventListener('play', () => {
//      this.timerCallback();
//    }, false);
    this.video.play().then(() => {
      this.timerCallback();
    });
  }

  timerCallback() {
    if (this.video.paused || this.video.ended) return;
    this.computeFrame();
    setTimeout(() => {
      this.timerCallback();
    }, 0);
  }

  computeFrame() {
    let scales = new Float32Array(this.size ** 2);
    this.ctx.drawImage(this.video, 0, 0, this.size, this.size);
    let imageData = this.ctx.getImageData(0, 0, this.size, this.size);
    for (let i = 0; i < imageData.data.length; i+=4)
      scales.set([1. - imageData.data[i] / 255], i / 4);
    this.plane.geometry.attributes.instanceScale.array = scales;
    this.plane.geometry.attributes.instanceScale.needsUpdate = true;
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new DAT.GUI();
    this.gui.add(this.settings, 'progress', 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.imageAspect = 853 / 1200;
    let a1;
    let a2;
    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = (this.height / this.width) / this.imageAspect;
    }
    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives: enabled',
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: 'f', value: 0 },
        chars: { type: 't', value: this.characterTexture },
        resolution: { type: 'v4', value: new THREE.Vector4() },
        uvRate1: { type: 'v2', value: new THREE.Vector2(1, 1) }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    });
    this.geometry = new THREE.PlaneBufferGeometry(this.cellSize, this.cellSize);
    this.plane = new THREE.InstancedMesh(this.geometry, this.material, this.size ** 2);
    let count = 0;
    let dummy = new THREE.Object3D();
    let scales = new Float32Array(this.size ** 2);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        dummy.position.set(j * this.cellSize - 0.5, - i * this.cellSize + 0.5);
        dummy.updateMatrix();
        scales.set([Math.random()], count);
        this.plane.setMatrixAt(count++, dummy.matrix);
      }
    }
    this.plane.instanceMatrix.needsUpdate = true;
    this.plane.geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 1));
    this.scene.add(this.plane);
  }

  createTexture() {
    this.chars = '`,:;_-^"Il!i><~+?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';
    this.characterCanvas = document.createElement('canvas');
    this.characterCanvas.style.position = 'fixed';
    this.characterCanvas.style.bottom = 0;
    this.characterCanvas.style.right = 0;
    this.characterCanvas.style.width = `${20 * this.chars.length}px`;
    this.characterCanvas.style.height = '20px';
    this.characterCanvas.width = `${20 * this.chars.length}`;
    this.characterCanvas.height = '20';
    const characterCtx = this.characterCanvas.getContext('2d');
    characterCtx.font = '100 20px helvetica';
    characterCtx.fillStyle = '#F5F1EE';
    characterCtx.fillRect(0, 0, this.chars.length * 20, 20);
    for (let i = 0; i < this.chars.length; i += 1) {
      const charWidth = characterCtx.measureText(this.chars[i]).width;
      characterCtx.fillStyle = '#000';
      characterCtx.fillText(this.chars[i], i * 20 + (20 - charWidth) / 2, 17);
    }
    this.characterTexture = new THREE.Texture(this.characterCanvas);
    this.characterTexture.needsUpdate = true;
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById('container')
});
