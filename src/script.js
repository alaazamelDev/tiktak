import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import Rocket from './Physics/rocket'

/**
 * Debug
 */
const gui = new dat.GUI({width: 400})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()

const axesHelper = new THREE.AxesHelper(4)
scene.add(axesHelper)


/**
 * Test sphere
 */
const sphere = new THREE.Mesh(
    new THREE.CylinderBufferGeometry(1, 1, 5),
    new THREE.MeshNormalMaterial({flatShading: true})
)
sphere.castShadow = true
sphere.position.y = 0
scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#29524A',
        side: THREE.DoubleSide
    })
)
floor.position.y = -sphere.geometry.parameters.height * 0.5
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.1)
directionalLight.position.set(5, 5, 3)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    // renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0, 0, 40)
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.maxPolarAngle = Math.PI / 3;
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setClearColor('#06070E')
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

// rocket object instance
const rocket = new Rocket()

// get inputs
const rocket_panel = gui.addFolder('Rocket Control Panel')
rocket_panel.add(rocket, 'rocket_mass').name('empty rocket mass in (tons)').min(1).max(1000).step(1)
rocket_panel.add(rocket, 'fuel_mass').name('initial fuel mass in (tons)').min(0).max(2000).step(1)
rocket_panel.add(rocket, 'thrust').name('thrust').min(1).max(35).step(0.001)    // in a thousand of newtons
rocket_panel.add(rocket, 'nozzle_angle').name('nozzle angle').min(-Math.PI * (1 / 6)).max(Math.PI * (1 / 6)).step(0.001)    // in a thousand of newtons
rocket_panel.add(rocket, 'mass_flow_rate').name('mass flow rate').min(10).max(500).step(1)     // in kg/s
rocket_panel.add(rocket, 'radius').name('rocket radius').min(1).max(5).step(0.01)

// enable and disable forces
rocket_panel.add(rocket, 'gravity_enabled').name('Enable Gravity')
rocket_panel.add(rocket, 'drag_enabled').name('Enable Drag')
rocket_panel.add(rocket, 'engine_running').name('Run Rocket Engine')
rocket_panel.open()


// rocket calculation outputs
let outputs = {

    // acceleration
    accX: rocket.acceleration.getX(),
    accY: rocket.acceleration.getY(),
    accZ: rocket.acceleration.getZ(),

    // velocity
    veloX: rocket.velocity.getX(),
    veloY: rocket.velocity.getY(),
    veloZ: rocket.velocity.getZ(),

    // position
    posX: rocket.position.getX(),
    posY: rocket.position.getY(),
    posZ: rocket.position.getZ(),

    gravity: rocket.gravity_acc,
    thrust: rocket.thrust,
    mass: rocket.total_mass,
    burnout_time: rocket.burnout_time,
}

// Show output results in debug ui
const output_panel = gui.addFolder('Rocket Processing Outputs')

output_panel.add(outputs, 'gravity').name('Universal Gravity').step(0.0001)
output_panel.add(outputs, 'mass').name('Current Rocket Mass').step(0.01)
output_panel.add(outputs, 'burnout_time').name('Engine running time').step(0.01)

const acc_ui = output_panel.addFolder('Acceleration')
acc_ui.add(outputs, 'accX').name('X').step(0.0001)
acc_ui.add(outputs, 'accY').name('Y').step(0.0001)
acc_ui.add(outputs, 'accZ').name('Z').step(0.0001)

const velo_ui = output_panel.addFolder('Velocity')
velo_ui.add(outputs, 'veloX').name('X').step(0.01)
velo_ui.add(outputs, 'veloY').name('Y').step(0.01)
velo_ui.add(outputs, 'veloZ').name('Z').step(0.01)

const pos_ui = output_panel.addFolder('Position')
pos_ui.add(outputs, 'posX').name('X').step(0.1)
pos_ui.add(outputs, 'posY').name('Y').step(0.1)
pos_ui.add(outputs, 'posZ').name('Z').step(0.1)


output_panel.open()
acc_ui.open()
velo_ui.open()
pos_ui.open()


function updateOutputs() {

    // refresh acceleration
    outputs.accX = rocket.acceleration.getX()
    outputs.accY = rocket.acceleration.getY()
    outputs.accZ = rocket.acceleration.getZ()

    // refresh velocity
    outputs.veloX = rocket.velocity.getX()
    outputs.veloY = rocket.velocity.getY()
    outputs.veloZ = rocket.velocity.getZ()

    // refresh displacement
    outputs.posX = rocket.position.getX()
    outputs.posY = rocket.position.getY()
    outputs.posZ = rocket.position.getZ()

    outputs.gravity = rocket.gravity_acc
    outputs.thrust = rocket.thrust
    outputs.mass = rocket.total_mass
    outputs.burnout_time = rocket.burnout_time
}

let oldElapsedTime = 0
const tick = () => {

    // delta Time
    const elapsedTime = clock.getElapsedTime()

    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    rocket.deltaTime = deltaTime


    sphere.position.set(
        rocket.position.getX() * 0.05,
        rocket.position.getY() * 0.05,
        rocket.position.getZ() * 0.05
    )


    camera.position.set(
        sphere.position.x,
        sphere.position.y,
        sphere.position.z - 30
    )
    camera.lookAt(sphere.position)

    rocket.update()

    updateOutputs()

    // refresh debug ui
    output_panel.updateDisplay()


    // Update controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()