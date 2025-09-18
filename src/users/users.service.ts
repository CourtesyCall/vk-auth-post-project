import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './enums/roles.enums';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({ order: { id: 'DESC' } });
  }

  async findByVkId(vkId: string): Promise<User | null> {
    const user= await this.userRepository.findOneBy({ vkId });

    return user;
  }

  async createUser(data: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(data);
    return this.userRepository.save(newUser);
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`Пользователь ${id} не найден`);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  async updateUserRole(id: number, role: Role): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден.`);
    }
    // Используем существующий метод updateUser или напрямую update
    await this.userRepository.update(id, { role });
    // Возвращаем обновленного пользователя
    return this.findById(id);
  }
}
