export class PaymentInfo {
    receiptEmail: string | undefined;

    constructor(public amount?: number,
                public currency?: string) {

    }

}
