import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Nota } from './nota.entity';
import { Like, Repository } from 'typeorm';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';

@Injectable()
export class NotasService {
  constructor(
    @InjectRepository(Nota)
    private notasRepository: Repository<Nota>,
  ) {}

  async findByTitle(title: string): Promise<Nota[]> {
    const notas = await this.notasRepository.find({
      where: {
        title: Like(`%${title}%`), 
      },
    });
    return notas;
  }
  async create(createNotaDto: CreateNotaDto): Promise<Nota> {
    const newNota = this.notasRepository.create(createNotaDto);
    return this.notasRepository.save(newNota);
  }

  async findOne(id: number): Promise<Nota> {
    const nota = await this.notasRepository.findOneBy({ id });
    if (!nota) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }
    return nota;
  }

  async findAll(): Promise<Nota[]> {
    return this.notasRepository.find();
  }

  async update(id: number, updateNotaDto: UpdateNotaDto): Promise<Nota> {
    const updateResult = await this.notasRepository.update(id, updateNotaDto);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.notasRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }
  }
}
