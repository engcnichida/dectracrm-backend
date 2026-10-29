import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException, 
  ForbiddenException, 
  BadRequestException, 
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus, UserRole } from '../../domain/user.entity';
import { EmailService } from '../../services/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  // 1. Validação para Guards (Passport)
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status === UserStatus.PENDENTE) {
      throw new ForbiddenException('Cadastro pendente de aprovação. Aguarde o código de ativação.');
    }

    if (user.status === UserStatus.BLOQUEADO) {
      throw new ForbiddenException('Conta bloqueada. Contate o administrador.');
    }

    const { password: _, ...result } = user;
    return result;
  }

  // 2. Login Direto (Retorna Token JWT)
  async login(data: { email: string; password: string }) {
    const user = await this.userRepo.findOne({ where: { email: data.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) throw new UnauthorizedException('Credenciais inválidas');

    if (user.status === UserStatus.PENDENTE) {
      throw new ForbiddenException('Cadastro pendente de aprovação. Aguarde o código de ativação.');
    }

    if (user.status === UserStatus.BLOQUEADO) {
      throw new ForbiddenException('Conta bloqueada. Contate o administrador.');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      permissions: user.permissions,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1d'}),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      },
    };
  }

  // 3. Solicitar Cadastro (Público)
  async requestSignup(data: { email: string; password: string; name: string }) {
    const existing = await this.userRepo.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = this.userRepo.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      status: UserStatus.PENDENTE,
      role: UserRole.OPERACIONAL,
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

    const admin = await this.userRepo.findOne({ where: { role: UserRole.ADMIN } });
    if (admin) {
      this.emailService.notifyAdminNewUser(admin.email, data.name, data.email).catch(err => 
        console.error('⚠️ Erro ao enviar e-mail de notificação:', err.message)
      );
    }

    return { message: 'Cadastro solicitado. Aguarde aprovação do administrador.' };
  }

  // 4. Admin: Aprovar usuário e gerar código
  async approveUser(adminId: string, userId: string) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem aprovar usuários.');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    user.approvalCode = code;
    user.approvalCodeExpiresAt = expiresAt;
    user.status = UserStatus.ATIVO; 

    await this.userRepo.save(user);

    this.emailService.sendApprovalCode(user.email, code, user.name).catch(err => 
      console.error('⚠️ Erro ao enviar código de ativação:', err.message)
    );

    return { message: 'Usuário aprovado. Código enviado por e-mail.' };
  }

  // 5. Usuário: Validar código de aprovação
  async validateApprovalCode(data: { email: string; code: string }) {
    const user = await this.userRepo.findOne({ where: { email: data.email } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (user.approvalCode !== data.code) {
      throw new BadRequestException('Código inválido.');
    }

    if (user.approvalCodeExpiresAt < new Date()) {
      throw new BadRequestException('Código expirado. Solicite novo código ao administrador.');
    }

    user.approvalCode = null;
    user.approvalCodeExpiresAt = null;
    await this.userRepo.save(user);

    return { message: 'Conta ativada com sucesso! Faça login.' };
  }

  // 6. Admin: Atualizar permissões de usuário
  async updateUserPermissions(adminId: string, userId: string, permissions: any) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem modificar permissões.');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    user.permissions = permissions;
    await this.userRepo.save(user);

    return { message: 'Permissões atualizadas.', permissions };
  }

  // 7. Admin: Criar usuário diretamente
  async adminCreateUser(adminId: string, data: any) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem criar usuários.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = this.userRepo.create({
      ...data,
      password: hashedPassword,
      status: UserStatus.ATIVO,
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

  // 8. Admin: Listar todos os usuários
  async getAllUsers(adminId: string) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem ver a lista de usuários.');
    }

    return this.userRepo.find({ 
      select: ['id', 'name', 'email', 'role', 'status', 'permissions', 'createdAt'],
      order: { createdAt: 'DESC' }
    });
  }

  // 9. Obter perfil do usuário logado
  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ 
      where: { id: userId },
      select: ['id', 'name', 'email', 'role', 'status', 'permissions', 'createdAt']
    });
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  // 10. Resetar senha de qualquer usuário (admin)
  async resetUserPassword(adminId: string, userId: string, newPassword: string) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem resetar senhas.');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepo.save(user);

    return { message: 'Senha resetada com sucesso.' };
  }

  // 11. Alterar própria senha (qualquer usuário logado)
  async changeOwnPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      throw new BadRequestException('Senha atual incorreta.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepo.save(user);

    return { message: 'Senha alterada com sucesso.' };
  }

  // 12. Atualizar dados do próprio usuário (nome, email)
  async updateOwnProfile(userId: string, data: { name?: string; email?: string }) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (data.name) user.name = data.name;
    if (data.email) {
      const existing = await this.userRepo.findOne({ where: { email: data.email } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('E-mail já está em uso por outro usuário.');
      }
      user.email = data.email;
    }

    await this.userRepo.save(user);
    return { message: 'Perfil atualizado com sucesso.', user };
  }

  // 13. Admin: Alterar role de um usuário
  async updateUserRole(adminId: string, userId: string, role: UserRole) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem alterar cargos.');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    user.role = role;
    await this.userRepo.save(user);

    return { message: 'Cargo atualizado com sucesso.', user };
  }

  // 14. Admin: Ativar/Bloquear usuário
  async updateUserStatus(adminId: string, userId: string, status: UserStatus) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem alterar status.');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    user.status = status;
    await this.userRepo.save(user);

    return { message: 'Status atualizado com sucesso.', user };
  }

  // 15. Criar admin inicial se não existir
  async createInitialAdmin() {
    const adminExists = await this.userRepo.findOne({ 
      where: { role: UserRole.ADMIN } 
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Dectra@2026', 10);
      
      const admin = this.userRepo.create({
        name: 'Administrador',
        email: 'admin@dectra.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ATIVO,
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
    } else {
      console.log('✅ Admin já existe no banco de dados.');
    }
  }

  // 16. Método temporário para alterar e-mail do admin
  async changeAdminEmail(newEmail: string) {
    const admin = await this.userRepo.findOne({ where: { role: UserRole.ADMIN } });
    if (!admin) throw new NotFoundException('Admin não encontrado');
    
    admin.email = newEmail;
    await this.userRepo.save(admin);
    
    return { message: 'E-mail do admin atualizado com sucesso!', newEmail };
  }

  // 17. ✅ MÉTODO ADICIONADO CORRETAMENTE NO FINAL DA CLASSE
  async findUserById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }
}