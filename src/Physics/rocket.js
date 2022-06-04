import vector from "./vector"
export default class Rocket {

    constructor(
    ) {
        this.position = vector.create(0, 0, 0)
        this.velocity = vector.create(0, 0, 0)  // start from rest
        this.acceleration = vector.create(0, 0, 0)  // start from rest
        this.height = 0
        this.rocket_mass = 1000
        this.fuel_mass = 10000  
        this.total_mass = this.rocket_mass + this.fuel_mass 
        this.type = 0

        // For rocket controlling
        this.engine_running = false
        this.drag_enabled = false
        this.gravity_enabled = false

        // For debugging purposes
        this.gravity_acc = 0
        this.thrust = 0
        this.weight = 0
        this.deltaTime = 0.0001


        // depeding on rocket type set the rocket mass flow rate 
        this.mass_flow_rate = 100
        this.fuel_exhaust_velocity = 200
    }

    /**
     * returns the instantinous mass of the rocket
     */
    update_total_mass() {
        if (this.total_mass > this.rocket_mass) {
            if (this.engine_running)
                this.total_mass -= (this.mass_flow_rate * 0.1) // mass is decreasing
        } else {
            this.total_mass = this.rocket_mass
        }
    }


    /**
     * @returns thrust force by applying thrust formula
     */
    _thrust_force() {
        // intitalize thrust vector
        const thrust_vector = vector.create(0, 0, 0)

        // thrust formula : T = Ve * M(dot)
        const magnitude = this.fuel_exhaust_velocity * this.mass_flow_rate
        thrust_vector.setY(magnitude)
        this.thrust = magnitude

        // console.log('thrust :' + thrust_vector.getLength());

        return thrust_vector
    }

    /**
     * @returns weight force by applying gravitational formula
     */
    _weight_force() {

        // TODO: Simulate takeing it as user input
        //  6.6743 × 10^-11 m^3 kg^-1 s^-2
        const uni_grav_cons = 6.6743 * Math.pow(10, -11)

        // 5.98×10^24 kg 
        const mass_of_earth = 5.98 * Math.pow(10, 24)

        // 6380 km 
        const earth_radius = 6380 * Math.pow(10, 3)

        const distance = earth_radius + this.height

        // apply formula : Fg= G * (m1 * m2) / R^2
        let weight = vector.create(0, 0, 0)
        weight.setY(-uni_grav_cons * mass_of_earth * (this.total_mass / Math.pow(distance, 2)))

        // weight.setY(-this.gravity * this.total_mass)
        this.gravity_acc = uni_grav_cons * mass_of_earth / Math.pow(distance, 2)
        this.weight = weight.getLength()

        return weight
    }


    /** 
     * @returns calculated rocket acceleration
     * depending on total net forces acting on the rocket
     */
    _calc_acc() {
        let net_forces = vector.create(0, 0, 0)

        const thrust = this._thrust_force()
        const weight = this._weight_force()
        const drag = vector.create(0, 0, 0) // ! Under Construction

        if (this.engine_running) {
            net_forces = net_forces.add(thrust)
        }

        if (this.drag_enabled) {
            net_forces = net_forces.add(drag)
        }

        if (this.gravity_enabled) {
            net_forces = net_forces.add(weight)
        }

        // todo: add other forces

        const acc = net_forces.multiply(1 / this.total_mass)

        // console.log(acc);
        return acc
    }

    /**
     * update acceleration of the rocket
     */
    _update_acceleration() {
        this.acceleration = this._calc_acc()
    }


    /**
     * update rocket velocity by adding the accleration
     */
    _update_velocity() {
        this.velocity = this.velocity.add(this.acceleration)
    }

    /**
     * Update rocket position be adding the velocity
     */
    _update_position() {

        if (this.position.getY() <= 0.5) {
            if (this.velocity.getY() < 0) {
                this.velocity = this.velocity.multiply(0)
                this.position.setY(0.5)
            }
        }
        this.position = this.position.add(this.velocity)
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
    }

}