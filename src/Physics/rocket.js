import vector from "./vector"
import Environment from "./environment";

export default class Rocket {

    constructor() {
        this.position = vector.create(0, 0, 0)
        this.velocity = vector.create(0, 0, 0)  // start from rest
        this.acceleration = vector.create(0, 0, 0)  // start from rest

        this.angle = vector.create(0, 0, 0) // rotation angle of the rocket

        // for engine properties
        this.thrust = 13.5    // in a million newtons
        this.mass_flow_rate = 100    // in kg/s
        this.nozzle_angle = 0

        this.radius = 3
        this.height = 0
        this.rocket_mass = 200
        this.fuel_mass = 1200
        this.total_mass = (this.rocket_mass + this.fuel_mass) * Math.pow(10, 3)
        this.burnout_time = 0

        // For rocket controlling
        this.engine_running = false

        this.drag_enabled = false
        this.gravity_enabled = false
        // For debugging purposes
        this.gravity_acc = 9.81
        this.environmet = new Environment(0.295)


        this.deltaTime = 0.001
        // depending on rocket type set the rocket mass flow rate
    }

    /**
     * returns the instantaneous mass of the rocket
     */
    update_total_mass() {
        if (this.total_mass > this.rocket_mass * Math.pow(10, 3)) {
            if (this.engine_running) {
                this.total_mass -= (this.mass_flow_rate) // mass is decreasing
                // console.log(this.total_mass)
            }
        } else {
            this.total_mass = this.rocket_mass * Math.pow(10, 3)
        }
    }


    /**
     * @returns thrust force by applying thrust formula
     */
    _thrust_force() {
        // initialize thrust vector
        let thrust_vector = vector.create(0, 0, 0)

        if (this.total_mass <= this.rocket_mass * Math.pow(10, 3)) {
            return thrust_vector
        }
        // thrust formula : T = Ve * M(dot)
        const thrust_value = this.thrust * Math.pow(10, 6)
        // const exhaust_velo = thrust_value / this.mass_flow_rate

        thrust_vector.setX(thrust_value * Math.cos(this.nozzle_angle + (Math.PI / 2)))
        thrust_vector.setY(thrust_value * Math.sin(this.nozzle_angle + (Math.PI / 2)))

        // console.log(thrust_vector)
        return thrust_vector
    }

    /**
     * @returns weight force by applying gravitational formula
     */
    _weight_force() {

        // TODO: Simulate taking it as user input
        //  6.6743 × 10^-11 m^3 kg^-1 s^-2
        const uni_grav_cons = 6.6743 * Math.pow(10, -11)

        // 5.98×10^24 kg 
        const mass_of_earth = 5.98 * Math.pow(10, 24)

        // 6380 km 
        const earth_radius = 6380 * Math.pow(10, 3)

        const distance = earth_radius + this.height


        // apply formula : Fg= G * (m1 * m2) / R^2
        let weight = vector.create(0, 0, 0)
        weight.setY(-uni_grav_cons * mass_of_earth * (this.total_mass) / Math.pow(distance, 2))

        // weight.setY(-this.gravity * this.total_mass)
        this.gravity_acc = uni_grav_cons * mass_of_earth / Math.pow(distance, 2)


        return weight
    }

    calc_center_of_gravity() {

        // rocket load
        let part1_weight = this.rocket_mass * Math.pow(10, 3) * this.gravity_acc
        let part2_weight = this.fuel_mass * Math.pow(10, 3) * this.gravity_acc

        console.log('part2: ' + part1_weight + part2_weight)

        //cg = (w1*d + w2*d)/w 
        return (part1_weight * 9 + part2_weight * 4) / (part1_weight + part2_weight)
    }

    calc_total_torques() {
        // ! resource to calc moment of inertia https://shorturl.at/jpsGJ

    }

    /**
     * @returns calculated rocket acceleration
     * depending on total net forces acting on the rocket
     */
    _calc_acc() {
        let net_forces = vector.create(0, 0, 0)

        const thrust = this._thrust_force()
        const weight = this._weight_force()
        const reaction = this._weight_force().multiply(-1)
        const drag = this.environmet.applyDrag(this)

        if (this.engine_running) {
            net_forces = net_forces.add(thrust)
        }

        // console.log(drag)
        if (this.drag_enabled) {
            net_forces = net_forces.add(drag)
        }

        if (this.gravity_enabled) {
            net_forces = net_forces.add(weight)
        }
        if (this.height === 0 && this.gravity_enabled) {
            net_forces = net_forces.add(reaction)
        }
        // todo: add other forces

        console.log(net_forces);
        return net_forces.multiply(1 / (this.total_mass))
    }

    /**
     * update acceleration of the rocket
     */
    _update_acceleration() {
        this.acceleration = this._calc_acc()
    }


    /**
     * update rocket velocity by adding the acceleration
     */
    _update_velocity() {
        this.velocity = this.velocity.add(this.acceleration.multiply(this.deltaTime))
    }

    /**
     * Update rocket position be adding the velocity
     */
    _update_position() {

        if (this.position.getY() <= 0) {
            if (this.velocity.getY() < 0) {
                this.velocity = this.velocity.multiply(0)
                this.position.setY(0)
            }
        }
        this.position = this.position.add(this.velocity.multiply(this.deltaTime))
    }

    _update_current_height() {
        this.height = this.position.getY()
    }

    update() {
        this._update_acceleration()
        this._update_velocity()
        this._update_position()
        this.update_total_mass()
        this._update_current_height()

        if (this.engine_running) {
            this.burnout_time += this.deltaTime
        }
    }

}