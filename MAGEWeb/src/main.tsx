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
let points,finalSphere;
let geometry, material, material2;


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


	// geometry
	// nr of triangles with 3 vertices per triangle
	const vertexCount = 200 * 3;

	const geometryT = new THREE.BufferGeometry();

	const positions = [];
	const colors = [];

	for ( let i = 0; i < vertexCount; i ++ ) {

		// adding x,y,z
		positions.push( Math.random() - 0.5 );
		positions.push( Math.random() - 0.5 );
		positions.push( Math.random() - 0.5 );

		// adding r,g,b,a
		colors.push( Math.random() * 255 );
		colors.push( Math.random() * 255 );
		colors.push( Math.random() * 255 );
		colors.push( Math.random() * 255 );

	}

	const positionAttribute = new THREE.Float32BufferAttribute( positions, 3 );
	const colorAttribute = new THREE.Uint8BufferAttribute( colors, 4 );

	colorAttribute.normalized = true; // this will map the buffer values to 0.0f - +1.0f in the shader

	geometryT.setAttribute( 'position', positionAttribute );
	geometryT.setAttribute( 'color', colorAttribute );

	const sphere = new THREE.SphereGeometry(radius,widthSegments, heightSegments);				
	const sphereMaterial = new THREE.RawShaderMaterial( {
					uniforms: {
						time: { value: 1.0 }
					},
					vertexShader: BasicShader.vertexShader,
					fragmentShader: BasicShader.fragmentShader,
					side: THREE.DoubleSide,
					transparent: false
				} );

	finalSphere = new THREE.Mesh(geometryT, sphereMaterial);
	scene.add(finalSphere);

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

	time = performance.now();

	const object = scene.children[ 0 ];

	object.rotation.y = time * 0.0005;
	object.material.uniforms.time.value = time * 0.005;

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
  	finalSphere.position.x = xPos;

  	const object = scene.children[ 0 ];
	object.material.uniforms.var = 0.0;
}