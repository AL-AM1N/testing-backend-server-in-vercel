import { RentalStatus } from "../../../generated/prisma/enums";

export interface IUpdateOrderStatusPayload {
    status: RentalStatus;
}
