import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { Observer } from './observer';


export const onMeshListUpdate = new Observer<{id: number, name: string}>();
export const onSceneListRemove = new Observer();
export const onSelectUpdate = new Observer();
let controls: FirstPersonControls;
let camera: THREE.PerspectiveCamera;
export let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
const loader = new GLTFLoader();
const clock = new THREE.Clock();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let selectedObject: THREE.Object3D<THREE.Object3DEventMap> | null = null;

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
	scene.background = new THREE.Color(0x87CEEB);
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
	if(selectedObject) {
		selectedObject.rotation.y += 0.01; // rotate the selected object
	}
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
		//object.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 4);
		console.log(object.rotation);
		object.scale.x *= 1.1;
		object.scale.y *= 1.1;
		object.scale.z *= 1.1;
	}
};

export async function updateSceneWithURL(URL: string): Promise<{id: number, name: string}>
{
    const model = await loader.loadAsync(URL);

	scene.add(model.scene);
	const id = model.scene.id;
	const name = model.scene.name;
	onMeshListUpdate.emit({id, name});
	return {id, name};
}

export function removeFromSceneWithID(id: number): boolean
{
	const object = scene.getObjectByProperty('id', id);
	if (object) {
		selectedObject = null
		scene.remove(object);
		console.log('success');
		onSceneListRemove.emit();
		return true;
	}
	console.log('fail');
	return false;
}

export function removeFromSceneSelectedObject(): boolean
{
	if (selectedObject) {
		scene.remove(selectedObject);
		selectedObject = null;
		return true;
	}
	return false;
}

export function setObjByID(id: number): boolean
{
	const object = scene.getObjectByProperty('id', id);
	if (object) {
		selectedObject = object;
		onSelectUpdate.emit();
		return true;
	}
	selectedObject = null;
	return false;
}

export function setObj(obj : THREE.Object3D<THREE.Object3DEventMap>): boolean
{
	if (obj) {
		selectedObject = obj;
		return true;
	}
	selectedObject = null;
	return false;
}

export function getSelectObjTransform(): {	position: THREE.Vector3
											rotation: THREE.Euler
											scale: THREE.Vector3 } | null
{
	if (selectedObject) {
		return { position: selectedObject.position,
				rotation: selectedObject.rotation,
				scale:selectedObject.scale
		};
	}

	return null;
}

export function getSelectedObjPosition(): THREE.Vector3
{
	if (selectedObject) {
		return selectedObject.position;
	}
	return new THREE.Vector3;
}

export function getSelectedObjRotation(): THREE.Euler
{
	if (selectedObject) {
		return selectedObject.rotation;
	}
	return new THREE.Euler;
}

export function getSelectedObjScale(): THREE.Vector3
{
	if (selectedObject) {
		return selectedObject.scale;
	}
	return new THREE.Vector3;
}

export function updateSelectedObjTransform(position: {x:number , y:number, z:number},
								rotation: {x:number , y:number, z:number},
								scale: {x:number , y:number, z:number},)
{
	if (selectedObject) {
		selectedObject.position.set(position.x, position.y, position.z);
        //selectedObject.rotation.set(rotation.x, rotation.y, rotation.z);
        selectedObject.scale.set(scale.x, scale.y, scale.z);
	}
}

export function addCube() 
{
	const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
	const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
	const cube = new THREE.Mesh( geometry, material ); 
	scene.add( cube );
	onMeshListUpdate.emit({ id: cube.id, name: cube.name || 'Cube' });
}

export function addPlane() 
{
	const geometry = new THREE.PlaneGeometry( 1, 1 );
	const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	const plane = new THREE.Mesh( geometry, material );
	scene.add( plane );
	onMeshListUpdate.emit({ id: plane.id, name: plane.name || 'Plane' });
}

export function addCapsule() 
{
	const geometry = new THREE.CapsuleGeometry( 1, 1, 4, 8 ); 
	const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
	const capsule = new THREE.Mesh( geometry, material );
	scene.add(capsule);
	onMeshListUpdate.emit({ id: capsule.id, name: capsule.name || 'Capsule' });
}

export function addCone()
{
	const geometry = new THREE.ConeGeometry( 5, 20, 32 ); 
	const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	const cone = new THREE.Mesh(geometry, material ); 
	scene.add( cone );
	onMeshListUpdate.emit({ id: cone.id, name: cone.name || 'Cone' });
}

export function addCylinder()
{
	const geometry = new THREE.CylinderGeometry( 5, 5, 20, 32 ); 
	const material = new THREE.MeshBasicMaterial( {color: 0xffff00} ); 
	const cylinder = new THREE.Mesh( geometry, material ); 
	scene.add( cylinder );
	onMeshListUpdate.emit({ id: cylinder.id, name: cylinder.name || 'Cylinder' });
}