import vector from "./vector"
//ToDo mass function
export default class Rocket {
    constructor(mass,
        position) {
        this.mass = mass
        this.velocity = vector.create(0, 0, 0)
        this.position = position
    }
    totalForce() {
        const ThrustForce = calcThrustForce()

        const Gravity = calcGravity()

        const DragForce = calcDragForce()


    }

    // TODO : Calculate force effect on three axis
    calcThrustForce(fuelDensity, rocketOpeningDiameter, fuelExitingVelocity) {

        // Calculate area of rocket opening hole
        const areaOfHole = Math.pow((rocketOpeningDiameter * 0.5), 2) * Math.PI


        const thrustScaler = fuelDensity * areaOfHole * Math.pow(fuelExitingVelocity, 2)  // Newtons

        return vector.create(
            0,
            thrustScaler,
            0
        )
    }


    calcGravity(gravity) {

        // gravity = m * g 

        return vector.create(0, -gravity * this.mass, 0)
    }

    calcDragForce(dragCoeff) {

        //Fd = 0.5 * Cd * area * v * v 
        let velocitySquare = this.velocity.squere()
        let normalize = this.velocity.normalize()

        let dragForce =
            0.5 *
            this._calculateAirDensity *
            velocitySquare *
            dragCoeff *
            Math.pow(Math.pow((rocketRaduis * 0.5), 2) * Math.PI, 2)

        return vector.create(
            -dragForce * normalize.getX(),
            -dragForce * normalize.getY(),
            -dragForce * normalize.getZ() ,
        )

    }

    _calculateAtmospherePressure(gravity, height, tempereture) {
        let R = 8.3148,
            Md = 0.028964,
            P0 = 1.01325; // 1bar =100000pa
        let Tkelvin = tempereture + 273.15;
        let P = P0 * Math.exp((-Md * gravity * height) / (R * Tkelvin));
        return P;
    }

    _calculateAirDensity(tempereture) {
        const R = 8.3148
        let Tkelvin = tempereture + 273.15
        let airDensity = this._calculateAtmospherePressure / (R * Tkelvin)
        return airDensity
    }

    _calculateFuleExitingVelocity(fuelDensity, rocketRaduis, rocketOpeningRaduis) {
        let velocity = 2 * (p1 - this._calculateAtmospherePressure) /
            (fuelDensity *
                1 - (Math.pow(Math.pow((rocketOpeningRaduis * 0.5), 2) * Math.PI, 2) /
                    Math.pow(Math.pow((rocketRaduis * 0.5), 2) * Math.PI, 2)
                )
            )
    }

    //TODO
    _calc_inner_pressure() {

    }

    _calculateRocketAcceleration() {

        // a = F / m 

        return vector.create(
            this.totalForce.getX() / this.mass,
            this.totalForce.getY() / this.mass,
            this.totalForce.getZ() / this.mass,
        )
    }
    _calculateRocketVelocity(time) {

        // dv = a * dt 

        return this.velocity.addTo(this._calculateRocketAcceleration, time)

    }

    _calculateRocketPosition(time) {

        // dp = v * dt 

        return this.position.addTo(this._calculateRocketVelocity, time)

    }

    update(time, gravity) {
        //force 
        let gravity_force = this.calcGravity(gravity)
        let drag_force = this.calcDragForce(dragCoeff)
        // let thrust_force = this.calcThrustForce()


        let acc = this._calculateRocketAcceleration(time)
        let velocity = this._calculateRocketVelocity(time)
        let position = this._calculateRocketPosition(time)




    }

}