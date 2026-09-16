import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CreateUserDto } from './dto/create_user.dto';
import { AuthGuard, RequirePurpose } from '../common/guards/auth.guard';
import { MAX_PHOTO_BYTES } from './photo/photo.service';
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
  Controller,
  Get,
  Header,
  HttpCode,
  ParseFilePipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserEntity } from './entity/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Request an email OTP' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login or OTP requests',
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

  @ApiOperation({ summary: 'Verify an email OTP' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP verified; returns either a signup token or access token',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid, expired, or already-used OTP',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many verification attempts',
  })
  @Post('verify-otp')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.userService.verifyOtp(verifyOtpDto);
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
  signup(@CurrentUser() user: UserEntity, @Body() dto: CreateUserDto) {
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
          description: 'JPEG, PNG, or WebP image up to 2 MiB',
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
  @Post('profile-photo')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @UseGuards(AuthGuard)
  @RequirePurpose('access')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_PHOTO_BYTES, files: 1, fields: 0 },
    }),
  )
  uploadPhoto(
    @CurrentUser() user: UserEntity,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true })) file: Express.Multer.File,
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
  @Get('profile')
  @Header('Cache-Control', 'no-store')
  @UseGuards(AuthGuard)
  @RequirePurpose('access')
  getProfile(@CurrentUser() user: UserEntity) {
    return {
      ...this.userService.publicUser(user),
      isEmailVerified: user.isEmailVerified,
      isProfileExists: user.isProfileExists,
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
  @Get('profile-photo')
  @Header('Cache-Control', 'no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  @UseGuards(AuthGuard)
  @RequirePurpose('access')
  async getPhoto(@CurrentUser() user: UserEntity) {
    return new StreamableFile(await this.userService.getProfilePhoto(user.id), {
      type: 'image/jpeg',
      disposition: 'inline; filename="profile.jpg"',
    });
  }
}
