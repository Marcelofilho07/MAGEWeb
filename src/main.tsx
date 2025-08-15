import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let mesh: THREE.Group<THREE.Object3DEventMap>;
let model[]: THREE.Object3D | undefined;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


const BasicShader = {

	name: 'BasicShader',

	uniforms: {},

	vertexShader: /* glsl */`
			precision mediump float;
			precision mediump int;

			uniform mat4 modelViewMatrix; // optional
			uniform mat4 projectionMatrix; // optional
			uniform float var;

			attribute vec3 position;
			attribute vec4 color;

			varying vec3 vPosition;
			varying vec4 vColor;

			void main()	{
				vPosition = position * var;
				vColor = color;

				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			}`,

	fragmentShader: /* glsl */`
			precision mediump float;
			precision mediump int;

			uniform float time;

			varying vec3 vPosition;
			varying vec4 vColor;

			void main()	{

				vec4 color = vec4( vColor );
				color.r += sin( vPosition.x * 10.0 + time ) * 0.5;

				gl_FragColor = color;

			}`,

};


init();

function init() {


	camera = new THREE.PerspectiveCamera( 42, 1, 0.01, 10 );
	camera.position.z = 3;

	scene = new THREE.Scene();
	const geometry = new THREE.BoxGeometry( 1, 1, 1 );
	const material = new THREE.MeshBasicMaterial( { color: 0x20ff10 } );
	const cube = new THREE.Mesh( geometry, material );
	cube.position.z = -5;
	cube.rotation.y = 0.5;
	//scene.add( cube );

	const loader = new GLTFLoader();


	loader.load( 'public/models/shiba/scene.gltf', function ( gltf ) {
	model = gltf.scene;
	scene.add(gltf.scene);
	}, undefined, function ( error ) {
	console.error( error );
	} );
	if(model){
		scene.add(model);
	}
	
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setAnimationLoop( animation );
	renderer.domElement.addEventListener('click', onClick);
}

function animation( time: number ) {

	// do not render if not in DOM:

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
	// const geometry = new THREE.BoxGeometry( xPos, xPos, xPos );
	// const material = new THREE.MeshBasicMaterial( { color: 0x20ff10 } );
	// const cube = new THREE.Mesh( geometry, material );
	// scene.add( cube );

  	if (model) {
    	model.rotation.y += 0.01;
    	model.scale.set(2, 2, 2);
  	}
}

function onClick(event: MouseEvent) {
	const rect = renderer.domElement.getBoundingClientRect();
	mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
	mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children);
	if (intersects.length > 0) {
		let object = intersects[0].object;
		console.log(object);
		
		// Traverse up to find the parent Group or object you want to select
		while (object.parent && object.parent.type !== 'Scene') {
			object = object.parent;
		}
		object.position.x += 0.1;
	}
};