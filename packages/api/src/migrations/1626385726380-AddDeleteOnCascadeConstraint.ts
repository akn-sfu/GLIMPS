import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeleteOnCascadeConstraint1626385726380
  implements MigrationInterface
{
  name = 'AddDeleteOnCascadeConstraint1626385726380';
  //note CreateCommitToMergeRequestRelationship1613631792035 already has constraints that have 'ON DELETE CASCADE'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "diff" DROP CONSTRAINT "FK_1bc0e37ef1a31b563f155b1e761"`,
    );
    await queryRunner.query(
      `ALTER TABLE "diff" ADD CONSTRAINT "FK_1bc0e37ef1a31b563f155b1e761" FOREIGN KEY ("commit_id") REFERENCES "commit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "diff" DROP CONSTRAINT "FK_c7dd3e33f6ad73c16645ceccde4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "diff" ADD CONSTRAINT "FK_c7dd3e33f6ad73c16645ceccde4" FOREIGN KEY ("merge_request_id") REFERENCES "merge_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "note" DROP CONSTRAINT "FK_1b56c4e6dc33741bd98a7532391"`,
    );
    await queryRunner.query(
      `ALTER TABLE "note" ADD CONSTRAINT "FK_1b56c4e6dc33741bd98a7532391" FOREIGN KEY ("merge_request_id") REFERENCES "merge_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "note" DROP CONSTRAINT "FK_04dd9d670ca2029b59d33b61531"`,
    );
    await queryRunner.query(
      `ALTER TABLE "note" ADD CONSTRAINT "FK_04dd9d670ca2029b59d33b61531" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "issue" DROP CONSTRAINT "FK_d4e078226c68d8f626200ee28ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue" ADD CONSTRAINT "FK_d4e078226c68d8f626200ee28ed" FOREIGN KEY ("repository_id") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "repository_member" DROP CONSTRAINT "FK_29f90c94646980c212220e4e9ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "repository_member" ADD CONSTRAINT "FK_29f90c94646980c212220e4e9ea" FOREIGN KEY ("repository_id") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "commit" DROP CONSTRAINT "FK_8046198d7115b252bb07066ffbb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "commit" ADD CONSTRAINT "FK_8046198d7115b252bb07066ffbb" FOREIGN KEY ("repository_id") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "merge_request" DROP CONSTRAINT "FK_24f6061fa3437dfc2e1577723e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merge_request" ADD CONSTRAINT "FK_24f6061fa3437dfc2e1577723e2" FOREIGN KEY ("repository_id") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "commit_author" DROP CONSTRAINT "FK_37a08efa127f1ed612125071e5e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "commit_author" ADD CONSTRAINT "FK_37a08efa127f1ed612125071e5e" FOREIGN KEY ("repository_member_id") REFERENCES "repository_member"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "commit_author" DROP CONSTRAINT "FK_02f261d7e092b823f2d0b25ea87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "commit_author" ADD CONSTRAINT "FK_02f261d7e092b823f2d0b25ea87" FOREIGN KEY ("repository_id") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "merge_request_participant" DROP CONSTRAINT "FK_4788b6dc0350aab05a9b5255d16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merge_request_participant" ADD CONSTRAINT "FK_4788b6dc0350aab05a9b5255d16" FOREIGN KEY ("merge_request_id") REFERENCES "merge_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "diff" DROP CONSTRAINT "FK_1bc0e37ef1a31b563f155b1e761"`,
    );
    await queryRunner.query(
      `ALTER TABLE "diff" DROP CONSTRAINT "FK_c7dd3e33f6ad73c16645ceccde4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "note" DROP CONSTRAINT "FK_1b56c4e6dc33741bd98a7532391"`,
    );
    await queryRunner.query(
      `ALTER TABLE "note" DROP CONSTRAINT "FK_04dd9d670ca2029b59d33b61531"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue" DROP CONSTRAINT "FK_d4e078226c68d8f626200ee28ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "repository_member" DROP CONSTRAINT "FK_29f90c94646980c212220e4e9ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "commit" DROP CONSTRAINT "FK_8046198d7115b252bb07066ffbb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merge_request" DROP CONSTRAINT "FK_24f6061fa3437dfc2e1577723e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "commit_author" DROP CONSTRAINT "FK_37a08efa127f1ed612125071e5e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "commit_author" DROP CONSTRAINT "FK_02f261d7e092b823f2d0b25ea87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merge_request_participant" DROP CONSTRAINT "FK_4788b6dc0350aab05a9b5255d16"`,
    );
  }
}
