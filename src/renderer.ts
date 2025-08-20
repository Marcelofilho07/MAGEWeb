import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';


let controls: FirstPersonControls;
let camera: THREE.PerspectiveCamera;
export let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
const loader = new GLTFLoader();
const clock = new THREE.Clock();

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


	camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
	camera.position.set(0, 2, 5); // pull it back and up slightly

	scene = new THREE.Scene();
	
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setAnimationLoop( animation );
	renderer.domElement.addEventListener('click', onClick);

	controls = new FirstPersonControls(camera, renderer.domElement);
	controls.movementSpeed = 10;
	controls.lookSpeed = 0.0;
	//controls.dragToLook = true;       // mouse drag to look
	controls.autoForward = false;
}

function animation( time: number ) {

	// do not render if not in DOM:

  	//requestAnimationFrame(animation);
	controls.update( clock.getDelta() );
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

		controls.handleResize();
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

export function updateMeshList() {

	if( container ) {

		container.insertBefore( renderer.domElement, container.firstChild );
		resize();

	} else {

		renderer.domElement.remove();

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
		//console.log(object);
		
		// Traverse up to find the parent Group or object you want to select
		while (object.parent && object.parent.type !== 'Scene') {
			object = object.parent;
		}
		object.position.x += 1.0;
	}
};

export async function updateSceneWithURL(URL: string): Promise<{id: number, name: string}>
{
    const model = await loader.loadAsync(URL);

	scene.add(model.scene);
	const id = model.scene.id;
	const name = model.scene.name;
	return {id, name};
}

export function removeFromSceneWithID(id: number): boolean
{
	const object = scene.getObjectByProperty('id', id);
	if (object) {
		scene.remove(object);
		console.log('success');
		return true;
	}
	console.log('fail');
	return false;
}

export function getPosition(id: number): {x: number, y: number, z: number}
{
	const object = scene.getObjectByProperty('id', id);
	if (object) {
		const pos = object.position;
		return {x: pos.x, y: pos.y, z: pos.z};
	}
	return {x: 0, y: 0, z: 0};
}

export function getRotation(id: number): {x: number, y: number, z: number}
{
	const object = scene.getObjectByProperty('id', id);
	if (object) {
		const rot = object.rotation;
		return {x: rot.x, y: rot.y, z: rot.z};
	}
	return {x: 0, y: 0, z: 0};
}

export function getScale(id: number): {x: number, y: number, z: number}
{
	const object = scene.getObjectByProperty('id', id);
	if (object) {
		const scl = object.scale;
		return {x: scl.x, y: scl.y, z: scl.z};
	}
	return {x: 1, y: 1, z: 1};
}