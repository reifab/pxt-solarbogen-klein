
/**
* Nutze diese Datei für benutzerdefinierte Funktionen und Blöcke.
* Weitere Informationen unter https://makecode.microbit.org/blocks/custom
*/
let strip: neopixel.Strip;

class Sun{
    sunPositionHead: number;
    sunPositionHeadBefore: number;
    numberOfLEDs: number;
    sunSize: number;
    sunDelayInMillis: number;
    intervalID: number;
    brightnessOfSun: number;

    sunColoring: Colors;

    NUMBER_OF_LEDS_ONE_STRIP: number;
    NUMBER_OF_PARALLEL_STRIPS: number;
    
    constructor(pin: DigitalPin, sunPositionHead: number, sunSize: number, brightnessOfSun: number){
        this.sunPositionHead = sunPositionHead;
        this.sunPositionHeadBefore = sunPositionHead;
        this.sunSize = sunSize;
        this.NUMBER_OF_LEDS_ONE_STRIP = 188;
        this.NUMBER_OF_PARALLEL_STRIPS = 7;
        this.numberOfLEDs = this.NUMBER_OF_LEDS_ONE_STRIP * this.NUMBER_OF_PARALLEL_STRIPS;
        this.sunColoring = Colors.White;
        this.brightnessOfSun = brightnessOfSun;
    }

    moveSunOneStep() {
        this.updateSun()
        this.incrementSunPositionHead();
        strip.show();
    }

    updateSun() {
        for (let stripeNumber = 0; stripeNumber < this.NUMBER_OF_PARALLEL_STRIPS; stripeNumber++) {
            for (let sunPixels = 0; sunPixels < this.sunSize; sunPixels++) {
                let px: number;
                let pxBefore: number;
                px = this.sunPositionHead - sunPixels;
                pxBefore = this.sunPositionHeadBefore - sunPixels;
                this.clearLEDDevidedStripe(pxBefore, stripeNumber);
                this.setLEDDevidedStripe(px, stripeNumber);
            }
        }
        strip.show();
    }

    stopSun(){
        control.clearInterval(this.intervalID, control.IntervalMode.Interval);
    }


    setBrightnessOfSun(brightnessOfSun: number){
        if(brightnessOfSun>255){
            brightnessOfSun = 255;
        }
        if(brightnessOfSun < 0){
            brightnessOfSun = 0;
        }
        this.brightnessOfSun = brightnessOfSun;
    }

    moveSunAutomatically(delayInMillis: number) {
        this.sunDelayInMillis = delayInMillis;
        control.clearInterval(this.intervalID, control.IntervalMode.Interval);
        this.intervalID = control.setInterval(() => {
            this.moveSunOneStep();
        }, delayInMillis, control.IntervalMode.Interval)
    }

    setSunColoring(color: Colors) {
        this.sunColoring = color;
    }

    private incrementSunPositionHead(): void{
        this.sunPositionHeadBefore = this.sunPositionHead;
        if (this.sunPositionHead < (this.NUMBER_OF_LEDS_ONE_STRIP + this.sunSize - 1)) {
            this.sunPositionHead = this.sunPositionHead + 1;
        } else {
            this.sunPositionHead = 0;
        }
    }

    private decrementSunPositionHead(): void {
        this.sunPositionHeadBefore = this.sunPositionHead;
        if (this.sunPositionHead < 0) {
            this.sunPositionHead = this.NUMBER_OF_LEDS_ONE_STRIP - 1;
        } else {
            this.sunPositionHead = this.sunPositionHead -1;
        }
    }

    private setLED(index: number): void {
        strip.setBrightness(this.brightnessOfSun);
        strip.setPixelColor(index, this.sunColoring);
        strip.setPixelWhiteLED(index, this.brightnessOfSun);
    }

    private clearLED(index: number): void {
        strip.setPixelColor(index, Colors.Black);
        strip.setPixelWhiteLED(index, 0);
    }

    private isInRange(indexLED: number, stripeNumber: number): boolean{
        let rangeOK: boolean;
        rangeOK = true;

        if (indexLED >= this.NUMBER_OF_LEDS_ONE_STRIP * (stripeNumber + 1)) {
            rangeOK = false;
        }

        if (indexLED < this.NUMBER_OF_LEDS_ONE_STRIP * stripeNumber) {
            rangeOK = false;
        }
        return rangeOK;
    }

