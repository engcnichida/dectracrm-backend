"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDescriptionToOpportunities1794219207820 = void 0;
const typeorm_1 = require("typeorm");
class AddDescriptionToOpportunities1794219207820 {
    async up(queryRunner) {
        await queryRunner.addColumn('opportunities', new typeorm_1.TableColumn({
            name: 'description',
            type: 'text',
            isNullable: true,
            default: null,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('opportunities', 'description');
    }
}
exports.AddDescriptionToOpportunities1794219207820 = AddDescriptionToOpportunities1794219207820;
//# sourceMappingURL=1794219207820-AddDescriptionToOpportunities.js.map