import { UserRole } from '../../domain/user.entity';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: any): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: UserRole;
            permissions: Record<string, {
                view: boolean;
                edit: boolean;
            }>;
        };
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
    changeAdminEmail(req: any, body: {
        email: string;
    }): Promise<{
        message: string;
        newEmail: string;
    }>;
    createUser(req: any, data: {
        name: string;
        email: string;
        password: string;
        role?: string;
    }): Promise<any>;
}
