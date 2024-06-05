import * as THREE from 'three';

// TEXTURES IN THREE.JS, from: https://threejs.org/manual/#en/textures

/*
NOTES:
    MEMORY
    textures often use the most mem in a three.js app, taking up width * height * 4 * 1.33 bytes of memory
    make textures small in dimensions, not just small in file size
    small file size? fast download. small dimensions? less memory

    REPEATING, OFFSETTING, ROTATING, & WRAPPING A TEXTURE
    Textures have settings for repeating, offseting, &  rotating

    repeating
        by default textures in three.js do not repeat
        has 2 properties, wrapS for horizontal & wrapT for vertical, e/a can be set to one of:
            THREE.RepeatWrapping -> repeated
            THREE.MirroredRepeatWrapping -> mirrored & repeated
            THREE.ClampToEdgeWrapping -> last pixel on e/a edge is repeated forever
        someTexture.wrapS = THREE.RepeatWrapping;   //turns on horizontal wrapping
        someTexture.wrapT = THREE.RepeatWrapping;   //turns on vertical wrapping
        const timesToRepeatHorizontally = 4;        //sets to repeat 4 times horz
        const timesToRepeatVertically = 2;          //sets.. 2 times vert
        someTexture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically); //call to set # of reps

    offset
        set offset property. textures are offset w/ units: 1 unit = 1 texture size. 
        0 = no offset & 1 = offset one full texture amount

        const xOffset = .5;   // offset by half the texture
        const yOffset = .25;  // offset by 1/4 the texture
        someTexture.offset.set(xOffset, yOffset); //call to set offset
    rotating
        rotation property(radians), center property (center of rotation) default = 0,0 (rotates from the bottom left corner)
        again, 1 unit = 1 texture size center = .5, .5  = rotates around center of texture.
        someTexture.center.set(.5, .5); //^
        someTexture.rotation = THREE.MathUtils.degToRad(45);
    FILTERING
    for setting filter when texture is larger than original set texture.magFilter property to either: 
        THREE.NearestFilter ->  picks closet single pixel in og texture, w/ low resolution texture = pixelated look (like mincraf)
        THREE.LinearFilter  ->  chooses 4 closest pixels in og texture & blends them relative to distance from src to e/a of the 4 pixels
    
    for setting the filter when the texture is drawn SMALLER than og size: set texture.minFilter property to either:
        THREE.NearestFilter ->  same as above, chooses closest pixel in texture
        THREE.LinearFilter  ->  same as above, chooses 4 pixels in texture & blends them
        THREE.NearestMipmapNearestFilter    -> chooses appropriate mip then chooses one pixel
        THREE.NearestMipmapLinearFilter     -> chooses 2 mips, chooses one pixel from e/a, blends the 2 pixels
        THREE.LinearMipmapNearestFilter     -> chooses the appropriate mip then chooses 4 pixels & blends them
        THREE.LinearMipmapLinearFilter      -> chooses 2 mips, chooses 4 pixels from e/a & blends all 8 into 1 pixel
*/
function main() {
    // #region // SCENE & CAMERA SET UP //
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;
    // #endregion

    const scene = new THREE.Scene();

    // #region // BOX GEOM //
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    // #endregion

    const cubes = []; // just an array we can use to rotate the cubes

    // #region // LOADING TEXTURES & APPLYING MATERIALS TO CUBES & LOADING BAR //
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager); //loads textures...

    const materials = [ //6 materials to pass as an array when we create the mesh
        new THREE.MeshBasicMaterial({ map: loadColorTexture('https://threejs.org/manual/examples/resources/images/flower-1.jpg') }),
        new THREE.MeshBasicMaterial({ map: loadColorTexture('https://threejs.org/manual/examples/resources/images/flower-2.jpg') }),
        new THREE.MeshBasicMaterial({ map: loadColorTexture('https://threejs.org/manual/examples/resources/images/flower-3.jpg') }),
        new THREE.MeshBasicMaterial({ map: loadColorTexture('https://threejs.org/manual/examples/resources/images/flower-4.jpg') }),
        new THREE.MeshBasicMaterial({ map: loadColorTexture('https://threejs.org/manual/examples/resources/images/flower-5.jpg') }),
        new THREE.MeshBasicMaterial({ map: loadColorTexture('https://threejs.org/manual/examples/resources/images/flower-6.jpg') }),
    ];

    const loadingElem = document.querySelector('#loading');
    const progressBarElem = loadingElem.querySelector('.progressbar');

    loadManager.onLoad = () => { // waits to create mesh & add to scene until all textures have loaded
        loadingElem.style.display = 'none';
        const cube = new THREE.Mesh(geometry, materials); 
        scene.add(cube);
        cubes.push(cube);  // add to our list of cubes to rotate
    };
    
    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal;
        progressBarElem.style.transform = `scaleX(${progress})`;
    };
    // #endregion

    function resizeRendererToDisplaySize(renderer) {

        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {

            renderer.setSize(width, height, false);

        }

        return needResize;

    }

    function loadColorTexture(path) {

        const texture = loader.load(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;

    }

    function render(time) {

        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {

            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();

        }

        cubes.forEach((cube, ndx) => {

            const speed = .2 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;

        });

        renderer.render(scene, camera);

        requestAnimationFrame(render);

    }

    requestAnimationFrame(render);

}

main();
