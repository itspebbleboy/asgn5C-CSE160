import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; 
//^ optional three.js feature, let the user spin or orbit the camera around some point
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

import {MTLLoader} from 'three/addons/loaders/MTLLoader.js'; // to load MTL files

// LOADING OBJECTS IN THREE.JS, from: https://threejs.org/manual/#en/load-obj
// LIGHTS IN THREE.JS notes, from: https://threejs.org/manual/#en/lights

/*
OBJ NOTES:
make sure MTL file notes textures as the correct maps
ex:
    normal as norm,
    bump map as map_Bump

LIGHT NOTES:
use as few lights as possible, slows down the scene
AMBIENT LIGHT
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
vry flat, just multiplies the material's color by the light's color times the intensity.
    color = materialColor * light.color * light.intensity;
no direction, helps w/ making darks not too dark.

HEMISPHERELIGHT   
    takes sky color & ground color & multiplies the material's color between those 2 colors
    (sky color if obj's surface is pointing up & ground color if obj's surface is pointing down)
        ...
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    
DIRECTIONAL LIGHT (often used to represent the sun)
    no /point/ the light comes from, it's an infinite plane of light shooting out parallel rays of light.
        ...
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 10, 0); AND light.target.position.set(-5, 0, 0);
        scene.add(light); AND (light.target);
    
POINTLIGHT (sits @ a point & shoots light in all directions from that point)
        ...
        const light = new THREE.PointLight(color, intensity);
        light.position.set(0, 10, 0);
        scene.add(light);
SPOTLIGHT (point light w/ a cone attached where light only shines inside the cone.)
    actually utilizes 2 cones: outer cone & inner cone: between the inner & the outer the light fades from full intensity to zero
        ...    
        const light = new THREE.SpotLight(color, intensity);
        scene.add(light) AND (light.target)
    properties: 
        angle(radians) = spotlight's cone's angle
        penumbra(percentage from the outer cone) = inner cone
        when penumbra = ...
            0   -> inner cone = outer cone (no fade), 
            1   -> fade starts in the center of the cone to the outer cone
            0.5 -> fade starts from 50% between the center of the outer cone
    
RECT AREA LIGHT (rectangular area of light, like: long fluorescent light or frosted sky light in a ceiling)
    only works with the MeshStandardMaterial and the MeshPhysicalMaterial
    & needs: 
        import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
        import {RectAreaLightHelper} from 'three/addons/helpers/RectAreaLightHelper.js';
    & after renderer init needs: RectAreaLightUniformsLib.init(); call
        const light = new THREE.RectAreaLight(color, intensity, width, height);
        light.rotation.x = THREE.MathUtils.degToRad(-90);
    does not use a target, just uses rotation

*/

function main() {
    // #region // SCENE & CAMERA SET UP //
	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 45;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 10, 20 );
    // #endregion

	const controls = new OrbitControls( camera, canvas ); //let the user spin or orbit the camera around some point
    //input camera & DOM element to get input events
	controls.target.set( 0, 5, 0 );
	controls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );

	{// XY plane creation,

		const planeSize = 40;

		const loader = new THREE.TextureLoader();
		const texture = loader.load( 'https://threejs.org/manual/examples/resources/images/checker.png' );
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		const repeats = planeSize / 2;
		texture.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshPhongMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.rotation.x = Math.PI * - .5; //plane default = XY plane but ground in XZ plane (rotation needed).
		scene.add( mesh );

	}

	{// sky light creation

		const skyColor = 0xB1E1FF; // light blue
		const groundColor = 0xB97A20; // brownish orange
		const intensity = 2;
		const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		scene.add( light );

	}

	{// directional light creation

		const color = 0xFFFFFF;
		const intensity = 2.5;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( 0, 10, 0 );
		light.target.position.set( - 5, 0, 0 );
		scene.add( light );
		scene.add( light.target );

	}

	{//loading & adding windmill to scene

        const mtlLoader = new MTLLoader();
        //MTL, contains material data in this case:
        // has 2 materials referencing 5 jpg textures
        mtlLoader.load('./resources/windmill_001.mtl', (mtl) => { //loads the .MTL file, when finished loading:
            mtl.preload();
            /* to make materials double sided, OPTION 1, set every material to be doublesided:
            for (const material of Object.values(mtl.materials)) {
                material.side = THREE.DoubleSide;
            }
            */
            mtl.materials.Material.side = THREE.DoubleSide;
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl); //adds loaded materials onto the OBJ loader itself
            objLoader.load('./resources/windmill_001.obj', (root) => { //loads obj file, on load:
            /* to make materials double sisde OPTION 2, create materials ourselves instead of relying on .MTL
                objLoader.load('resources/models/windmill/windmill.obj', (root) => {
                const materials = {
                    Material: new THREE.MeshPhongMaterial({...}),
                    windmill: new THREE.MeshPhongMaterial({...}),
                };
                root.traverse(node => {
                    const material = materials[node.material?.name];
                    if (material) {
                    node.material = material;
                    }
                })
                scene.add(root);
            */
                scene.add(root);
            });
        });

	}

	function resizeRendererToDisplaySize( renderer ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}

	function render() {

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();
