import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Theater } from '../theaters/entities/theater.entity';
import { Projector } from './entities/projector.entity';
import { ProjectorsService } from './projectors.service';

describe('ProjectorsService', () => {
  let service: ProjectorsService;
  let projectorsRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
    save: jest.Mock;
  };
  let theatersRepository: { findOne: jest.Mock };

  beforeEach(async () => {
    projectorsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      save: jest.fn(),
    };
    theatersRepository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectorsService,
        {
          provide: getRepositoryToken(Projector),
          useValue: projectorsRepository,
        },
        {
          provide: getRepositoryToken(Theater),
          useValue: theatersRepository,
        },
      ],
    }).compile();

    service = module.get(ProjectorsService);
  });

  it('creates a projector without associating a theater', async () => {
    const projector = Object.assign(new Projector(), {
      id: 1,
      brand: 'Epson',
      high: 1080,
      width: 1920,
    });
    projectorsRepository.save.mockResolvedValue(projector);
    projectorsRepository.findOne.mockResolvedValue(projector);

    await expect(
      service.create({ brand: 'Epson', high: 1080, width: 1920 }),
    ).resolves.toEqual({
      id: 1,
      brand: 'Epson',
      high: 1080,
      width: 1920,
      theaterId: undefined,
    });
    expect(theatersRepository.findOne).not.toHaveBeenCalled();
  });

  it('rejects association with a theater that does not exist', async () => {
    theatersRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        brand: 'Epson',
        high: 1080,
        width: 1920,
        theaterId: 99,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(projectorsRepository.save).not.toHaveBeenCalled();
  });

  it('rejects association with a theater that already has a projector', async () => {
    const theater = Object.assign(new Theater(), {
      id: 2,
      projector: Object.assign(new Projector(), { id: 8 }),
    });
    theatersRepository.findOne.mockResolvedValue(theater);

    await expect(
      service.create({
        brand: 'Epson',
        high: 1080,
        width: 1920,
        theaterId: 2,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(projectorsRepository.save).not.toHaveBeenCalled();
  });

  it('includes the theater id when reading an associated projector', async () => {
    const projector = Object.assign(new Projector(), {
      id: 1,
      brand: 'Epson',
      high: 1080,
      width: 1920,
      theater: Object.assign(new Theater(), { id: 3 }),
    });
    projectorsRepository.findOne.mockResolvedValue(projector);

    await expect(service.findOne(1)).resolves.toMatchObject({ theaterId: 3 });
  });

  it('returns a not found error for an unknown projector', async () => {
    projectorsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
