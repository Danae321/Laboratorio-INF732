import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTareaDto {
    @IsString()
    @IsNotEmpty({ message: 'El título es requerido' })
    @IsOptional()
    title?: string;

    @IsString()
    @IsNotEmpty({ message: 'El contenido es requerido' })
    @IsOptional()
    content?: string;

    @IsBoolean()
    @IsNotEmpty({ message: 'El estado de completado es requerido' })
    @IsOptional()
    completed?: boolean;
}
