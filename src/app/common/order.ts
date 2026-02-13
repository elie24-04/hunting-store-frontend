export class Order {
    totalQuantity!: number;
    totalPrice!: number;

    constructor();
    constructor(totalQuantity: number, totalPrice: number);
    constructor(totalQuantity: number = 0, totalPrice: number = 0) {
        this.totalQuantity = totalQuantity;
        this.totalPrice = totalPrice;
    }
}
