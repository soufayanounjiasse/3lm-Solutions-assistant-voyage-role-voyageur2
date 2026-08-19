import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TripService } from './trip.service';
import { Voyage, VoyageStatut } from './entities/voyage.entity';

type MockRepo = Partial<Record<keyof Repository<Voyage>, jest.Mock>>;

const createMockRepo = (): MockRepo => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
});

describe('TripService', () => {
  let service: TripService;
  let repo: MockRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        { provide: getRepositoryToken(Voyage), useValue: createMockRepo() },
      ],
    }).compile();

    service = module.get<TripService>(TripService);
    repo = module.get(getRepositoryToken(Voyage));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('crée un voyage avec le statut A_VENIR par défaut', async () => {
      const dto = {
        userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        destination: 'Paris, France',
        dateDebut: '2026-09-15',
        dateFin: '2026-09-25',
      };
      repo.save!.mockImplementation((v) => Promise.resolve({ id: 'generated-id', ...v }));

      const result = await service.create(dto);

      expect(repo.save).toHaveBeenCalled();
      expect(result.statut).toBe(VoyageStatut.A_VENIR);
      expect(result.destination).toBe('Paris, France');
    });
  });

  describe('findAll', () => {
    it('filtre par userId et statut quand fournis', async () => {
      repo.find!.mockResolvedValue([]);

      await service.findAll('user-1', VoyageStatut.A_VENIR);

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', statut: VoyageStatut.A_VENIR },
        }),
      );
    });

    it("ne filtre rien quand aucun paramètre n'est fourni", async () => {
      repo.find!.mockResolvedValue([]);

      await service.findAll();

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe('findOne', () => {
    it('retourne le voyage trouvé', async () => {
      const voyage = { id: 'v1', destination: 'Lyon' } as Voyage;
      repo.findOne!.mockResolvedValue(voyage);

      const result = await service.findOne('v1');

      expect(result).toEqual(voyage);
    });

    it("lève une NotFoundException si le voyage n'existe pas", async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(service.findOne('inconnu')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('met à jour uniquement les champs fournis', async () => {
      const existing = {
        id: 'v1',
        destination: 'Lyon',
        dateDebut: new Date('2026-09-01'),
        dateFin: new Date('2026-09-10'),
        userId: 'user-1',
      } as Voyage;
      repo.findOne!.mockResolvedValue(existing);
      repo.save!.mockImplementation((v) => Promise.resolve(v));

      const result = await service.update('v1', { destination: 'Marseille' });

      expect(result.destination).toBe('Marseille');
      expect(result.dateDebut).toEqual(existing.dateDebut);
    });

    it("lève une NotFoundException si le voyage à modifier n'existe pas", async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(service.update('inconnu', { destination: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancel', () => {
    it('passe le statut à ANNULE et renseigne archivedAt', async () => {
      const existing = { id: 'v1', statut: VoyageStatut.A_VENIR, userId: 'user-1' } as Voyage;
      repo.findOne!.mockResolvedValue(existing);
      repo.save!.mockImplementation((v) => Promise.resolve(v));

      const result = await service.cancel('v1');

      expect(result.statut).toBe(VoyageStatut.ANNULE);
      expect(result.archivedAt).toBeInstanceOf(Date);
    });

    it("lève une NotFoundException si le voyage à annuler n'existe pas", async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(service.cancel('inconnu')).rejects.toThrow(NotFoundException);
    });
  });
});