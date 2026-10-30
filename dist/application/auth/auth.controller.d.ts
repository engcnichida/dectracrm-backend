import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    constructor(authService: AuthService, jwtService: JwtService);
    login(data: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("../../domain/user.entity").UserRole;
            permissions: Record<string, {
                view: boolean;
                edit: boolean;
            }>;
        };
    }>;
    requestSignup(data: {
        email: string;
        password: string;
        name: string;
    }): Promise<{
        message: string;
    }>;
    validateApprovalCode(data: {
        email: string;
        code: string;
    }): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<any>;
    changeOwnPassword(req: any, data: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    getAllUsers(req: any): Promise<import("../../domain/user.entity").User[]>;
    updatePermissions(req: any, userId: string, permissions: any): Promise<{
        message: string;
        permissions: any;
    }>;
    resetPassword(req: any, userId: string, data: {
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    updateUserRole(req: any, userId: string, data: {
        role: string;
    }): Promise<{
        message: string;
        user: import("../../domain/user.entity").User;
    }>;
    updateUserStatus(req: any, userId: string, data: {
        status: string;
    }): Promise<{
        message: string;
        user: import("../../domain/user.entity").User;
    }>;
    changeAdminEmail(body: {
        email: string;
    }): Promise<{
        message: string;
        newEmail: string;
    }>;
}
