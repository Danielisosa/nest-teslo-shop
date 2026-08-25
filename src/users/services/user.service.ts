import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';


import { User } from 'src/auth/entities/user.entity';
import { UpdateUserProfileDto } from 'src/users/dto/update-user-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

    async findAll(paginationDto: { limit?: number; offset?: number; search?: string }) {
    const { limit = 10, offset = 0, search = '' } = paginationDto;

    try {
      const queryBuilder = this.userRepository.createQueryBuilder('user');

      if (search) {
        queryBuilder.where(
          '(LOWER(user.fullName) LIKE :search OR LOWER(user.email) LIKE :search)',
          { search: `%${search.toLowerCase()}%` }
        );
      }

      const [users, total] = await queryBuilder
        .take(limit)
        .skip(offset)
        .orderBy('user.createdAt', 'DESC')
        .getManyAndCount();

      return {
        users,
        total,
        limit,
        offset,
      };
    } catch (error) {
      console.error('findAll users error:', error);
      throw new InternalServerErrorException('Error al obtener la lista de usuarios');
    }
  }

  /**
   * actualiza el rol de un usuario
   */
  async updateUserRoles(id: string, roles: string[]): Promise<User> {
  const user = await this.findById(id);
  user.roles = roles;
  
  try {
    return await this.userRepository.save(user);
  } catch (error) {
    this.handleDBExceptions(error);
  }
}
  /**
   * Obtiene el perfil del usuario por ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * Actualiza la información básica del perfil (fullName, phone, avatarUrl, address)
   */
  async updateProfile(id: string, updateDto: UpdateUserProfileDto): Promise<User> {
    const user = await this.findById(id);

    // Merge de los datos enviados con los existentes
    const updatedUser = this.userRepository.merge(user, updateDto);

    try {
      return await this.userRepository.save(updatedUser);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Cambia la contraseña tras validar la contraseña actual
   */
  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Requerimos explícitamente el campo 'password' ya que tiene select: false en la entidad
    try {
      const user = await this.userRepository.findOne({
        where: { id, isActive: true },
        select: ['id', 'password'],
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (!user.password) {
        throw new InternalServerErrorException('No se pudo obtener la contraseña del usuario');
      }

      // Verificar si la contraseña actual coincide
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('La contraseña actual es incorrecta');
      }

      // Encriptar e ingresar la nueva contraseña
      user.password = await bcrypt.hash(newPassword, 10);
      await this.userRepository.save(user);

      return { message: 'Contraseña actualizada con éxito' };
    } catch (error) {
      console.error('changePassword error:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado al cambiar la contraseña');
    }
  }

  private handleDBExceptions(error: any): never {
    console.error(error);
    throw new InternalServerErrorException('Error inesperado al procesar la solicitud');
  }
}