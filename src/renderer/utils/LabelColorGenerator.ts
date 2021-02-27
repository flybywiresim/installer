import Color = require('color');

const lightnessThreshold = 0.6;
const backgroundAlpha = 0.18;

const perceivedLightness = (color: Color): number => {
    return (color.red() * 0.2126 + color.green() * 0.7152 + color.blue() * 0.722) / 255;
};

const lightnessSwitch = (color: Color): number => {
    return Math.max(0, Math.min((perceivedLightness(color) - lightnessThreshold) * -1000, 1));
};

const lightenBy = (color: Color): number => {
    return (lightnessThreshold - perceivedLightness(color)) * 100 * lightnessSwitch(color);
};

const hexToRgb = (hex: string): {r: number, g: number, b: number} => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) || ['0', '0', '0'];
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    };
};

const getColorsFromBase = (hex: string): { foreground: string, background: string } => {
    const base: Color = Color.rgb(hexToRgb(hex));
    const background: Color = base.alpha(backgroundAlpha);
    const foreground: Color = Color.hsl(base.hue(), base.saturationl(), base.lightness() + lightenBy(base));

    return {
        background: background.hsl().string(),
        foreground: foreground.hsl().string(),
    };
};

export default getColorsFromBase;
