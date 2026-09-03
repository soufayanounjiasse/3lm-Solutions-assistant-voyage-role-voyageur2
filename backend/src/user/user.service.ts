import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { UserIdentity } from './entities/user-identity.entity';
import { UserPreference } from './entities/user-preference.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserIdentity) private readonly identityRepository: Repository<UserIdentity>,
    @InjectRepository(UserPreference) private readonly preferenceRepository: Repository<UserPreference>,
    @InjectRepository(PasswordResetToken) private readonly resetTokenRepository: Repository<PasswordResetToken>,
    private readonly jwtService: JwtService,
  ) {}

  private issueToken(user: User) {
    const payload = { sub: user.id, email: user.email ?? undefined };
    return this.jwtService.sign(payload);
  }

  private sanitize(user: User) {
    const { passwordHash, ...rest } = user as any;
    return rest;
  }

  async register(dto: RegisterDto) {
    if (dto.email) {
      const existing = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Un compte existe déjà avec cet email.');
    }
    if (dto.telephone) {
      const existing = await this.userRepository.findOne({ where: { telephone: dto.telephone } });
      if (existing) throw new ConflictException('Un compte existe déjà avec ce téléphone.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.userRepository.create({
      email: dto.email,
      telephone: dto.telephone,
      passwordHash,
      prenom: dto.prenom,
      nom: dto.nom,
    });
    const saved = await this.userRepository.save(user);
    return { user: this.sanitize(saved), accessToken: this.issueToken(saved) };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :identifiant OR user.telephone = :identifiant', {
        identifiant: dto.identifiant,
      })
      .getOne();
    if (!user || !user.passwordHash) throw new UnauthorizedException('Identifiants invalides.');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides.');

    return { user: this.sanitize(user), accessToken: this.issueToken(user) };
  }

  async socialLogin(dto: SocialLoginDto) {
    let identity = await this.identityRepository.findOne({
      where: { provider: dto.provider, providerUserId: dto.providerUserId },
      relations: { user: true },
    });

    if (identity) {
      return { user: this.sanitize(identity.user), accessToken: this.issueToken(identity.user) };
    }

    // Première connexion via ce fournisseur : créer le compte utilisateur associé
    const user = this.userRepository.create({
      email: dto.email,
      prenom: dto.prenom ?? 'Utilisateur',
      nom: dto.nom ?? dto.provider,
    });
    const savedUser = await this.userRepository.save(user);

    identity = this.identityRepository.create({
      userId: savedUser.id,
      provider: dto.provider,
      providerUserId: dto.providerUserId,
    });
    await this.identityRepository.save(identity);

    return { user: this.sanitize(savedUser), accessToken: this.issueToken(savedUser) };
  }

  async forgotPassword(identifiant: string) {
    const user = await this.userRepository.findOne({
      where: [{ email: identifiant }, { telephone: identifiant }],
    });
    // Réponse identique que l'utilisateur existe ou non, pour ne pas divulguer l'existence d'un compte.
    if (!user) return { message: 'Si ce compte existe, un lien de réinitialisation a été envoyé.' };

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    const resetToken = this.resetTokenRepository.create({ userId: user.id, tokenHash, expiresAt });
    await this.resetTokenRepository.save(resetToken);

    // TODO: envoyer rawToken par email/SMS une fois le service de notification en place.
    // En attendant, on le retourne directement (uniquement utile en développement).
    return {
      message: 'Si ce compte existe, un lien de réinitialisation a été envoyé.',
      devToken: rawToken,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetToken = await this.resetTokenRepository.findOne({ where: { tokenHash } });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Lien de réinitialisation invalide ou expiré.');
    }

    const user = await this.userRepository.findOne({ where: { id: resetToken.userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepository.save(user);

    resetToken.usedAt = new Date();
    await this.resetTokenRepository.save(resetToken);

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  async getProfile(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return this.sanitize(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);
    return this.sanitize(saved);
  }

  async getPreferences(userId: string) {
    let pref = await this.preferenceRepository.findOne({ where: { userId } });
    if (!pref) {
      pref = this.preferenceRepository.create({ userId, centresInteret: [] });
      pref = await this.preferenceRepository.save(pref);
    }
    return pref;
  }

  async updatePreferences(userId: string, dto: UpdatePreferenceDto) {
    let pref = await this.preferenceRepository.findOne({ where: { userId } });
    if (!pref) {
      pref = this.preferenceRepository.create({ userId });
    }
    Object.assign(pref, dto);
    return this.preferenceRepository.save(pref);
  }
}