import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { Theater } from '../theaters/entities/theater.entity';
import { Screening } from './entities/screening.entity';
import { ScreeningsRepository } from './repositories/screenings.repository';
import { ScreeningsService } from './screenings.service';

describe('ScreeningsService', () => {
  let service: ScreeningsService;
  const screeningsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
  };
  const theatersRepository = { findOneBy: jest.fn() };
  const moviesRepository = { findOneBy: jest.fn() };
  const customScreeningsRepository = { findNextThreeIds: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScreeningsService,
        {
          provide: getRepositoryToken(Screening),
          useValue: screeningsRepository,
        },
        {
          provide: getRepositoryToken(Theater),
          useValue: theatersRepository,
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: moviesRepository,
        },
        {
          provide: ScreeningsRepository,
          useValue: customScreeningsRepository,
        },
      ],
    }).compile();

    service = module.get(ScreeningsService);
  });

  it('creates a screening using existing theater and movie records', async () => {
    const theater = Object.assign(new Theater(), { id: 2 });
    const movie = Object.assign(new Movie(), { id: 5 });
    const scheduledAt = new Date('2026-11-15T19:30:00.000Z');
    theatersRepository.findOneBy.mockResolvedValue(theater);
    moviesRepository.findOneBy.mockResolvedValue(movie);
    screeningsRepository.save.mockResolvedValue({ id: 7 });
    screeningsRepository.findOne.mockResolvedValue(
      Object.assign(new Screening(), {
        id: 7,
        scheduledAt,
        theater,
        movie,
      }),
    );

    await expect(
      service.create({
        scheduledAt: scheduledAt.toISOString(),
        theaterId: theater.id,
        movieId: movie.id,
      }),
    ).resolves.toEqual({
      id: 7,
      scheduledAt,
      theaterId: 2,
      movieId: 5,
    });
    expect(screeningsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        scheduledAt,
        theater,
        movie,
      }),
    );
  });

  it('rejects a screening when its theater does not exist', async () => {
    theatersRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.create({
        scheduledAt: '2026-11-15T19:30:00.000Z',
        theaterId: 404,
        movieId: 5,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(moviesRepository.findOneBy).not.toHaveBeenCalled();
    expect(screeningsRepository.save).not.toHaveBeenCalled();
  });

  it('preserves the ordering of the upcoming screenings report', async () => {
    const theater = Object.assign(new Theater(), { id: 1 });
    const movie = Object.assign(new Movie(), { id: 1 });
    const records = new Map<number, Screening>();
    for (const id of [3, 1, 2]) {
      records.set(
        id,
        Object.assign(new Screening(), {
          id,
          scheduledAt: new Date(`2026-11-${15 + id}T19:30:00.000Z`),
          theater,
          movie,
        }),
      );
    }
    customScreeningsRepository.findNextThreeIds.mockResolvedValue([3, 1, 2]);
    screeningsRepository.findOne.mockImplementation(({ where }) =>
      Promise.resolve(records.get(where.id)),
    );

    const result = await service.getNextThree();

    expect(result.map(({ id }) => id)).toEqual([3, 1, 2]);
  });
});
