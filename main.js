import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; 
//^ optional three.js feature, let the user spin or orbit the camera around some point
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

import {MTLLoader} from 'three/addons/loaders/MTLLoader.js'; // to load MTL files

// asgn5A
//  A) a scene with at least 3 different primary shapes (e.g. cube, sphere, cylinder, etc), 
//      w/ at least one animated, 
//      a directional light source                  \
//      a camera w/ perspective projection.         \
//  B) at least one primary shape is textured       \
//  C) a custom textured 3D model (obj file)        \

//  EXTRA
//      orbit controls                              \
//      3 different light sources
//      a skybox in your scene using a cube map     \
//      at least 20 primary shapes 


function main() {
    // #region // SCENE & CAMERA SET UP //
	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	const fov = 45;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 500;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 10, 20 );
    // #endregion

	const controls = new OrbitControls( camera, canvas ); //let the user spin or orbit the camera around some point
    //input camera & DOM element to get input events
	controls.target.set( 0, 5, 0 );
	controls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );
        
    {//skybox
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
          './resources/sky.jpg',
          './resources/sky.jpg',
          './resources/sky1.jpg', //top
          './resources/grass1.jpg', //bottom
          './resources/sky.jpg',
          './resources/sky.jpg' //side
        ]);
        scene.background = texture;
    }

	{// ADDING LIGHT: SKYLIGHT

		const skyColor = 0xB1E1FF; // light blue
		const groundColor = 0xB97A20; // brownish orange
		const intensity = 1;
		const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		scene.add( light );

	}

	{// ADDING LIGHT: DIRECTIONALLIGHT 

		const color = 0xF7C452;
		const intensity = 4;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( 0, 40, 40 );
		light.target.position.set( 0, 0, -10 );
        light.castShadow = true;
		scene.add( light );
		scene.add( light.target );
        //Set up shadow properties for the light
        light.shadow.mapSize.width = 10000; // default
        light.shadow.mapSize.height = 10000; // default
        light.shadow.camera.top = 50; light.shadow.camera.bottom = -50; 
        light.shadow.camera.left = 50; light.shadow.camera.right = -50; 
        light.shadow.camera.near = 10; // default
        light.shadow.camera.far = 100; // default
        light.shadow.radius = 1.1;
	}

    {// ADDING LIGHT: AMBIENTLIGHT 
        const color = 0xF28B76;
        const intensity = 1
        const light = new THREE.AmbientLight(color, intensity);
        scene.add(light);
    }

	{// ADDING PRIMATIVE GEOMETRY: XY PLANE,
		const planeSize = 40;

		const loader = new THREE.TextureLoader();
		//const texture = loader.load( 'https://threejs.org/manual/examples/resources/images/checker.png' );
        const texture = loader.load( './resources/grass2.png' );
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.LinearFilter;
		const repeats = planeSize / 2;
		texture.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
        
        const planeMat = new THREE.MeshPhongMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
        mesh.receiveShadow = true;
		mesh.rotation.x = Math.PI * - .5; //plane default = XY plane but ground in XZ plane (rotation needed).
		scene.add( mesh );

	}

    let hills = [];
    let hillCoords = [
        [20, -5, 20], [20,-5,15], [20,-5,10], [20,-5,5], [20, -5, 0],
    ];
    let furtherHillCoords = [
        [30, 0, 30], [40, 0, 17] , [30, 0, 10], [30, 0, 0]
    ];
    let coneCoords = [
        [40, 0, 30],[30, 0, 20] , [40, 0, 0]
    ];
    {
        const loader = new THREE.TextureLoader();
        let textures = [
            loader.load( './resources/grass.jpg' ),
            loader.load( './resources/grass1.jpg' ),
            loader.load( './resources/grass2.png' )
        ]
        textures.forEach(texture =>{
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
        });
        let mats = [
            new THREE.MeshPhongMaterial( {
                map: textures[0],
                side: THREE.DoubleSide,
            } ),
            new THREE.MeshPhongMaterial( {
                map: textures[1],
                side: THREE.DoubleSide,
            } ),
            new THREE.MeshPhongMaterial( {
                map: textures[2],
                side: THREE.DoubleSide,
            } )
        ];
        
        let matrices = [
            [1,0,1], [1,0,-1], [-1,0,1], [-1,0,-1]
        ]

        hillCoords.forEach(coord => {
            hills.push(addHillInstance(coord, 1.5, 7));
        });
        furtherHillCoords.forEach(coord => {
            hills.push(addHillInstance(coord, 7, 12));
        });
        coneCoords.forEach(coord => {
            hills.push(addConeInstance(coord, 20, 30));
        });

        
        function addHillInstance(pos, radiusMax, radiusMin){
            const posMatrixA = math.matrix([ [pos[0], 0, 0],[0, pos[1], 0], [0, 0, pos[2]] ]);
            const posMatrixB = math.matrix([ [pos[2], 0, 0],[0, pos[1], 0], [0, 0, pos[0]] ]);
            const spheres= [];
            let sPos = [];
            matrices.forEach(matrix =>{
                const a = math.matrix(matrix)
                sPos.push( math.multiply(a,posMatrixA));
                sPos.push(math.multiply(a,posMatrixB));
            });
            
            sPos.forEach( function (matrix, i) {
                const geometry = new THREE.SphereGeometry( Math.random()*(radiusMax - radiusMin) + radiusMin, 6, 3,);
                const rand = Math.random()*3;
                /*let mat;
                if (rand < 3) mat = mats[0];
                else if(rand < 2) mat = mats[1];
                else mat = mats[2];
                console.log(mat);*/
                const sphere = new THREE.Mesh( geometry, mats[Math.floor(Math.random() * 3)] )
                //const sphere = new THREE.Mesh( geometry, mat )
                sphere.rotation.y = Math.random()*3
                sphere.rotation.z = Math.random()/5;

                sphere.position.set(matrix._data[0], matrix._data[1],matrix._data[2]);
                
                scene.add(sphere);
                spheres.push(sphere);
            });
            

            return (spheres);
        }
        function addConeInstance(pos, radiusMax, radiusMin){
            const posMatrixA = math.matrix([ [pos[0], 0, 0],[0, pos[1], 0], [0, 0, pos[2]] ]);
            const posMatrixB = math.matrix([ [pos[2], 0, 0],[0, pos[1], 0], [0, 0, pos[0]] ]);
            const spheres= [];
            let sPos = [];
            matrices.forEach(matrix =>{
                const a = math.matrix(matrix)
                sPos.push( math.multiply(a,posMatrixA));
                sPos.push(math.multiply(a,posMatrixB));
            });
            
            sPos.forEach( function (matrix, i) {
                const geometry = new THREE.ConeGeometry( Math.random()*(radiusMax - radiusMin) + radiusMin, 30, 10,);
                const rand = Math.random()*3;
                /*let mat;
                if (rand < 3) mat = mats[0];
                else if(rand < 2) mat = mats[1];
                else mat = mats[2];
                console.log(mat);*/
                const sphere = new THREE.Mesh( geometry, mats[Math.floor(Math.random() * 3)] )
                //const sphere = new THREE.Mesh( geometry, mat )
                sphere.rotation.y = Math.random()*3
                sphere.rotation.z = Math.random()/5;

                sphere.position.set(matrix._data[0], matrix._data[1],matrix._data[2]);
                
                scene.add(sphere);
                spheres.push(sphere);
            });
            

            return (spheres);
        }
    }


    
    
    function addOBJ(name, count, min, max) {
        let objs = [];
        const mtlLoader = new MTLLoader();
        mtlLoader.load('./resources/' + name + '.mtl', (mtl) => {
            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
    
            objLoader.load('./resources/' + name + '.obj', (root) => {
            
                scene.add(root);
                for (let i = 0; i < count; i++) {
                    root.castShadow = true;
                    let instance = root.clone(true);
                    instance.position.x = (Math.random()*(max-min)+min);
                    instance.position.z = (Math.random()*(max-min)+min);
                    instance.position.y=0;
                    instance.rotation.y = Math.random()*3;
                    instance.rotation.x = Math.random()/8;
                    instance.rotation.z = Math.random()/8;

                    // Add the instance to the scene
                    instance.phase = (Math.random() * 2 * Math.PI);
                    instance.traverse(function(child){child.castShadow = true; child.receiveShadow = true});
                    instance.castShadow = true;
                    instance.recieveShadow = true;
                    //if(name == 'tree' || name == 'pineTree') instance.castShadow = true;
                    scene.add(instance);
                    objs.push(instance);
                }
            });
        });
        return (objs);
    }
    
    let trees = [];
    let grass = [];
    
    trees.push(addOBJ('pineTree', 15, -14, 14))
    trees.push(addOBJ('tree', 20, -14, 14))
    addOBJ('rock1', 10, -14, 14);
    addOBJ('rock2', 7, -14, 14);
    addOBJ('rock3', 5, -14, 14);
    grass.push(addOBJ('grassBunch', 100, -14, 14))
    grass.push(addOBJ('grassStrand', 20, -14, 14));
    let grassSwayAmount = [];
    let treeSwayAmount = [];

    trees.forEach((tree, i) =>{
        treeSwayAmount = math.random()*(.01 - .005) + .005
    })
    grass.forEach((gra, i) =>{
        treeSwayAmount = math.random()*(.05 - .01) + .01
    })
	{//LOADING & ADDING 3D .OBJ: TREE

        const mtlLoader = new MTLLoader(); //.mtl, contains material data
        mtlLoader.load('./resources/tree.mtl', (mtl) => { //loads the .MTL file, when finished loading:
            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl); //adds loaded materials onto the OBJ loader itself
            objLoader.load('./resources/tree.obj', (root) => { //loads obj file, on load:
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
    console.log(scene)
	function render(time) {

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

        grass.forEach( list => {
            list.forEach( obj =>{
                const swayAmount = Math.sin(time*.001 + obj.phase); // Calculate sway factor
                obj.rotation.y = swayAmount * 0.1;
            });
        });
        
        trees.forEach( list => {
            list.forEach( (obj,i) =>{
                const swayAmount = Math.sin(time*.001 + obj.phase); // Calculate sway factor
                obj.rotation.z = swayAmount * 0.01;
                obj.rotation.x = swayAmount * 0.01;
            });
        });
        
		renderer.render( scene, camera );
		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();
