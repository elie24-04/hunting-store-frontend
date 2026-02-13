export class Product {

    constructor(
        public id: number = 0,
        public sku: string = '',
        public name: string = '',
        public imageUrl: string = '',
        public unitPrice: number = 0,
        public description: string = '',
        public active: boolean = false,
        public unitsInStock: number = 0,
        public dateCreated: Date = new Date(),
        public lastUpdated: Date = new Date()
    ){

    }
}
