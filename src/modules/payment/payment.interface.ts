export interface ICreatePaymentPayload {
    rentalOrderId: string;
    method: "STRIPE" | "SSLCOMMERZ";
}
