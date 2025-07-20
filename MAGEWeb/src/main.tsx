import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let points;
let geometry, material, material2;

init();

function init() {

	camera = new THREE.PerspectiveCamera( 42, 1, 0.01, 10 );
	camera.position.z = 1;

	scene = new THREE.Scene();
	const radius = .1;
	const widthSegments = 12;
	const heightSegments = 8;
	geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
	material = new THREE.PointsMaterial({
	color: 'red',
    sizeAttenuation: false,
    size: 3,       // in pixels
	});
	
	material2 = new THREE.PointsMaterial({
	color: 'blue',
    sizeAttenuation: false,
    size: 3,       // in pixels
	});
	points = new THREE.Points(geometry, material);
	scene.add(points);

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setAnimationLoop( animation );

}

function animation( time: number ) {

	// do not render if not in DOM:

	if( !renderer.domElement.parentNode ) return;

	points.rotation.x = time / 2000;
	points.rotation.y = time / 1000;

	points.material = new THREE.PointsMaterial({
		color: new THREE.Color( 1, 0, 1 ),
		sizeAttenuation: false,
		size: 3,       // in pixels
		});
	
	renderer.render( scene, camera );

}

// respond to size changes:

function resize() {

	const container = renderer.domElement.parentNode;

	if( container ) {

		const width = container.offsetWidth;
		const height = container.offsetHeight;

		renderer.setSize( width, height );

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

	}

}

window.addEventListener( 'resize', resize );

resize();


// expose a function to interact with react.js:

export function mount( container ) {

	if( container ) {

		container.insertBefore( renderer.domElement, container.firstChild );
		resize();

	} else {

		renderer.domElement.remove();

	}

}

export function updateCube(xPos: number) {
  points.position.x = xPos;
}