import * as THREE from "three";

import {
    OrbitControls
} from "three/addons/controls/OrbitControls.js";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";



// ==========================================
// LOADING SCREEN
// ==========================================

const loadingScreen =
    document.getElementById(
        "loading-screen"
    );


const loadingProgress =
    document.getElementById(
        "loading-progress"
    );


const loadingPercent =
    document.getElementById(
        "loading-percent"
    );


const loadingStatus =
    document.getElementById(
        "loading-status"
    );



function updateLoading(
    progress,
    status
) {

    const value =
        Math.round(
            progress
        );


    loadingProgress.style.width =
        `${value}%`;


    loadingPercent.textContent =
        `${value}%`;


    loadingStatus.textContent =
        status;

}



function finishLoading() {

    updateLoading(
        100,
        "READY"
    );


    setTimeout(() => {

        loadingScreen.classList.add(
            "loaded"
        );

    }, 350);

}



// ==========================================
// BASIC SETUP
// ==========================================

const container =
    document.getElementById(
        "scene-container"
    );


const scene =
    new THREE.Scene();


scene.background =
    new THREE.Color(
        0x080808
    );



// ==========================================
// CAMERA
// ==========================================

const camera =
    new THREE.PerspectiveCamera(
        50,

        window.innerWidth /
        window.innerHeight,

        0.1,

        100
    );


// Final camera position

const finalCameraPosition =
    new THREE.Vector3(
        0,
        4.5,
        8
    );


// Intro camera position

const introCameraPosition =
    new THREE.Vector3(
        0,
        6.5,
        11
    );


camera.position.copy(
    introCameraPosition
);


camera.lookAt(
    0,
    0,
    0
);



// ==========================================
// RENDERER
// ==========================================

const renderer =
    new THREE.WebGPURenderer({
        antialias: true
    });


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


container.appendChild(
    renderer.domElement
);


await renderer.init();



// ==========================================
// LIGHTING
// ==========================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        1.8
    );


scene.add(
    ambientLight
);



const keyLight =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );


keyLight.position.set(
    4,
    8,
    6
);


scene.add(
    keyLight
);



const fillLight =
    new THREE.DirectionalLight(
        0xffffff,
        1.2
    );


fillLight.position.set(
    -5,
    4,
    -4
);


scene.add(
    fillLight
);



// ==========================================
// ORBIT CONTROLS
// ==========================================

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );


controls.enableDamping =
    true;


controls.dampingFactor =
    0.06;


controls.minDistance =
    4;


controls.maxDistance =
    12;


controls.target.set(
    0,
    0,
    0
);


controls.update();


// Disable controls during intro

controls.enabled =
    false;



// ==========================================
// INTRO CAMERA ANIMATION
// ==========================================

let introStartTime =
    null;


const introDuration =
    1500;


let introFinished =
    false;



function easeOutCubic(
    t
) {

    return 1 -
        Math.pow(
            1 - t,
            3
        );

}



function startIntroAnimation() {

    introStartTime =
        performance.now();

    introFinished =
        false;

}



function updateIntroCamera() {

    if (
        introFinished ||
        introStartTime === null
    ) {

        return;

    }


    const elapsed =
        performance.now() -
        introStartTime;


    let progress =
        elapsed /
        introDuration;


    progress =
        Math.min(
            progress,
            1
        );


    const eased =
        easeOutCubic(
            progress
        );


    camera.position.lerpVectors(
        introCameraPosition,
        finalCameraPosition,
        eased
    );


    camera.lookAt(
        0,
        0,
        0
    );


    if (
        progress >= 1
    ) {

        introFinished =
            true;


        camera.position.copy(
            finalCameraPosition
        );


        controls.enabled =
            true;

    }

}



// ==========================================
// GLTF LOADER
// ==========================================

const loader =
    new GLTFLoader();


let keyboard =
    null;



// ==========================================
// KEY PRESS SETTINGS
// ==========================================

const KEY_PRESS_DISTANCE =
    0.08;


const KEY_PRESS_SPEED =
    0.035;


const KEY_RELEASE_SPEED =
    0.025;



// ==========================================
// KEY STATE
// ==========================================

