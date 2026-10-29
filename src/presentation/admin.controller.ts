import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../application/auth/jwt-auth.guard';
import { AuthService } from '../application/auth/auth.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private authService: AuthService) {}

  @Get('users')
  getAllUsers(@Req() req) {
    return this.authService.getAllUsers(req.user.id);
  }

  @Post('users/approve/:userId')
  approveUser(@Req() req, @Param('userId') userId: string) {
    return this.authService.approveUser(req.user.id, userId);
  }

  @Patch('users/:userId/permissions')
  updatePermissions(@Req() req, @Param('userId') userId: string, @Body() permissions: any) {
    return this.authService.updateUserPermissions(req.user.id, userId, permissions);
  }

  @Post('users')
  createUser(@Req() req, @Body() data: any) {
    return this.authService.adminCreateUser(req.user.id, data);
  }
}