    private setLEDDevidedStripe(indexLED: number, stripeNumber: number){
        indexLED = this.getIndexOfParallelLED(indexLED,stripeNumber);
        if(this.isInRange(indexLED,stripeNumber)){
            this.setLED(indexLED);
        }
    }

    private clearLEDDevidedStripe(indexLED: number, stripeNumber: number) {
        indexLED = this.getIndexOfParallelLED(indexLED, stripeNumber);
        if (this.isInRange(indexLED, stripeNumber)) {
            this.clearLED(indexLED);
        }
    }

    private isOdd(n: number): boolean {
        return Math.abs(n % 2) == 1;
    }

    getIndexOfParallelLED(indexLED: number, stripeNumber: number): number {
        let indexOfParallelLED;
        if(this.isOdd(stripeNumber)){
            //ungerade 1 3 5
            indexOfParallelLED = ((stripeNumber + 1) * this.NUMBER_OF_LEDS_ONE_STRIP-1) - indexLED;
        }else{
            //gerade 0 2 4
            indexOfParallelLED = stripeNumber * this.NUMBER_OF_LEDS_ONE_STRIP + indexLED;
        }      
        return indexOfParallelLED;
    }
}

enum Colors {
    //% block=rot
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=gelb
    Yellow = 0xFFFF00,
    //% block=grün
    Green = 0x00FF00,
    //% block=blau
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violett
    Violet = 0x8a2be2,
    //% block=rosarot
    Purple = 0xFF00FF,
    //% block=weiss
    White = 0xFFFFFF,
    //% block=warmweiss
    Black = 0x000000
}

/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon="\uf185"
//% groups=['start', 'automatic movement', 'manual movement', 'manual changes']
namespace sonnenbogen {
    let mysun: Sun;
    /**
     * initializes the LED- stripe
     * @param pin Pin
     * @param sunSize Sun size
     * @param brightnessOfSun Brightness of sun
     */
    //% block="activate sun on $pin, sun is $sunSize LEDs wide, $brighnessOfSun bright"
    //% sunSize.defl=5 sunSize.min=1 sunSize.max=30
    //% brightnessOfSun.defl=255 brightnessOfSun.min=0 brightnessOfSun.max=255
    //% group="start"
    //% weight=100
    export function init(pin: DigitalPin, sunSize: number, brightnessOfSun: number): void {
        mysun = new Sun(pin,sunSize,sunSize,brightnessOfSun);
        strip = neopixel.create(pin, mysun.numberOfLEDs, NeoPixelMode.RGBW);
        strip.show();
    }

    /**
    * moves the sun automatically
    * @param delayInMillis Delay time
    */
    //% block="move sun automatically with delays of $delayInMillis ms"
    //% delayInMillis.min=0 delayInMillis.max=2000 delayInMillis.defl=100
    //% group="automatic movement"
    //% weight=90
    export function moveSunAutomatically(delayInMillis: number): void {
        mysun.moveSunAutomatically(delayInMillis);
    }

    /**
     * moves the sun one step
     * 
     */
    //% block="move sun one step forward"
    //% group="manual movement"
    //% weight=80
    export function moveSunOneStep(): void{
        mysun.moveSunOneStep();
    }

    /**
    * stops the sun movement
    * 
    */
    //% block="stop sun movement"
    //% group="manual movement"
    //% weight=70
    export function stopSun(): void {
        mysun.stopSun();
    }

    /**
    * changes the coloring of the sun
    * @param color Color
    */
    //% block="change coloring of the sun to %color"
    //% group="manual changes"
    //% weight=60
    export function setSunColor(color: Colors): void {
        mysun.setSunColoring(color);
        mysun.updateSun();
    }

    /**
    * changes the brightness of the sun
    * @param brightnessOfSun
    */
    //% block="change bightness of the sun to %brightnessOfSun"
    //% brightnessOfSun.defl=255 brightnessOfSun.min=0 brightnessOfSun.max=255
    //% group="manual changes"
    //% weight=70
    export function setBrightnessOfTheSun(brightnessOfSun: number): void {
        mysun.setBrightnessOfSun(brightnessOfSun);
        mysun.updateSun();
    }
}