const pressedKeys =
    new Map();



// ==========================================
// KEY DISPLAY
// ==========================================

const keyDisplay =
    document.getElementById(
        "key-display"
    );


const keyNameDisplay =
    keyDisplay.querySelector(
        ".key-name"
    );


let keyDisplayTimeout;



function showKeyPressed(
    keyName
) {

    keyNameDisplay.textContent =
        keyName;


    keyDisplay.classList.add(
        "visible"
    );


    clearTimeout(
        keyDisplayTimeout
    );


    keyDisplayTimeout =
        setTimeout(() => {

            keyDisplay.classList.remove(
                "visible"
            );

        }, 900);

}



// ==========================================
// SOUND
// ==========================================

const audioListener =
    new THREE.AudioListener();


camera.add(
    audioListener
);



const audioLoader =
    new THREE.AudioLoader();


const keySound =
    new THREE.Audio(
        audioListener
    );



audioLoader.load(
    "./sounds/key_sound.mp3",

    (buffer) => {

        keySound.setBuffer(
            buffer
        );


        keySound.setVolume(
            0.55
        );

    }
);



// ==========================================
// PLAY KEY SOUND
// ==========================================

function playKeySound() {

    if (
        !keySound.buffer
    ) {

        return;

    }


    if (
        keySound.isPlaying
    ) {

        keySound.stop();

    }


    keySound.play();

}



// ==========================================
// FIND KEY
// ==========================================

function findKey(
    keyName
) {

    if (!keyboard) {

        return null;

    }


    return keyboard.getObjectByName(
        `Key_${keyName}`
    );

}



// ==========================================
// FIND LEGEND
// ==========================================

function findLegend(
    keyName
) {

    if (!keyboard) {

        return null;

    }


    return keyboard.getObjectByName(
        `Legend_${keyName}`
    );

}



// ==========================================
// PRESS KEY
// ==========================================

function pressKey(
    keyName
) {

    const keyObject =
        findKey(
            keyName
        );


    if (!keyObject) {

        return;

    }


    const legend =
        findLegend(
            keyName
        );



    if (
        !pressedKeys.has(
            keyName
        )
    ) {

        pressedKeys.set(
            keyName,
            {

                key:
                    keyObject,

                legend:
                    legend,

                originalKeyY:
                    keyObject.position.y,

                originalLegendY:
                    legend
                        ? legend.position.y
                        : null,

                targetOffset:
                    -KEY_PRESS_DISTANCE

            }
        );

    }



    const state =
        pressedKeys.get(
            keyName
        );


    state.targetOffset =
        -KEY_PRESS_DISTANCE;



    playKeySound();


    showKeyPressed(
        keyName
    );

}



// ==========================================
// RELEASE KEY
// ==========================================

function releaseKey(
    keyName
) {

    const state =
        pressedKeys.get(
            keyName
        );


    if (!state) {

        return;

    }


    state.targetOffset =
        0;

}



// ==========================================
// KEY ANIMATION
// ==========================================

function updateKeyAnimations() {

    pressedKeys.forEach(
        (state) => {

            const key =
                state.key;


            const legend =
                state.legend;


            const targetKeyY =
                state.originalKeyY +
                state.targetOffset;


            const keyDifference =
                targetKeyY -
                key.position.y;


            key.position.y +=
                keyDifference *
                (
                    state.targetOffset < 0
                        ? KEY_PRESS_SPEED
                        : KEY_RELEASE_SPEED
                );



            if (legend) {

                const targetLegendY =
                    state.originalLegendY +
                    state.targetOffset;


                const legendDifference =
                    targetLegendY -
                    legend.position.y;


                legend.position.y +=
                    legendDifference *
                    (
                        state.targetOffset < 0
                            ? KEY_PRESS_SPEED
                            : KEY_RELEASE_SPEED
                    );

            }

        }
    );

}



// ==========================================
// HOVER
// ==========================================

let hoveredKey =
    null;



