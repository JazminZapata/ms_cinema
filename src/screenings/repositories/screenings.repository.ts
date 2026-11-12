import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ScreeningsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findNextThreeIds(): Promise<number[]> {
    const rows = (await this.dataSource.query(
      `SELECT id
       FROM screenings
       WHERE scheduled_at >= NOW()
       ORDER BY scheduled_at ASC, id ASC
       LIMIT 3`,
    )) as Array<{ id: number }>;
    return rows.map(({ id }) => Number(id));
  }
}
