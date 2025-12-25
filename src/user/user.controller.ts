import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { UserSubjectResponseDto } from './dto/user-subject-response.dto';
import { PaginationQueryDto } from '../common/pagination/pagination.dto';
import { Query, UseInterceptors } from '@nestjs/common';
import { PaginateInterceptor } from '../common/pagination/paginate.interceptor';
import { Paginated } from 'src/common/pagination/paginated.interface';
import { Serialize } from 'src/common/decorators/serialize.decorator';


@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')

export class UserController {
    constructor(private userService: UserService) { }

    @Get()
    @ApiOperation({
        summary: 'Get all users',
        description: 'Retrieves a list of all users in the system',
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
        type: [UserResponseDto],
    })
    @UseInterceptors(PaginateInterceptor)
    @Serialize(UserResponseDto)
    async findAll(@Query() query: PaginationQueryDto): Promise<Paginated<UserResponseDto>> {
        return await this.userService.findAll(query.page, query.limit);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get user by ID',
        description: 'Retrieves a specific user by their ID',
    })
    @ApiResponse({
        status: 200,
        description: 'User retrieved successfully',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    @Serialize(UserResponseDto)
    async findById(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.findById(id);
    }
}
