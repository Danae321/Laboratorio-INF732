import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { TareaService } from './tarea.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { Tarea } from './tarea.entity';

@Controller('tarea')
export class TareaController {
  constructor(private tareaService: TareaService) {}

  @Post()
  create(@Body() dto: CreateTareaDto): Promise<Tarea> {
    return this.tareaService.create(dto);
  }

  @Get()
  findAll(): Promise<Tarea[]> {
    return this.tareaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Tarea> {
    return this.tareaService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTareaDto,
  ): Promise<Tarea> {
    return this.tareaService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.tareaService.remove(+id);
  }

  @Get('titulo/:title')
async getTareasByTitle(@Param('title') title: string) {
  const tareas = await this.tareaService.findByTitle(title);
  if (!tareas || tareas.length === 0) {
    throw new NotFoundException(`Tarea con el título ${title} no encontrada`);
  }
  return tareas;
}


}
