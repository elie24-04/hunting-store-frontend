import { CartItem } from './cart-item';

export class OrderItem {
    imageUrl: string;
    unitPrice: number;
    quantity: number;
    productId: number;

    constructor();
    constructor(cartItem: CartItem);
    constructor(unitPrice: number, quantity: number, productId: number);
    constructor(imageUrl: string, unitPrice: number, quantity: number, productId: number);
    constructor(
        arg1?: CartItem | string | number,
        arg2?: number,
        arg3?: number,
        arg4?: number
    ) {
        if (arg1 instanceof CartItem) {
            this.imageUrl = arg1.imageUrl;
            this.quantity = arg1.quantity;
            this.unitPrice = arg1.unitPrice;
            this.productId = arg1.id;
            return;
        }

        if (typeof arg1 === 'string') {
            this.imageUrl = arg1;
            this.unitPrice = arg2 ?? 0;
            this.quantity = arg3 ?? 0;
            this.productId = arg4 ?? 0;
            return;
        }

        if (typeof arg1 === 'number') {
            this.imageUrl = '';
            this.unitPrice = arg1;
            this.quantity = arg2 ?? 0;
            this.productId = arg3 ?? 0;
            return;
        }

        this.imageUrl = '';
        this.unitPrice = 0;
        this.quantity = 0;
        this.productId = 0;
    }
}
