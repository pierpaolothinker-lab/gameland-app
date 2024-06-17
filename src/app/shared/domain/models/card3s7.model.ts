import { CardIT, Suit } from "./cardIT.model";

export class Card3s7 extends CardIT {
    private score: number = 0
    private sovranity: number = 0

    /**
     * 
     */
    constructor(suit: Suit, value: number) {
        super(suit, value);
        if (value < 1 || value > 10 )
            throw new Error('No valid value for the card')

        switch (value) {
            case 1:
                this.score = 3
                this.sovranity = 8
                break;
            case 2:
                this.score = 1
                this.sovranity = 9
                break;
            case 3:
                this.score = 1
                this.sovranity = 10
                break;
            case 4:
            case 5:
            case 6:
            case 7:
                this.sovranity = value - 3
                break;
            case 8:
            case 9:
            case 10:
                this.sovranity = value -3
                this.score = 1
            break
            default:
                break;
        }
    }

    getCardScore() {
        return this.score
    }

    getCardSovranity() {
        return this.sovranity
    }

}