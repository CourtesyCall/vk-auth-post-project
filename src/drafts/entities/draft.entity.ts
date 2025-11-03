import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity/user.entity';
import { Template } from '../../template/entities/template.entity';
// @Unique гарантирует, что у одного пользователя
// может быть только один черновик для одного шаблона
@Unique(['user', 'template'])
@Entity()
export class Draft {

  @PrimaryGeneratedColumn()
  id: number;

  // 1. Связь с пользователем
  // Это автоматически создаст колонку 'userId'
  @ManyToOne(() => User, { nullable: false, eager: false })
  user: User;

  // 2. Связь с шаблоном
  // Это автоматически создаст колонку 'templateId'
  @ManyToOne(() => Template, { nullable: false, eager: false })
  template: Template;

  @Column({unique: true})
  user_id: number;
  @Column()
  template_id: number;
  // 3. Используем 'jsonb' для PostgreSQL.
  // 'json' для MySQL
  @Column({
    type: 'jsonb',
    default: {}, // Хорошая практика - задать значение по умолчанию
  })
  form_data: Record<string, any>; // Используем Record<string, any> вместо JSON

  @Column({
    type: 'jsonb',
    default: [], // По умолчанию - пустой массив
  })
  file_names: string[]; // Массив строк

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
