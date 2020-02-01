export const caloriesFromWattSeconds = (avgWatt: number, seconds: number) => {
    return Math.round(4 * ((avgWatt*seconds)/4186));
}