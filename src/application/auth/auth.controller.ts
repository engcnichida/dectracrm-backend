import { 
  Controller, 
  Post, 
  Get, 
  Patch, 
  Body, 
  Req,
  Param,
  UseGuards,
  UnauthorizedException,
  NotFoundException
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../domain/user.entity';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============================================
  // 1. ROTAS PÚBLICAS
  // ============================================
  
  @Post('login')
  async login(@Body() loginDto: any) { // Mantido 'any' para compatibilidade com seu DTO
    return this.authService.login(loginDto);
  }

  // ✅ REMOVIDO: 'signup' não existe no seu AuthService (usuários são criados pelo Admin)

  // ============================================
  // 2. ROTAS DO USUÁRIO LOGADO
  // ============================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) throw new UnauthorizedException('Token inválido');
    
    const user = await this.authService.findUserById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    
    const { password, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  async changeOwnPassword(
    @Req() req: any,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.authService.changeOwnPassword(userId, data.currentPassword, data.newPassword);
  }

  // ============================================
  // 3. ROTAS DE ADMINISTRAÇÃO (APENAS ADMIN)
  // ============================================

  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers(@Req() req: any) {
    const adminId = req.user?.id || req.user?.sub;
    return this.authService.getAllUsers(adminId);
  }

  @Patch('admin/users/:userId/permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updatePermissions(@Req() req: any, @Param('userId') userId: string, @Body() permissions: any) {
    const adminId = req.user?.id || req.user?.sub;
    return this.authService.updateUserPermissions(adminId, userId, permissions);
  }

  @Post('admin/users/:userId/reset-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async resetPassword(@Req() req: any, @Param('userId') userId: string, @Body() data: { newPassword: string }) {
    const adminId = req.user?.id || req.user?.sub;
    return this.authService.resetUserPassword(adminId, userId, data.newPassword);
  }

  @Patch('admin/users/:userId/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUserRole(@Req() req: any, @Param('userId') userId: string, @Body() data: { role: string }) {
    const adminId = req.user?.id || req.user?.sub;
    return this.authService.updateUserRole(adminId, userId, data.role as any);
  }

  @Patch('admin/users/:userId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUserStatus(@Req() req: any, @Param('userId') userId: string, @Body() data: { status: string }) {
    const adminId = req.user?.id || req.user?.sub;
    return this.authService.updateUserStatus(adminId, userId, data.status as any);
  }

  @Patch('admin/change-email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async changeAdminEmail(@Req() req: any, @Body() body: { email: string }) {
    // ✅ CORREÇÃO: Passando apenas 1 argumento, como seu AuthService espera
    return this.authService.changeAdminEmail(body.email); 
  }
    @Post('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createUser(@Req() req: any, @Body() data: { 
    name: string; 
    email: string; 
    password: string; 
    role?: string 
  }) {
    const adminId = req.user?.id || req.user?.sub;
    return this.authService.createUser(adminId, data);
  }
}