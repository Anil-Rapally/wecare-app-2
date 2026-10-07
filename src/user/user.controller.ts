import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create_user.dto';
import { AuthGuard, RequirePurpose } from '../common/guards/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  BadRequestException,
  Controller,
  FileTypeValidator,
  Get,
  Header,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersEntity } from './entity/users.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({
    summary: `If only email is provided, an OTP will be generated and sent.
     If both email and OTP are provided, the OTP will be verified.` })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: `OTP sent successfully if only email is provided; 
    OTP verified if both email and OTP are provided`,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid, expired, or already-used OTP',
  })
  @ApiResponse({
    status: 429,
    description: `Too many login or OTP requests if only email is provided;
    Too many OTP verification attempts if both email and OTP are provided`,
  })
  @ApiResponse({
    status: 503,
    description: 'Email could not be sent',
  })
  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }


  @ApiOperation({ summary: 'Complete new-user registration' })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Account created and access token returned',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, expired, or incorrect-purpose token',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid signup data',
  })
  @Post('signup')
  @Header('Cache-Control', 'no-store')
  @UseGuards(AuthGuard)
  @RequirePurpose('signup')
  signup(@CurrentUser() user: UsersEntity, @Body() dto: CreateUserDto) {
    return this.userService.createUser(user.id, dto);
  }



  @ApiOperation({ summary: 'Upload or replace the profile photo' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'JPEG, PNG, or WebP image up to 2 MB',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile photo uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Missing, invalid, or oversized image',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
  })
  @Post('uploadphoto')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @UseGuards(AuthGuard)
  @RequirePurpose('access')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { files: 1, fields: 0, fileSize: 2 * 1024 * 1024 },
    }),
  )
  uploadPhoto(
    @CurrentUser() user: UsersEntity,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        exceptionFactory: (message) =>
          new BadRequestException({
            message:
              message === 'File is required'
                ? 'validation.upload_photo_required'
                : message,
          }),
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024,
            message: 'validation.upload_photo_size',
          }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
            errorMessage: 'validation.upload_photo_format',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.uploadProfilePhoto(user.id, file);
  }




  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'Authenticated user profile returned',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
  })
  @Get('userprofile')
  @Header('Cache-Control', 'no-store')
  @UseGuards(AuthGuard)
  @RequirePurpose('access')
  getProfile(@CurrentUser() user: UsersEntity) {
    return {
      message: 'validation.profile_retrieved',
      ...this.userService.publicUser(user),
    };
  }





  @ApiOperation({ summary: 'Get the authenticated user profile photo' })
  @ApiBearerAuth('access-token')
  @ApiProduces('image/jpeg')
  @ApiResponse({
    status: 200,
    description: 'Profile photo returned',
    content: {
      'image/jpeg': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Profile photo not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
  })
  @Get('userprofilephoto')
  @Header('Cache-Control', 'no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  @UseGuards(AuthGuard)
  @RequirePurpose('access')
  async getPhoto(@CurrentUser() user: UsersEntity) {
    return new StreamableFile(await this.userService.getProfilePhoto(user.id), {
      type: 'image/jpeg',
      disposition: 'inline; filename="profile.jpg"',
    });
  }
}
