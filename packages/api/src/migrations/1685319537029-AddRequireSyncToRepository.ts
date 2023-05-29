import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequireSyncToRepository1685319537029
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "repository" ADD "needs_recalculation" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "repository" DROP COLUMN "needs_recalculation"`,
    );
  }
}
