export const caloriesFromWattSeconds = (avgWatt: number, seconds: number) => {
    return 4 * ((avgWatt*seconds)/4186);
}