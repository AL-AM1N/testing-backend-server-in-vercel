import { Role } from "../../../generated/prisma/enums";

export interface IRegisterUser {
    name: string;
    email: string;
    password: string;
    role: Role;
    profilePhoto?: string;
    phone?: string;
    address?: string;
}

export interface ILoginUser {
    email: string;
    password: string;
}
