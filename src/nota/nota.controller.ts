import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { NotasService } from './nota.service';
import { Nota } from './nota.entity';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';

@Controller('notas')
export class NotasController {
  constructor(private readonly notasService: NotasService) {}
  @Post()
  async create(@Body() createNotaDto: CreateNotaDto): Promise<Nota> {
    return this.notasService.create(createNotaDto);
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Nota> {
    return this.notasService.findOne(+id);
  }
  @Get()
  async findAll(): Promise<Nota[]> {
    return this.notasService.findAll();
  }
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNotaDto: UpdateNotaDto,
  ): Promise<Nota> {
    return this.notasService.update(+id, updateNotaDto);
  }
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.notasService.remove(+id);
  }
  //para buscar por titulo
  @Get('search/:title')
  async findByTitle(@Param('title') title: string): Promise<Nota[]> {
    return this.notasService.findByTitle(title);
  }
}