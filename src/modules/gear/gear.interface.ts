export interface ICreateGearPayload {
    name: string;
    description: string;
    brand: string;
    pricePerDay: number;
    image?: string;
    quantity?: number;
    categoryId: string;
}

export interface IUpdateGearPayload {
    name?: string;
    description?: string;
    brand?: string;
    pricePerDay?: number;
    image?: string;
    quantity?: number;
    isAvailable?: boolean;
    categoryId?: string;
}

export interface IGearQuery {
    searchTerm?: string;
    categoryId?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    isAvailable?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
}
