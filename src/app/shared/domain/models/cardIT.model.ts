export enum Suit {
    Denari = 0,
    Spade = 1,
    Coppe = 2,
    Bastoni = 3
}

export interface ICardIT {
    suit: Suit
    value: number
}

export class CardIT implements ICardIT {
    suit: Suit
    value: number = 0

    /**
     *
     */
    constructor(suit: Suit, value: number) {
        this.suit = suit
        if (value > 0 && value <= 10)
            this.value = value
    }

}