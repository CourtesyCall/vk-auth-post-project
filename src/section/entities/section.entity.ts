import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlaceholderEntity } from '../../placeholder/placeholer.entity/placeholderEntity';
import { Template } from '../../template/entities/template.entity';



@Entity()
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  isTitleVisible: boolean;

  @Column()
  isCollapsedByDefault: boolean

  @Column({ type: 'int', default: 0 }) // <-- ДОБАВЬТЕ ЭТО ПОЛЕ
  sortIndex: number;

  @OneToMany(() => PlaceholderEntity, (placeholder) => placeholder.section)
  placeholders: PlaceholderEntity[];

  @ManyToMany(() => Template, (template) => template.sections)
  templates: Template[];


}
