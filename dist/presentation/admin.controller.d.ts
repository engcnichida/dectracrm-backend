import { AuthService } from '../application/auth/auth.service';
export declare class AdminController {
    private authService;
    constructor(authService: AuthService);
    getAllUsers(req: any): Promise<import("../domain/user.entity").User[]>;
    approveUser(req: any, userId: string): Promise<{
        message: string;
    }>;
    updatePermissions(req: any, userId: string, permissions: any): Promise<{
        message: string;
        permissions: any;
    }>;
    createUser(req: any, data: any): Promise<import("../domain/user.entity").User[]>;
}
