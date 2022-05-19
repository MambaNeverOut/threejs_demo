class App {
    constructor(canvas, model, animations) {
        this.scene = App.createScene()
            .add(model)
            .add(App.createAmbientLight())
            .add(App.createDirectionalLight());
        this.camera = App.createCamera();
        this.renderer = App.createRenderer(canvas);
        // this.mixer = new AnimationMixer(model, animations)
        this.update()
    }
    static createScene() {
        let scene = new THREE.Scene();
        scene.background = new THREE.Color(0x336495)
        return scene;
    }
    static createAmbientLight() { // 背景光，环境光
        return new THREE.AmbientLight(0xffffff, 1)
    }
    static createDirectionalLight() { // 方向光，平行光
        let light = new THREE.DirectionalLight(0xffffff, 2)
        light.position.set(0, 400, 350)
        return light
    }
    static createCamera() {
        let camera = new THREE.PerspectiveCamera(
            // 镜头垂直视野角度
            // 镜头长宽比（通常使用的是 场景的宽/场景的高。默认值为1）
            // 镜头近端面
            // 镜头远端面
            200, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        camera.position.z = 100;
        camera.position.x = 0;
        camera.position.y = 10

        return camera;
    }
    static createRenderer(canvas) {
        let renderer = new THREE.WebGLRenderer({
            canvas
        });
        renderer.setPixelRatio(window.devicePixelRatio) // 设置设备像素比
        renderer.toneMapping = THREE.ReinhardToneMapping; // 色调映射
        renderer.toneMappingExposure = 2.0; // 色调映射的曝光级别。默认是1

        return renderer;
    }
    update() {
        this.resize();
        // this.mixer.update()
        this.renderer.render(this.scene, this.camera)
        window.requestAnimationFrame(() => {
            this.update();
        })
    }
    resize() {
        let canvasSize = this.renderer.getSize(new THREE.Vector2());
        let windowSize = new THREE.Vector2(window.innerWidth, window.innerHeight);
        if (!canvasSize.equals(windowSize)) {
            this.renderer.setSize(windowSize.x, windowSize.y, false);
            this.camera.aspect = windowSize.x / windowSize.y;
            this.camera.updateProjectionMatrix();
        }
    }
}

// 添加动画
class AnimationMixer {
    constructor(model, animations) {
        this.clock = new THREE.Clock();
        this.mixer = new THREE.AnimationMixer(model)
        this.animations = animations;
    }
    play(clip) {
        let animation = this.animations.find(a => a.name === clip)
        if (animation) {
            this.mixer.stopAllAction()
            this.mixer.clipAction(animation).play()
            this.clip = clip
        }
    }
    update() {
        let delta = this.clock.getDelta()
        this.mixer.update(delta)
    }
}
const loader = new THREE.GLTFLoader();

function loadCarModel() {

    loader.load('models/test.gltf', function (gltf) {
            console.log(gltf);
            let model = gltf.scene;
            model.scale.set(10, 10, 10)
            model.position.y = -6;

            let canvas = document.querySelector('#app-canvas')
            let app = new App(canvas, model, gltf.animations)

            console.log(gltf.scene.children);
            for (var i = 0; i < gltf.scene.children[0].children.length; i++) {
                var child = gltf.scene.children[0].children[i];
                console.log(child);
                if (child.name == "Body_Backup002" || child.name == "Body_Backup003" || child.name == "Body_Backup004" || child.name == "Body_Backup005") {
                    console.log(allTexture[child.name].texture);
                    child.material = new THREE.MeshStandardMaterial();
                    child.material.map = allTexture[child.name].texture;
                    // child.material.normalMap = allTexture[child.name].texture;
                    // child.material.aoMap = allTexture[child.name].texture;
                }
            }
        },
        function (xhr) {
            // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error(error);
        }
    )
}
let allTexture

function loadAllTexture(cb) {
    allTexture = {};

    var loadIndex = 0;
    var textures = [
        "Body_Backup003", //  Hair
        "Body_Backup002",  // fire
        "Body_Backup004",  // clothes
        "Body_Backup005",   // skin
    ];

    function loadNextTexture() {
        var textureName = textures[loadIndex];
        // console.log(textureName);
        loadTexture("images/textures/" + textureName + ".png", function (texture) {
            allTexture[textureName] = {
                texture: texture
            };
            if (loadIndex < textures.length - 1) {
                loadIndex++;
                loadNextTexture();
            } else {
                console.log(allTexture);
                // if (cb) cb();
                loader.load('models/new_scene2.gltf', function (gltf) {
                        console.log(gltf);
                        let model = gltf.scene;
                        // model.scale.set(10, 10, 10)
                        // model.position.y = -6;

                        let canvas = document.querySelector('#app-canvas')

                        console.log(gltf.scene.children);
                        // for (var i = 0; i < gltf.scene.children[0].children.length; i++) {
                        //     var child = gltf.scene.children[0].children[i];
                        //     console.log(child);
                        //     if (child.name == "Body_Backup002" || child.name == "Body_Backup003" || child.name == "Body_Backup004" || child.name == "Body_Backup005") {
                        //         console.log(allTexture[child.name].texture);
                        //         child.material = new THREE.MeshStandardMaterial();
                        //         child.material.map = allTexture[child.name].texture;
                        //         // child.material.normalMap = allTexture[child.name].texture;
                        //         // child.material.aoMap = allTexture[child.name].texture;
                        //     }
                        //     console.log(child);

                        // }
                        let app = new App(canvas, model, gltf.animations)

                    },
                    function (xhr) {
                        // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                    },
                    function (error) {
                        console.error(error);
                    }
                )
            }
        });
    }
    loadNextTexture();
}

function loadTexture(filepath, cb) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(filepath, cb);
}

loadAllTexture(loadCarModel);