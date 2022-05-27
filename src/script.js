import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import vector from './Physics/vector'

/**
 * Debug
 */
const gui = new dat.GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const parameters = {
    fuelInitialMass: 50000, // fuel mass inside the rocket
    emptyRocketMass: 20000, // rocket mass when there is no fuel inside it
    flowPercentage: 1,  // how x percent of fuel is being ejected every sec
    gravityAcc: 9.8,    // gravitational acceleration to calculate weight
    exaustVelocity: 500,    // velocity of ejected fuel
    isEngineRunning: true,
}

// gui.add(parameters, 'engineRunningTime').min(0).max(100).step(0.001).name('engine time')
gui.add(parameters, 'fuelInitialMass').min(1).max(100000).step(1).name('fuel initial mass')
gui.add(parameters, 'emptyRocketMass').min(1).max(40000).step(1).name('empty rocket mass')
gui.add(parameters, 'flowPercentage').min(0).max(100).step(0.0001).name('fuel flow percentage')
gui.add(parameters, 'gravityAcc').min(0).max(40).step(0.00001).name('gravitational acceleration')
gui.add(parameters, 'exaustVelocity').min(0).max(5000).step(0.1).name('exaust velocity')
gui.add(parameters, 'isEngineRunning').name('Engine ON/OFF')


/**
 * 
 * @returns total mass of rocket (full of fuel)
 */
function rocketInitialMass() {
    return parameters.fuelInitialMass + parameters.emptyRocketMass;
}

/**
 * Calculate the acceleration of the rocket
 */

function calc_thurst() {
    // 1% of fuel mass is beiging ejected every second
    let massFlowRate = - parameters.flowPercentage * parameters.fuelInitialMass * 0.1

    // Thrust Force
    let thrust = parameters.exaustVelocity * massFlowRate
    return thrust
}

function calc_weight() {
    // Weight Force
    let weight = parameters.gravityAcc * rocketInitialMass()
    return weight
}

function calc_acc() {
    let thrust = 0;
    let weight = 0;
    let acceleration

    // if engine is turned on, add thrust effect
    if (parameters.isEngineRunning) {
        thrust = calc_thurst()
    }

    // calculate weight
    weight = calc_weight()

    // todo: add rest forces
    console.log('thrust: ' + thrust)

    acceleration = vector.create(0, (-thrust - weight) / rocketInitialMass(), 0)

    return acceleration
}

/**
 * 
 * @param {double} deltaTime represents change in time 
 * @param {vector} v0 represents previous velocity vector values
 */
function calc_velo(deltaTime, v0) {
    let acceleration = calc_acc()

     // v1 = v0 + acc*dt
    let velocity = v0.add(vector.create(0, acceleration.multiply(deltaTime).getY(), 0)) 

    return velocity
}

/**
 * 
 * @param {double} deltaTime represents change in time
 * @param {vector} p0 represents previous displacement vector values
 * @returns 
 */
function calc_rocket_disp(deltaTime, p0) {
    let disp;   // rocket displacement
    let v0 = vector.create(0, 0, 0) // starts from rest
    let velocity = calc_velo(deltaTime, v0) // current rocket velocity

    disp = p0.add(vector.create(0, velocity.multiply(deltaTime).getY(), 0))
    return disp
}

/**
 * Test sphere
 */
const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 16, 16),
    new THREE.MeshNormalMaterial({ flatShading: true })
)
sphere.castShadow = true
sphere.position.y = 0.5
scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#29524A'
    })
)
floor.rotation.x = - Math.PI * 0.5
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
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 3, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.maxPolarAngle = Math.PI / 3;
controls.enableDamping = true

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


// initial displacement 
let p0 = vector.create(0, 0.5, 0)

const tick = () => {

    // Update Position
    p0 = calc_rocket_disp(clock.getDelta(), p0)
    sphere.position.set(p0.getX(), p0.getY(), p0.getZ())

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()