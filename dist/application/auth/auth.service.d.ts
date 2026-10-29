import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus, UserRole } from '../../domain/user.entity';
import { EmailService } from '../../services/email.service';
export declare class AuthService {
    private readonly userRepo;
    private readonly jwtService;
    private readonly emailService;
    constructor(userRepo: Repository<User>, jwtService: JwtService, emailService: EmailService);
    validateUser(email: string, password: string): Promise<any>;
    login(data: {
        email: string;
        password: string;
    }): Promise<{
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
    requestSignup(data: {
        email: string;
        password: string;
        name: string;
    }): Promise<{
        message: string;
    }>;
    approveUser(adminId: string, userId: string): Promise<{
        message: string;
    }>;
    validateApprovalCode(data: {
        email: string;
        code: string;
    }): Promise<{
        message: string;
    }>;
    updateUserPermissions(adminId: string, userId: string, permissions: any): Promise<{
        message: string;
        permissions: any;
    }>;
    adminCreateUser(adminId: string, data: any): Promise<User[]>;
    getAllUsers(adminId: string): Promise<User[]>;
    getProfile(userId: string): Promise<User>;
    resetUserPassword(adminId: string, userId: string, newPassword: string): Promise<{
        message: string;
    }>;
    changeOwnPassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    updateOwnProfile(userId: string, data: {
        name?: string;
        email?: string;
    }): Promise<{
        message: string;
        user: User;
    }>;
    updateUserRole(adminId: string, userId: string, role: UserRole): Promise<{
        message: string;
        user: User;
    }>;
    updateUserStatus(adminId: string, userId: string, status: UserStatus): Promise<{
        message: string;
        user: User;
    }>;
    createInitialAdmin(): Promise<void>;
    changeAdminEmail(newEmail: string): Promise<{
        message: string;
        newEmail: string;
    }>;
    findUserById(id: string): Promise<User>;
}
