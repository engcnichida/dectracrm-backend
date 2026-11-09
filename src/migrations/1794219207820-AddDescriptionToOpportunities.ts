import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDescriptionToOpportunities1794219207820 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona a coluna 'description' na tabela 'opportunities'
    await queryRunner.addColumn(
      'opportunities',
      new TableColumn({
        name: 'description',
        type: 'text',
        isNullable: true,
        default: null,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove a coluna se precisarmos reverter a migration
    await queryRunner.dropColumn('opportunities', 'description');
  }
}