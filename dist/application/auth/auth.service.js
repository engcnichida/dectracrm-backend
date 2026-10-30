"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("../../domain/user.entity");
const email_service_1 = require("../../services/email.service");
let AuthService = class AuthService {
    constructor(userRepo, jwtService, emailService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async validateUser(email, password) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        if (user.status === user_entity_1.UserStatus.PENDENTE) {
            throw new common_1.ForbiddenException('Cadastro pendente de aprovação. Aguarde o código de ativação.');
        }
        if (user.status === user_entity_1.UserStatus.BLOQUEADO) {
            throw new common_1.ForbiddenException('Conta bloqueada. Contate o administrador.');
        }
        const { password: _, ...result } = user;
        return result;
    }
    async login(data) {
        const user = await this.userRepo.findOne({ where: { email: data.email } });
        if (!user)
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        const validPassword = await bcrypt.compare(data.password, user.password);
        if (!validPassword)
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        if (user.status === user_entity_1.UserStatus.PENDENTE) {
            throw new common_1.ForbiddenException('Cadastro pendente de aprovação. Aguarde o código de ativação.');
        }
        if (user.status === user_entity_1.UserStatus.BLOQUEADO) {
            throw new common_1.ForbiddenException('Conta bloqueada. Contate o administrador.');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
        };
        return {
            access_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.permissions,
            },
        };
    }
    async requestSignup(data) {
        const existing = await this.userRepo.findOne({ where: { email: data.email } });
        if (existing)
            throw new common_1.ConflictException('E-mail já cadastrado');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = this.userRepo.create({
            email: data.email,
            password: hashedPassword,
            name: data.name,
            status: user_entity_1.UserStatus.PENDENTE,
            role: user_entity_1.UserRole.OPERACIONAL,
            permissions: {
                dashboard: { view: true, edit: false },
                kanban: { view: false, edit: false },
                clientes: { view: false, edit: false },
                contratos: { view: false, edit: false },
                contas_receber: { view: false, edit: false },
                contas_pagar: { view: false, edit: false },
                dashboard_financeiro: { view: false, edit: false },
                kpis: { view: false, edit: false },
            },
        });
        await this.userRepo.save(user);
        const admin = await this.userRepo.findOne({ where: { role: user_entity_1.UserRole.ADMIN } });
        if (admin) {
            this.emailService.notifyAdminNewUser(admin.email, data.name, data.email).catch(err => console.error('⚠️ Erro ao enviar e-mail de notificação:', err.message));
        }
        return { message: 'Cadastro solicitado. Aguarde aprovação do administrador.' };
    }
    async approveUser(adminId, userId) {
        const admin = await this.userRepo.findOne({ where: { id: adminId } });
        if (admin?.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Apenas administradores podem aprovar usuários.');
        }
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        user.approvalCode = code;
        user.approvalCodeExpiresAt = expiresAt;
        user.status = user_entity_1.UserStatus.ATIVO;
        await this.userRepo.save(user);
        this.emailService.sendApprovalCode(user.email, code, user.name).catch(err => console.error('⚠️ Erro ao enviar código de ativação:', err.message));
        return { message: 'Usuário aprovado. Código enviado por e-mail.' };
    }
    async validateApprovalCode(data) {
        const user = await this.userRepo.findOne({ where: { email: data.email } });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        if (user.approvalCode !== data.code) {
            throw new common_1.BadRequestException('Código inválido.');
        }
        if (user.approvalCodeExpiresAt < new Date()) {
            throw new common_1.BadRequestException('Código expirado. Solicite novo código ao administrador.');
        }
        user.approvalCode = null;
        user.approvalCodeExpiresAt = null;
        await this.userRepo.save(user);
        return { message: 'Conta ativada com sucesso! Faça login.' };
    }
    async updateUserPermissions(adminId, userId, permissions) {
        const admin = await this.userRepo.findOne({ where: { id: adminId } });
        if (admin?.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Apenas administradores podem modificar permissões.');
        }
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        user.permissions = permissions;
        await this.userRepo.save(user);
        return { message: 'Permissões atualizadas.', permissions };
    }
    async adminCreateUser(adminId, data) {
        const admin = await this.userRepo.findOne({ where: { id: adminId } });
        if (admin?.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Apenas administradores podem criar usuários.');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = this.userRepo.create({
            ...data,
            password: hashedPassword,
            status: user_entity_1.UserStatus.ATIVO,
            permissions: data.permissions || {
                dashboard: { view: true, edit: false },
                kanban: { view: false, edit: false },
                clientes: { view: false, edit: false },
                contratos: { view: false, edit: false },
                contas_receber: { view: false, edit: false },
                contas_pagar: { view: false, edit: false },
                dashboard_financeiro: { view: false, edit: false },
                kpis: { view: false, edit: false },
            },
        });
        return this.userRepo.save(user);
    }
    async getAllUsers(adminId) {
        const admin = await this.userRepo.findOne({ where: { id: adminId } });
        if (admin?.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Apenas administradores podem ver a lista de usuários.');
        }
        return this.userRepo.find({
            select: ['id', 'name', 'email', 'role', 'status', 'permissions', 'createdAt'],
            order: { createdAt: 'DESC' }
        });
    }
    async getProfile(userId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ['id', 'name', 'email', 'role', 'status', 'permissions', 'createdAt']
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        return user;
    }
    async resetUserPassword(adminId, userId, newPassword) {
        const admin = await this.userRepo.findOne({ where: { id: adminId } });
        if (admin?.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Apenas administradores podem resetar senhas.');
        }
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await this.userRepo.save(user);
        return { message: 'Senha resetada com sucesso.' };
    }
    async changeOwnPassword(userId, currentPassword, newPassword) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentValid) {
            throw new common_1.BadRequestException('Senha atual incorreta.');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await this.userRepo.save(user);
        return { message: 'Senha alterada com sucesso.' };
    }
    async updateOwnProfile(userId, data) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        if (data.name)
            user.name = data.name;
        if (data.email) {
            const existing = await this.userRepo.findOne({ where: { email: data.email } });
            if (existing && existing.id !== userId) {
                throw new common_1.ConflictException('E-mail já está em uso por outro usuário.');
            }
            user.email = data.email;
        }
        await this.userRepo.save(user);
        return { message: 'Perfil atualizado com sucesso.', user };
    }
    async updateUserRole(adminId, userId, role) {
        const admin = await this.userRepo.findOne({ where: { id: adminId } });
        if (admin?.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Apenas administradores podem alterar cargos.');
        }
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        user.role = role;
        await this.userRepo.save(user);
        return { message: 'Cargo atualizado com sucesso.', user };
    }
    async updateUserStatus(adminId, userId, status) {
        const admin = await this.userRepo.findOne({ where: { id: adminId } });
        if (admin?.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Apenas administradores podem alterar status.');
        }
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        user.status = status;
        await this.userRepo.save(user);
        return { message: 'Status atualizado com sucesso.', user };
    }
    async createInitialAdmin() {
        const adminExists = await this.userRepo.findOne({
            where: { role: user_entity_1.UserRole.ADMIN }
        });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('Dectra@2026', 10);
            const admin = this.userRepo.create({
                name: 'Administrador',
                email: 'admin@dectra.com',
                password: hashedPassword,
                role: user_entity_1.UserRole.ADMIN,
                status: user_entity_1.UserStatus.ATIVO,
                permissions: {
                    dashboard: { view: true, edit: true },
                    kanban: { view: true, edit: true },
                    clientes: { view: true, edit: true },
                    contratos: { view: true, edit: true },
                    contas_receber: { view: true, edit: true },
                    contas_pagar: { view: true, edit: true },
                    dashboard_financeiro: { view: true, edit: true },
                    kpis: { view: true, edit: true },
                },
            });
            await this.userRepo.save(admin);
            console.log('✅ Admin padrão criado: admin@dectra.com / Dectra@2026');
        }
        else {
            console.log('✅ Admin já existe no banco de dados.');
        }
    }
    async changeAdminEmail(newEmail) {
        const admin = await this.userRepo.findOne({ where: { role: user_entity_1.UserRole.ADMIN } });
        if (!admin)
            throw new common_1.NotFoundException('Admin não encontrado');
        admin.email = newEmail;
        await this.userRepo.save(admin);
        return { message: 'E-mail do admin atualizado com sucesso!', newEmail };
    }
    async findUserById(id) {
        return this.userRepo.findOne({ where: { id } });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map