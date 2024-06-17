import { ICardIT, Suit } from "./cardIT.model";

export class DeckIT {
    private cards: ICardIT[] = []
    private cardNumber: number = 40

    /**
     *
     */
    constructor() {
        for (let suit in Suit) {
            if (isNaN(Number(suit))) continue; // Skip non-numeric enum members
            for (let value = 1; value <= 10; value++) {
                this.cards.push({ suit: Number(suit), value });
            }
        }
    }

    public add(card: ICardIT): void {
        if (this.cards.length >= this.cardNumber) {
            throw new Error(`Cannot add more than ${this.cardNumber} cards`);
        }
        this.cards.push(card);
    }

    public remove(index: number): void {
        if (index < 0 || index >= this.cards.length) {
            throw new Error('Index out of bounds.');
        }
        this.cards.splice(index, 1);
    }

    public shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    public getAllCards(): ICardIT[] {
        return this.cards;
    }

    public getCount(): number {
        return this.cards.length;
    }

    public getCardSlice(startIndex: number, endIndex: number): ICardIT[] {
        if (startIndex < 0 || endIndex >= this.cards.length || startIndex > endIndex) {
            throw new Error('Invalid indices.');
        }
        return this.cards.slice(startIndex, endIndex + 1); // +1 perché slice non include l'elemento finale
    }
}