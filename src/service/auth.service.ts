import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginRequestDto } from '../dto/login-request.dto.js';
import { LoginResponseDto } from '../dto/login-response.dto.js';
import { Member } from '../entity/member.entity.js';
import { ApiException } from '../exception/api.exception.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    // 1. 이메일로 회원 찾기 (없어도 '없는 이메일'이라고 알려주지 않습니다)
    const member = await this.memberRepository.findOne({
      where: { email: dto.email },
    });
    if (!member) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'AUTH401_1',
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 2. 비밀번호 비교 (저장된 해시에서 salt를 꺼내 같은 방식으로 대조)
    const isMatched = await bcrypt.compare(dto.password, member.password);
    if (!isMatched) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'AUTH401_1',
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 3. 토큰 발급 (sub = 이 토큰의 주인)
    const accessToken = await this.jwtService.signAsync({
      sub: String(member.memberId),
      email: member.email,
    });

    return { nickname: member.nickname, accessToken };
  }
}
