import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TripService } from '../src/trip/trip.service';

describe('Voyages (e2e)', () => {
  let app: INestApplication;
  let tripService: TripService;
  const createdIds: string[] = [];
  const validUserId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    tripService = moduleFixture.get<TripService>(TripService);
  }, 30000); // 30s au lieu des 5s par défaut, le temps que TypeORM se connecte

afterAll(async () => {
  // Les voyages de test restent en base avec le statut ANNULE
  // (cohérent avec la logique métier : pas de suppression réelle).
  // Pas besoin de nettoyage actif ici.
  if (app) {
    await app.close();
  }
}, 30000);

  it('POST /voyages crée un voyage (201)', async () => {
    const res = await request(app.getHttpServer())
      .post('/voyages')
      .send({
        userId: validUserId,
        destination: 'TEST_E2E_Destination',
        dateDebut: '2026-10-01',
        dateFin: '2026-10-10',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.statut).toBe('A_VENIR');
    createdIds.push(res.body.id);
  });

  it('POST /voyages rejette une requête invalide (400)', async () => {
    await request(app.getHttpServer())
      .post('/voyages')
      .send({ destination: 'Sans userId ni dates' })
      .expect(400);
  });

  it('GET /voyages/:id retourne le voyage créé (200)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/voyages/${createdIds[0]}`)
      .expect(200);

    expect(res.body.destination).toBe('TEST_E2E_Destination');
  });

  it('GET /voyages/:id renvoie 404 pour un id inexistant', async () => {
    await request(app.getHttpServer())
      .get('/voyages/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('PUT /voyages/:id modifie le voyage (200)', async () => {
    const res = await request(app.getHttpServer())
      .put(`/voyages/${createdIds[0]}`)
      .send({ destination: 'TEST_E2E_Destination_Modifiee' })
      .expect(200);

    expect(res.body.destination).toBe('TEST_E2E_Destination_Modifiee');
  });

  it('DELETE /voyages/:id annule le voyage sans le supprimer (200)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/voyages/${createdIds[0]}`)
      .expect(200);

    expect(res.body.statut).toBe('ANNULE');
    expect(res.body.archivedAt).not.toBeNull();

    const check = await request(app.getHttpServer())
      .get(`/voyages/${createdIds[0]}`)
      .expect(200);
    expect(check.body.statut).toBe('ANNULE');
  });

  it('GET /voyages?statut=ANNULE isole les voyages annulés', async () => {
    const res = await request(app.getHttpServer())
      .get('/voyages?statut=ANNULE')
      .expect(200);

    const ids = res.body.map((v: any) => v.id);
    expect(ids).toContain(createdIds[0]);
  });
});