import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateMoviesAndScreenings1793983000000 implements MigrationInterface {
  name = 'CreateMoviesAndScreenings1793983000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'movies',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '180' },
          { name: 'duration', type: 'int' },
          { name: 'date', type: 'date' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'screenings',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'scheduled_at', type: 'datetime' },
          { name: 'theater_id', type: 'int' },
          { name: 'movie_id', type: 'int' },
        ],
      }),
    );

    await queryRunner.createForeignKeys('screenings', [
      new TableForeignKey({
        name: 'FK_screenings_theater_id_theaters_id',
        columnNames: ['theater_id'],
        referencedTableName: 'theaters',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
      new TableForeignKey({
        name: 'FK_screenings_movie_id_movies_id',
        columnNames: ['movie_id'],
        referencedTableName: 'movies',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('screenings');
    await queryRunner.dropTable('movies');
  }
}
