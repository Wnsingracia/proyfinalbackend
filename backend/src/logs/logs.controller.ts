import { Controller, Get, Param } from '@nestjs/common';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService){}

    @Get()
    obtTodo(){
        return this.logsService.obtTodo();
    }

    @Get('usuario/:username')
    obtLog(@Param('username') username: string){
        return this.logsService.obtLog(username);
    }
}