function setHover(
    object
) {

    if (!object) {

        return;

    }



    if (
        object.userData.originalHSL ===
        undefined
    ) {

        const color =
            object.material.color;


        const hsl =
            {};


        color.getHSL(
            hsl
        );


        object.userData.originalHSL =
            hsl;

    }



    object.material.color.offsetHSL(
        0,
        0,
        0.08
    );

}



function removeHover(
    object
) {

    if (!object) {

        return;

    }


    const original =
        object.userData.originalHSL;


    if (!original) {

        return;

    }


    object.material.color.setHSL(
        original.h,
        original.s,
        original.l
    );

}



// ==========================================
// RAYCASTER
// ==========================================

const raycaster =
    new THREE.Raycaster();


const mouse =
    new THREE.Vector2();



// ==========================================
// MOUSE MOVE
// ==========================================

renderer.domElement.addEventListener(
    "pointermove",
    (event) => {

        if (!keyboard) {

            return;

        }


        mouse.x =
            (
                event.clientX /
                window.innerWidth
            ) * 2 - 1;


        mouse.y =
            -(
                event.clientY /
                window.innerHeight
            ) * 2 + 1;


        raycaster.setFromCamera(
            mouse,
            camera
        );



        const objects =
            [];


        keyboard.traverse(
            (object) => {

                if (

                    object.name.startsWith(
                        "Key_"
                    )

                    &&

                    !object.name.endsWith(
                        "_SWITCH"
                    )

                    &&

                    !object.name.endsWith(
                        "_STEM"
                    )

                ) {

                    objects.push(
                        object
                    );

                }

            }
        );



        const intersections =
            raycaster.intersectObjects(
                objects,
                false
            );



        if (
            intersections.length > 0
        ) {

            const object =
                intersections[0].object;


            if (
                hoveredKey !== object
            ) {

                if (
                    hoveredKey
                ) {

                    removeHover(
                        hoveredKey
                    );

                }


                hoveredKey =
                    object;


                setHover(
                    hoveredKey
                );


                renderer.domElement.style.cursor =
                    "pointer";

            }

        }

        else {

            if (
                hoveredKey
            ) {

                removeHover(
                    hoveredKey
                );


                hoveredKey =
                    null;

            }


            renderer.domElement.style.cursor =
                "default";

        }

    }
);



// ==========================================
// MOUSE CLICK
// ==========================================

renderer.domElement.addEventListener(
    "pointerdown",
    (event) => {

        if (!keyboard) {

            return;

        }


        mouse.x =
            (
                event.clientX /
                window.innerWidth
            ) * 2 - 1;


        mouse.y =
            -(
                event.clientY /
                window.innerHeight
            ) * 2 + 1;


        raycaster.setFromCamera(
            mouse,
            camera
        );



        const objects =
            [];


        keyboard.traverse(
            (object) => {

                if (

                    object.name.startsWith(
                        "Key_"
                    )

                    &&

                    !object.name.endsWith(
                        "_SWITCH"
                    )

                    &&

                    !object.name.endsWith(
                        "_STEM"
                    )

                ) {

                    objects.push(
                        object
                    );

                }

            }
        );



        const intersections =
            raycaster.intersectObjects(
                objects,
                false
            );



        if (
            intersections.length > 0
        ) {

            const object =
                intersections[0].object;


            const keyName =
                object.name.replace(
                    "Key_",
                    ""
                );


            pressKey(
                keyName
            );


            setTimeout(
                () => {

                    releaseKey(
                        keyName
                    );

                },
                130
            );

        }

    }
);



// ==========================================
// PHYSICAL KEYBOARD
// ==========================================

