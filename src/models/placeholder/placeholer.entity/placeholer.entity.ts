import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type PlaceholderType = 'text' | 'checkbox' | 'page';

@Entity()
export class PlaceholerEntity
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


}
