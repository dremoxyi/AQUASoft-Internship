import { Sequelize, Transaction } from "sequelize";

class TransactionManager {
    private readonly sequelize: Sequelize

    constructor(sequelize: Sequelize) {
        this.sequelize = sequelize
    }

    async runInTransaction<T>(work: (t: Transaction) => Promise<T>) {
        return this.sequelize.transaction(async (t) => {
            return work(t);
        });
    }
}

export default TransactionManager