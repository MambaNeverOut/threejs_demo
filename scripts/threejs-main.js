class App {
    constructor(canvas, model, animations) {
        this.scene = App.createScene()
            .add(model)
            .add(App.createAmbientLight())
            .add(App.createDirectionalLight());
        this.camera = App.createCamera();
        this.renderer = App.createRenderer(canvas);
        this.mixer = new AnimationMixer(model, animations)
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
            50, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        camera.position.z = 10;
        camera.position.x = 0;
        camera.position.y = -3

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
        this.mixer.update()
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
let loader = new THREE.GLTFLoader();
loader.load('models/multi.glb', function (gltf) {
        let model = gltf.scene;
        model.scale.set(10, 10, 10)
        model.position.y = -6;

        let canvas = document.querySelector('#app-canvas')
        let app = new App(canvas, model, gltf.animations)

        app.mixer.play('CatWalk')
        document.querySelector('.switch-button').addEventListener('click', () => {
            const clips = ['CatWalk', 'Samba', 'Belly'];
            let clipIndex = clips.indexOf(app.mixer.clip)
            clipIndex = (clipIndex + 1) % clips.length;
            app.mixer.play(clips[clipIndex]);
        })
    },
    undefined,
    function (error) {
        console.error(error);
    }
)