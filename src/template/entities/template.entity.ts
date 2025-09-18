import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Section } from '../../section/entities/section.entity';


@Entity()
export class Template {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Section, (section) => section.templates)
  @JoinTable({
    name: 'template_sections_section',
    joinColumn: {            // FK -> template.id
      name: 'templateId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {     // FK -> section.id
      name: 'sectionId',
      referencedColumnName: 'id',
    },
  })
  sections: Section[];



}
