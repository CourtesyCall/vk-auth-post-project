import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Section } from '../../section/entities/section.entity';

export type PlaceholderType = 'text' | 'checkbox' | 'page' | 'select';

@Entity()
export class PlaceholderEntity
{

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: PlaceholderType;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  value?: string;

  @Column({ nullable: false })
  sortIndex: number;

  @Column({ default: false })
  isRequired: boolean

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  options: string[];

  @ManyToOne(() => Section, (section) => section.placeholders, {
    onDelete: 'CASCADE',
  })
  section: Section;


}
