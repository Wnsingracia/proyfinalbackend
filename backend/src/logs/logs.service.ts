import { Injectable, NotFoundException } from '@nestjs/common';
import { LogAcceso } from './entities/logs.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm'


@Injectable()
export class LogsService {
    constructor(@InjectRepository(LogAcceso) private repositorio: Repository<LogAcceso>){}

    async obtTodo(){
        return await this.repositorio.find();
    }

    async obtLog(username:string){
        return await this.repositorio.findOne({
            where: {username_intento: Like(`%${username}`)},
            order: {
                fecha_hora: 'DESC'
            }
        }); 

    }
}
