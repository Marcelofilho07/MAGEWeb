import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Observer } from './observer';
import { EffectComposer, FXAAShader, OrbitControls, OutlinePass, OutputPass, RenderPass, ShaderPass } from 'three/examples/jsm/Addons.js';

export const onMeshListUpdate = new Observer<{id: number, name: string}>();
export const onSceneListRemove = new Observer();
export const onSelectUpdate = new Observer();
export let scene: THREE.Scene;

let controls: OrbitControls;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
const loader = new GLTFLoader();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();
let placeholderTexture: THREE.Texture
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObjects: THREE.Object3D<THREE.Object3DEventMap>[] = [];
let selectedObject: THREE.Object3D<THREE.Object3DEventMap> | null = null;
let composer: EffectComposer;
let effectFXAA: ShaderPass;
let outlinePass: OutlinePass;

init();

function init() {
	camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
	camera.position.set(0, 2, 5); // pull it back and up slightly

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x87CEEB);

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize(window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( animation );
	renderer.domElement.addEventListener('click', onClick);

	// Set up controls
	controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);

	// Set up some lights
	const ambientColor = 0xFFFFFF;
	const ambientIntensity = 2;
	const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
	scene.add(ambientLight);

	const directionalColor = 0xFFFFFF;
	const directionalIntensity = 2;
	const directionalLight = new THREE.DirectionalLight(directionalColor, directionalIntensity);
	directionalLight.position.set(5, 5, 5);
	directionalLight.target.position.set(0, 0, 0);
	scene.add(directionalLight);
	scene.add(directionalLight.target);

	const pointColor = 0xFFFFFF;
	const pointIntensity = 100;
	const pointLight = new THREE.PointLight(pointColor, pointIntensity);
	pointLight.position.set(5, 5, 5);
	scene.add(pointLight);

	
	placeholderTexture = textureLoader.load( 'placeholder_texture/templategrid_albedo.png' );
	placeholderTexture.colorSpace = THREE.SRGBColorSpace;

	// postprocessing
	composer = new EffectComposer( renderer );

	const renderPass = new RenderPass( scene, camera );
	composer.addPass( renderPass );

	outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
	composer.addPass( outlinePass );

	textureLoader.load( 'textures/tri_pattern.jpg', function ( texture ) {

		outlinePass.patternTexture = texture;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;

	} );

	const outputPass = new OutputPass();
	composer.addPass( outputPass );

	effectFXAA = new ShaderPass( FXAAShader );
	effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1	 / window.innerHeight );
	composer.addPass( effectFXAA );
}

function animation() {
	controls.update( clock.getDelta() );
	composer.render();
}

// respond to size changes:

function resize() {

	const container = renderer.domElement.parentNode;

	if( container ) {
		renderer.setSize( container.offsetWidth, container.offsetHeight );

		camera.aspect = container.offsetWidth / container.offsetHeight;
		camera.updateProjectionMatrix();
	}
}

window.addEventListener( 'resize', resize );

// mount scene with React:
export function mount( container : ParentNode | null) {

	if( container ) {
		container.insertBefore( renderer.domElement, container.firstChild );
		resize();
	} else {
		renderer.domElement.remove();
	}
}

export function updateMeshList() {
	const container = renderer.domElement.parentNode;
	
	if( container ) {
		container.insertBefore( renderer.domElement, container.firstChild );
		resize();
	} else {
		renderer.domElement.remove();
	}
}

function addSelectedObject( object: THREE.Object3D<THREE.Object3DEventMap>) {
	selectedObjects = [];
	selectedObjects.push( object );
}

function onClick(event: MouseEvent) {
	const rect = renderer.domElement.getBoundingClientRect();
	mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
	mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children);
	if (intersects.length > 0) {
		let object = intersects[0].object;

		// Traverse up to find the parent Group or object you want to select
		while (object.parent && object.parent.type !== 'Scene') {
			object = object.parent;
		}
		selectedObject = object;
		onSelectUpdate.emit();
		
		addSelectedObject( selectedObject );
		outlinePass.selectedObjects = selectedObjects;
	}
};

export async function updateSceneWithURL(URL: string): Promise<{id: number, name: string}> {
    const model = await loader.loadAsync(URL);

	model.scene.traverse((child) => {
		if ((child as THREE.Mesh).isMesh) {
			const mesh = child as THREE.Mesh;

			const mat = mesh.material as THREE.Material;

			// Replace non-light-reactive materials
			if (mat.type === 'MeshBasicMaterial') {
				const basic = mat as THREE.MeshBasicMaterial;

				mesh.material = new THREE.MeshPhongMaterial({
				color: basic.color.clone(),
				map: basic.map || null,
				});
			}
		}
	});

	scene.add(model.scene);
	const id = model.scene.id;
	const name = model.scene.name;
	onMeshListUpdate.emit({id, name});
	return {id, name};
}