const keyboardMap = {

    // Numbers

    Digit1: "1",
    Digit2: "2",
    Digit3: "3",
    Digit4: "4",
    Digit5: "5",
    Digit6: "6",
    Digit7: "7",
    Digit8: "8",
    Digit9: "9",
    Digit0: "0",


    // Letters

    KeyQ: "Q",
    KeyW: "W",
    KeyE: "E",
    KeyR: "R",
    KeyT: "T",
    KeyY: "Y",
    KeyU: "U",
    KeyI: "I",
    KeyO: "O",
    KeyP: "P",

    KeyA: "A",
    KeyS: "S",
    KeyD: "D",
    KeyF: "F",
    KeyG: "G",
    KeyH: "H",
    KeyJ: "J",
    KeyK: "K",
    KeyL: "L",

    KeyZ: "Z",
    KeyX: "X",
    KeyC: "C",
    KeyV: "V",
    KeyB: "B",
    KeyN: "N",
    KeyM: "M",


    // Symbols

    Minus: "-",
    Equal: "=",

    BracketLeft: "[",
    BracketRight: "]",

    Backslash: "\\",

    Semicolon: ";",
    Quote: "'",

    Comma: ",",
    Period: ".",
    Slash: "/",


    // Special

    CapsLock: "CAPS",

    ShiftLeft: "SHIFT",
    ShiftRight: "RSHIFT",

    ControlLeft: "CTRL",
    ControlRight: "CTRL",

    AltLeft: "ALT",
    AltRight: "ALT",

    Space: "SPACE",

    Enter: "ENTER",

    Backspace: "BACK",

    Tab: "TAB",


    // Arrows

    ArrowUp: "UP",
    ArrowLeft: "LEFT",
    ArrowDown: "DOWN",
    ArrowRight: "RIGHT"

};



// ==========================================
// PHYSICAL KEY DOWN
// ==========================================

window.addEventListener(
    "keydown",
    (event) => {

        // Ignore F1-F12

        if (

            event.code.startsWith(
                "F"
            )

            &&

            /^F([1-9]|1[0-2])$/.test(
                event.code
            )

        ) {

            return;

        }



        const keyName =
            keyboardMap[
                event.code
            ];


        if (!keyName) {

            return;

        }


        if (event.repeat) {

            return;

        }


        pressKey(
            keyName
        );

    }
);



// ==========================================
// PHYSICAL KEY UP
// ==========================================

window.addEventListener(
    "keyup",
    (event) => {

        const keyName =
            keyboardMap[
                event.code
            ];


        if (!keyName) {

            return;

        }


        releaseKey(
            keyName
        );

    }
);



// ==========================================
// LOAD KEYBOARD
// ==========================================

updateLoading(
    10,
    "LOADING MODEL"
);



loader.load(

    "./models/mechanical-keyboard.glb",


    // ======================================
    // SUCCESS
    // ======================================

    (gltf) => {

        updateLoading(
            80,
            "PROCESSING MODEL"
        );


        keyboard =
            gltf.scene;


        keyboard.scale.set(
            1,
            1,
            1
        );


        keyboard.position.set(
            0,
            0,
            0
        );



        // ==================================
        // CLONE MATERIALS
        // ==================================

        keyboard.traverse(
            (object) => {

                if (
                    object.isMesh &&
                    object.material
                ) {

                    if (
                        Array.isArray(
                            object.material
                        )
                    ) {

                        object.material =
                            object.material.map(
                                material =>
                                    material?.clone
                                        ? material.clone()
                                        : material
                            );

                    }

                    else if (
                        object.material.clone
                    ) {

                        object.material =
                            object.material.clone();

                    }

                }

            }
        );


        scene.add(
            keyboard
        );


        updateLoading(
            95,
            "FINALIZING"
        );


        // Wait for the scene
        // to be ready before
        // starting the experience

        setTimeout(
            () => {

                finishLoading();

                startIntroAnimation();

            },
            250
        );

    },


    // ======================================
    // LOADING PROGRESS
    // ======================================

    (xhr) => {

        if (
            xhr.total
        ) {

            const progress =
                xhr.loaded /
                xhr.total;


            // 10% → 80%

            const value =
                10 +
                progress * 70;


            updateLoading(
                value,
                "LOADING MODEL"
            );

        }

    },


    // ======================================
    // ERROR
    // ======================================

    (error) => {

        console.error(
            "Error loading keyboard:",
            error
        );


        updateLoading(
            100,
            "LOAD ERROR"
        );

    }

);



// ==========================================
// RESIZE
// ==========================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);



// ==========================================
// ANIMATION LOOP
// ==========================================

renderer.setAnimationLoop(
    () => {

        updateIntroCamera();

        controls.update();

        updateKeyAnimations();

        renderer.render(
            scene,
            camera
        );

    }
);