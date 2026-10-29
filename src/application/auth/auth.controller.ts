import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Req,
  Patch,
  Param,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  BadRequestException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  // ============================================
  // ROTAS PÚBLICAS (sem necessidade de token)
  // ============================================

  @Post('login')
  login(@Body() data: { email: string; password: string }) {
    return this.authService.login(data);
  }

  @Post('signup')
  requestSignup(@Body() data: { email: string; password: string; name: string }) {
    return this.authService.requestSignup(data);
  }

  @Post('activate')
  validateApprovalCode(@Body() data: { email: string; code: string }) {
    return this.authService.validateApprovalCode(data);
  }

  // ============================================
  // ROTAS DO USUÁRIO LOGADO (precisa de token)
  // ============================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Token inválido');
    }
    
    const user = await this.authService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    
    const { password, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  changeOwnPassword(
    @Req() req: any,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.authService.changeOwnPassword(
      userId,
      data.currentPassword,
      data.newPassword,
    );
  }

  // ============================================
  // ROTAS DE ADMINISTRAÇÃO (apenas ADMIN)
  // ✅ ADICIONADO @UseGuards(JwtAuthGuard) EM TODAS
  // ============================================

  @Get('admin/users')
  @UseGuards(JwtAuthGuard)
  getAllUsers(@Req() req: any) {
    const adminId = req.user?.id || req.user?.sub;
    return this.authService.getAllUsers(adminId);
  }

  @Patch('admin/users/:userId/permissions')
  @UseGuards(JwtAuthGuard)
  updatePermissions(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() permissions: any,
  ) {
    const adminId = req.user?.id || req.user?.sub;
    return this.authService.updateUserPermissions(adminId, userId, permissions);
  }

  @Post('admin/users/:userId/reset-password')
  @UseGuards(JwtAuthGuard)
  resetPassword(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() data: { newPassword: string },
  ) {
    const adminId = req.user?.id || req.user?.sub;
    return this.authService.resetUserPassword(adminId, userId, data.newPassword);
  }

  @Patch('admin/users/:userId/role')
  @UseGuards(JwtAuthGuard)
  updateUserRole(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() data: { role: string },
  ) {
    const adminId = req.user?.id || req.user?.sub;
    return this.authService.updateUserRole(adminId, userId, data.role as any);
  }

  @Patch('admin/users/:userId/status')
  @UseGuards(JwtAuthGuard)
  updateUserStatus(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() data: { status: string },
  ) {
    const adminId = req.user?.id || req.user?.sub;
    return this.authService.updateUserStatus(adminId, userId, data.status as any);
  }

  @Patch('admin/change-email')
  @UseGuards(JwtAuthGuard)
  async changeAdminEmail(@Body() body: { email: string }) {
    return this.authService.changeAdminEmail(body.email);
  }
}