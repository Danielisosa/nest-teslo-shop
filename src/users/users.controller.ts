import { 
  Controller, 
  Get, 
  Patch, 
  Put,
  Param,
  Body, 
  UseGuards, 
  Request, 
  Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // O tu JwtAuthGuard personalizado

import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UsersService } from './services/user.service';
import { ChangePasswordDto } from './dto/change-password.dto';


@Controller('users')
@UseGuards(AuthGuard('jwt')) // Garantiza que req.user contenga el payload del JWT
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @Roles('admin') // Si utilizas un Guard de Roles personalizado
  findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({
      limit: limit ? +limit : 10,
      offset: offset ? +offset : 0,
      search,
    });
  }

  @Patch(':id/roles')
  @Put(':id/roles')
  updateUserRoles(
    @Param('id') id: string,
    @Body('roles') roles: string[],
  ) {
    return this.usersService.updateUserRoles(id, roles);
  }

  /**
   * GET /api/users/profile
   */
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  /**
   * PATCH /api/users/profile
   */
  @Patch('profile')
  updateProfile(
    @Request() req,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, updateUserProfileDto);
  }

  /**
   * PATCH /api/users/change-password
   */
  @Patch('change-password')
  changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }
}