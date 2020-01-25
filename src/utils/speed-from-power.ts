import { CalculateVelocity } from './power-v-speed';
import { CalculateRho } from './air-density';

export const kmPrHourFromMetersPrSeconds = (mps) => mps*3.6;

export const speedFromPower = (power:number, grade:number, elevation:number, weight:number) => {
    let temp = 23.8889;
    let pressure = Math.exp(-elevation / 7000) * 1000;
    let dew = 7.5;

    let options = {
      units: 'metric',
      // Rider Weight
      rp_wr: weight,
      // Bike Weight
      rp_wb: 8,
      //  Frontal area A(m2)
      rp_a: 0.65,
      // Drag coefficient Cd
      rp_cd: 0.63,
      // Drivetrain loss Lossdt (%)
      rp_dtl: 4,
      // Coefficient of rolling resistance Crr
      ep_crr: 0.005,
      // Grade %
      ep_g: grade,
      ep_rho: CalculateRho(temp, pressure, dew)
    }

    let velocity = CalculateVelocity(power, options);
    // convert to m/s
    velocity = velocity * 0.277778;

    return velocity;
  }

