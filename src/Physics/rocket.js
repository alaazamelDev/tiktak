import vector from "./vector"
//ToDo mass function
export default class Rocket {
    constructor(mass

    ) {
        this.mass = mass
    }
    totalForce() {
        const ThrustForce = calcThrustForce()

        const Weight = calcWeight()

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


    calcWeight(gravity) {
        return vector.create(0, -gravity * this.mass, 0)
    }

    // TODO : Calculate force effect on three axis
    calcDragForce(dragCoeff) {
        let dragForce =
            0.5 *
            this._calculateAirDensity *
            Math.pow(this._calculateRocketVelocity, 2) *
            dragCoeff *
            Math.pow(Math.pow((rocketRaduis * 0.5), 2) * Math.PI, 2)
        return vector.create(0, - dragCoeff, 0)
    }
    _calculateAirDensity(tempereture) {
        const R = 8.3148
        let Tkelvin = tempereture + 273.15
        let airDensity = this._calc_atmosphere_pressure / (R * Tkelvin)
        return airDensity
    }

    _calculateFuleExitingVelocity(fuelDensity, rocketRaduis, rocketOpeningRaduis) {
        let velocity = 2 * (p1 - this._calc_atmosphere_pressure) /
            (fuelDensity *
                1 - (Math.pow(Math.pow((rocketOpeningRaduis * 0.5), 2) * Math.PI, 2) /
                    Math.pow(Math.pow((rocketRaduis * 0.5), 2) * Math.PI, 2)
                )
            )
    }

    _calc_atmosphere_pressure(gravity, height, tempereture) {
        let R = 8.3148,
            Md = 0.028964,
            P0 = 1.01325; // 1bar =100000pa
        let Tkelvin = tempereture + 273.15;
        let P = P0 * Math.exp((-Md * gravity * height) / (R * Tkelvin));
        return P;
    }

    //TODO
    _calc_inner_pressure() {

    }

    _claculate_acceleration() {
        return vector.create(
            this.totalForce.getX() / this.mass,
            this.totalForce.getY() / this.mass,
            this.totalForce.getZ() / this.mass,
        )
    }

    //TODO
    _calculateRocketVelocity() {

    }

}