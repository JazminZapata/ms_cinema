import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

export class CreateProjectors1793380950000 implements MigrationInterface {
  name = 'CreateProjectors1793380950000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'projectors',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'brand', type: 'varchar', length: '120' },
          { name: 'high', type: 'int' },
          { name: 'width', type: 'int' },
          { name: 'theater_id', type: 'int', isNullable: true },
        ],
      }),
    );
    await queryRunner.createUniqueConstraint(
      'projectors',
      new TableUnique({
        name: 'UQ_projectors_theater_id',
        columnNames: ['theater_id'],
      }),
    );
    await queryRunner.createForeignKey(
      'projectors',
      new TableForeignKey({
        name: 'FK_projectors_theater_id_theaters_id',
        columnNames: ['theater_id'],
        referencedTableName: 'theaters',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'projectors',
      'FK_projectors_theater_id_theaters_id',
    );
    await queryRunner.dropUniqueConstraint(
      'projectors',
      'UQ_projectors_theater_id',
    );
    await queryRunner.dropTable('projectors');
  }
}
