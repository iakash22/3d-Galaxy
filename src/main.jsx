import './index.css'
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
);

camera.position.z = 3;
camera.position.y = 3;
camera.position.y = 3;
scene.add(camera);

const gui = new GUI();
const guiProps = {};
guiProps.size = 0.01;
guiProps.count = 100000;
guiProps.radius = 5;
guiProps.branch = 4;
guiProps.spin = 1;
guiProps.randomness = .2;
guiProps.power = 3;
guiProps.insideColor = "#ff6030";
guiProps.outsideColor = "#1b3984";
guiProps.starCount = 15000;


let particleGeometry = null;
let particleMaterial = null;
let particle = null;

const galaxy = () => {
    if (particle !== null) {
        particleGeometry.dispose();
        particleMaterial.dispose();
        scene.remove(particle);
    }
    particleGeometry = new THREE.BufferGeometry();
    const array = new Float32Array(guiProps.count * 3);
    const color = new Float32Array(guiProps.count * 3);

    for (let i = 0; i < guiProps.count; i++) {
        const radius = Math.random() * guiProps.radius;
        const branch = ((i % guiProps.branch / guiProps.branch) * Math.PI * 2);
        const spin = radius * guiProps.spin;
        const randomX = Math.pow(Math.random(), guiProps.power) * (Math.random() < 0.5 ? 1 : -1); // * guiProps.randomness * radius;
        const randomY = Math.pow(Math.random(), guiProps.power) * (Math.random() < 0.5 ? 1 : -1);  //* guiProps.randomness * radius;
        const randomZ = Math.pow(Math.random(), guiProps.power) * (Math.random() < 0.5 ? 1 : -1);  //* guiProps.randomness * radius;
        array[i * 3] = Math.cos(branch + spin) * radius + randomX;
        array[i * 3 + 1] = randomY;
        array[i * 3 + 2] = Math.sin(branch + spin) * radius + randomZ;

        const colorInside = new THREE.Color(guiProps.insideColor);
        const colorOutSide = new THREE.Color(guiProps.outsideColor);
        // colorInside.lerp(colorOutSide, 0.5)
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutSide, radius / guiProps.radius);

        color[i*3] = mixedColor.r;
        color[(i*3) + 2] = mixedColor.g;
        color[(i*3) + 3] = mixedColor.b;
    }


    particleGeometry.setAttribute('position', new THREE.BufferAttribute(array, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(color, 3));

    particleMaterial = new THREE.PointsMaterial({ size: guiProps.size, sizeAttenuation: true, vertexColors: true, blending : THREE.AdditiveBlending });
    particle = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particle);
}

galaxy();

gui.add(guiProps, 'count').min(1000).max(1000000).step(100).onFinishChange(galaxy);

gui.add(guiProps, 'size').min(0.00001).max(1).step(0.00001).onFinishChange(galaxy);
gui.add(guiProps, 'radius').min(0.1).max(20).step(0.01).onFinishChange(galaxy);
gui.add(guiProps, 'branch').min(2).max(7).step(1).onFinishChange(galaxy);
gui.add(guiProps, 'spin').min(-5).max(5).step(1).onFinishChange(galaxy);
gui.add(guiProps, 'randomness').min(0).max(2).step(0.01).onFinishChange(galaxy);
gui.add(guiProps, 'power').min(1).max(10).step(0.01).onFinishChange(galaxy);
gui.addColor(guiProps, 'insideColor').onFinishChange(galaxy);
gui.addColor(guiProps, 'outsideColor').onFinishChange(galaxy);


let starGeomatry = null;
let starMaterial = null;
let star = null;
const space = () => {
    if (star !== null) {
        starGeomatry.dispose();
        starMaterial.dispose();
        scene.remove(star);
    }
    starGeomatry = new THREE.BufferGeometry();
    const starArray = new Float32Array(guiProps.starCount * 3);

    for (let i = 0; i < guiProps.starCount * 3; i++) {
        starArray[i] = (Math.random() - 0.5) * camera.position.distanceTo(particle.position) * 50;
    }
    starGeomatry.setAttribute('position', new THREE.BufferAttribute(starArray, 3));
    starMaterial = new THREE.PointsMaterial({ size: 0.01, sizeAttenuation: true });
    star = new THREE.Points(starGeomatry, starMaterial);
    scene.add(star);
}

space();

gui.add(guiProps, 'starCount').min(10000).max(1000000).step(1000).onFinishChange(space);

const canvas = document.querySelector('#webgl');
// console.log(canvas);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const clock = new THREE.Clock();

const animate = () => {
    const e = clock.getElapsedTime();
    star.rotation.y = e / 8;
    particle.rotation.y = e / 8;

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
}

animate();


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});