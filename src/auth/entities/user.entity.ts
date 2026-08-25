import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Product } from '../../products/entities';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text', {
        select: false
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('text', {
        nullable: true
    })
    phone?: string;

    @Column('text', {
        nullable: true
    })
    avatarUrl?: string;
    
   @Column('jsonb', {
        nullable: true
    })
    address?: Address;

    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];

    @OneToMany(
        () => Product,
        ( product ) => product.user
    )
    product: Product[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;


    @BeforeInsert()
    checkFieldsBeforeInsert() {
        if (this.email && typeof this.email === 'string') {
            this.email = this.email.toLowerCase().trim();
        }
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();   
    }

}
