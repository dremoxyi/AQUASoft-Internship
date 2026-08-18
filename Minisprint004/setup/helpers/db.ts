import type { ModelStatic, Model, CreationAttributes, Transaction } from "sequelize";

export async function bulkInsertInChunks<M extends Model>(
    model: ModelStatic<M>,
    records: CreationAttributes<M>[],
    chunkSize = 1000,
    transaction?: Transaction
) {
    for (
        let i = 0;
        i < records.length;
        i += chunkSize
    ) {
        const chunk = records.slice(i, i + chunkSize);

			if (chunk.length > 0) {
				await model.bulkCreate(chunk, {
					ignoreDuplicates: true,
					...(transaction && { transaction })
				});
			}
    }
}