export function removeFromSceneWithID(id: number): boolean {
	const object = scene.getObjectByProperty('id', id);
	if (object) {
		selectedObject = null
		scene.remove(object);
		onSceneListRemove.emit();
		return true;
	}
	return false;
}

export function removeFromSceneSelectedObject(): boolean {
	if (selectedObject) {
		scene.remove(selectedObject);
		selectedObject = null;
		return true;
	}
	return false;
}

export function setObjByID(id: number): boolean {
	const object = scene.getObjectByProperty('id', id);
	if (object) {
		selectedObject = object;
		onSelectUpdate.emit();
		
		addSelectedObject( selectedObject );
		outlinePass.selectedObjects = selectedObjects;
		return true;
	}
	selectedObject = null;
	return false;
}

export function setObj(obj : THREE.Object3D<THREE.Object3DEventMap>): boolean {
	if (obj) {
		selectedObject = obj;
		return true;
	}
	selectedObject = null;
	return false;
}

export function getSelectObjTransform(): {	position: THREE.Vector3
											rotation: THREE.Euler
											scale: THREE.Vector3 } | null {
	if (selectedObject) {
		return { position: selectedObject.position,
				rotation: selectedObject.rotation,
				scale:selectedObject.scale
		};
	}

	return null;
}

export function getSelectedObjPosition(): THREE.Vector3 {
	if (selectedObject) {
		return selectedObject.position;
	}
	return new THREE.Vector3;
}

export function getSelectedObjRotation(): {x: number, y: number, z: number} {
	if (selectedObject) {
		return {
				x: THREE.MathUtils.radToDeg(selectedObject.rotation.x), 
				y: THREE.MathUtils.radToDeg(selectedObject.rotation.y), 
				z: THREE.MathUtils.radToDeg(selectedObject.rotation.z)
			} ;
	}
	return {x: 0, y: 0, z: 0};
}

export function getSelectedObjScale(): THREE.Vector3 {
	if (selectedObject) {
		return selectedObject.scale;
	}
	return new THREE.Vector3;
}

export function updateSelectedObjTransform(position: {x:number , y:number, z:number},
								rotation: {x:number , y:number, z:number},
								scale: {x:number , y:number, z:number},) {
	if (selectedObject) {
		selectedObject.position.set(position.x, position.y, position.z);

		selectedObject.rotation.set(
      			THREE.MathUtils.degToRad(rotation.x),
      			THREE.MathUtils.degToRad(rotation.y),
      			THREE.MathUtils.degToRad(rotation.z)
    			);
        selectedObject.scale.set(scale.x, scale.y, scale.z);
	}
}

export function addCube() {
	const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
	const material = new THREE.MeshPhongMaterial( {color: 'grey', map: placeholderTexture} ); 
	const cube = new THREE.Mesh( geometry, material ); 
	scene.add( cube );
	onMeshListUpdate.emit({ id: cube.id, name: cube.name || 'Cube' });
}

export function addPlane() {
	const geometry = new THREE.PlaneGeometry( 20, 20 );
	const material = new THREE.MeshPhongMaterial( {color: 'grey', map: placeholderTexture, side: THREE.DoubleSide} );
	const plane = new THREE.Mesh( geometry, material );
	plane.rotateX(1.57);
	plane.position.setY(-0.5);
	scene.add( plane );
	onMeshListUpdate.emit({ id: plane.id, name: plane.name || 'Plane' });
}

export function addCapsule() {
	const geometry = new THREE.CapsuleGeometry( 1, 1, 4, 8 ); 
	const material = new THREE.MeshPhongMaterial( {color: 'grey', map: placeholderTexture} ); 
	const capsule = new THREE.Mesh( geometry, material );
	scene.add(capsule);
	onMeshListUpdate.emit({ id: capsule.id, name: capsule.name || 'Capsule' });
}

export function addCone() {
	const geometry = new THREE.ConeGeometry( 1, 1, 32 ); 
	const material = new THREE.MeshPhongMaterial( {color: 'grey', map: placeholderTexture} );
	const cone = new THREE.Mesh(geometry, material ); 
	scene.add( cone );
	onMeshListUpdate.emit({ id: cone.id, name: cone.name || 'Cone' });
}

export function addCylinder() {
	const geometry = new THREE.CylinderGeometry( 1, 1, 2, 32 );
	const material = new THREE.MeshPhongMaterial( {color: 'grey', map: placeholderTexture} );
	const cylinder = new THREE.Mesh( geometry, material );
	scene.add( cylinder );
	onMeshListUpdate.emit({ id: cylinder.id, name: cylinder.name || 'Cylinder' });
}

export function getSelectedObj(): THREE.Object3D<THREE.Object3DEventMap> | null {
	return selectedObject;
}