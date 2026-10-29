import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create_user.dto';
import { AuthGuard } from '../common/guards/auth.guard';
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
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { UsersEntity } from './entity/users.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserProfileDto } from './dto/update_user_profile.dto';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadPath = join(process.cwd(), 'uploads/photos');

if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}

const storage = diskStorage({
  destination: uploadPath,
  filename: (req, file, callback) => {
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      extname(file.originalname);

    callback(null, uniqueName);
  },
});

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({
    summary: `If only email or phone number is provided, an OTP will be generated and sent.
     If both email/phone number and OTP are provided, the OTP will be verified.` })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: `OTP sent successfully if only email or phone number is provided; 
    OTP verified if both email/phone number and OTP are provided`,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid, expired, or already-used OTP',
  })
  @ApiResponse({
    status: 429,
    description: `Too many login or OTP requests if only email or phone number is provided;
    Too many OTP verification attempts if both email/phone number  and OTP are provided`,
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { files: 1, fields: 0, fileSize: 2 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        callback(null, true);
      },
    }),
  )
  uploadPhoto(
    @CurrentUser() user: UsersEntity,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        exceptionFactory: (message) => {
          return new BadRequestException({
            message:
              message === 'File is required'
                ? 'validation.upload_photo_required'
                : message,
          });
        },
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024,
            message: 'validation.upload_photo_size',
          }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
            skipMagicNumbersValidation: true,
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
  getProfile(@CurrentUser() user: UsersEntity) {
    return this.userService.publicUser(user.id);
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
  @UseGuards(AuthGuard)
  async getPhoto(@CurrentUser() user: UsersEntity) {
    return this.userService.getProfilePhoto(user.id);
  }

  @Post('skip')
  @UseGuards(AuthGuard)
  skipOnboarding(@CurrentUser() user: UsersEntity) {
    return this.userService.skipSignup(user.id);
  }

  @ApiOperation({ summary: 'update user profile' })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'user profile updated',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
  })
  @Patch('updateprofile')
  @UseGuards(AuthGuard)
  updateProfile(@CurrentUser() user: UsersEntity, @Body() dto: UpdateUserProfileDto) {
    return this.userService.updateUserProfile(user.id, dto);
  }
}
