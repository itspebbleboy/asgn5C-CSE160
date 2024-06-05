import * as THREE from 'three';
// FUNDAMENTALS OF THREE.JS, from: https://threejs.org/manual/#en/fundamentals
// three.js lib: https://github.com/mrdoob/three.js/blob/dev/build/three.module.js
/*
// SCENEGRAPH //
    program structure
    
    SCENE       < webGL renderer >      | perspective camera |
    |-> Directional Light
    |-> Mesh A
    |   |-> MeshPhuongMaterial
    |-> Mesh B
    |   |-> MeshPhuongMaterial
    |-> Mesh C
    |   |-> MeshPhuongMaterial
    |
    |-> Meshes A, B & C
    |   |-> Box Geometry
    
    the scene contains 3 Mesh obj e/a referencing the same geometry
    e/a Mesh references a unique MeshPhongMaterial so that e/a cube can have a diff color

// OTHER NOTES //
scene object:
    defines root of scenegraph (tree-like structure, w/ various objs) & contains props like background color & fog 
    these objs define a hierarchical parent/child tree like structure & rep where objs appear & how they're oriented

*/

function main() {

    const canvas = document.querySelector('#c');
    //responsible for data provided & rendering it to canvas
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas }); 
    
    // #region // CAMERA SET UP //
    // #region // FRUSTRUM SET UP //
    const fov = 75;     // feild of view, 75 degrees in vertical dimension (most other angles in three.js are radians)
    const aspect = 2;   // display aspect of the canvas, canvas default = 300x150 pixels (making aspect 300/150 or 2)
    // near & far, rep space in front of cam that will be rendered, anything before or after will be clipped (not drawn)
    const near = 0.1;   // closest distance from cam rendered
    const far = 5;      // farthest distance from cam rendered
    // 4 settings above = a frustum (pyramid w/ the tip sliced off)
    // height of the near and far planes r determined by fov, width of both planes r determined by fov & aspect
    //objs w/in defined frustum will be drawn (obj outside will not)
    // #endregion
    
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far); // defaults to looking down the -Z axis with +Y up
    camera.position.z = 2;
    // #endregion


    const scene = new THREE.Scene();

    // #region // LIGHT CREATION //
    /*
        directional lights have a pos & a target. both default: 0, 0, 0) 
        setting the light's pos to -1, 2, 4 (slightly left, above, & behind camera)
        target is still 0, 0, 0 (will shine towards origin)
    */
    {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }
    // #endregion

    // #region // BOX CREATION //

    // #region // SETTING UP GEOMETRY //
    // creating data for box, in three.js to display obj --> needs geometry
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth); // defines vertices of 3D object
    //BoxGeometry = three.js built in geometry primitive, can also create custom geometry or load geometry from files.

    // #endregion


    function makeInstance(geometry, color, x) {
        // #region // SETTING MATERIAL //
        
    
        // - const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 }); // greenish blue
        //      not affected by lights^^, changed to:
        const material = new THREE.MeshPhongMaterial({color});
        // represents the surface properties used to draw geometry 
            // like color, shiny or flat, can also reference texture obj(s) used to wrap image onto its surface
                // texture objs = images loaded from image files, generated from a canvas or rendered from another scene
        // #endregion

        // cube creation, represents: Geometry, Material, & 
        // position, orientation, & scale of the object in the scene relative to its parent. 
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube); //(parent of cube = scene)
        
        cube.position.x = x; //set x pos of cube
        
        return cube;
    }

    const cubes = [ // makes three cubes w/ the same BoxGeometry but diff colors & x pos
		makeInstance( geometry, 0x44aa88, 0 ),
		makeInstance( geometry, 0x8844aa, - 2 ),
		makeInstance( geometry, 0xaa8844, 2 ),
	];

    // #endregion

    function render(time) {

        time *= 0.001; // convert time to seconds

		cubes.forEach( ( cube, ndx ) => {

			const speed = 1 + ndx * .1;
			const rot = time * speed;
			cube.rotation.x = rot;
			cube.rotation.y = rot;

		} );

        renderer.render(scene, camera);

        requestAnimationFrame(render);

    }
    // a request to the browser that you want to animate something
    // parameter = function to be called (render)
    requestAnimationFrame(render); 

}

main();
