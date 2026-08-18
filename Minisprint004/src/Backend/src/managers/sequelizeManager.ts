import { Sequelize, Transaction } from "sequelize";

class SequelizeManager {
    private readonly sequelize: Sequelize

    constructor(sequelize: Sequelize) {
        this.sequelize = sequelize
    }

    async runInTransaction<T>(work: (t: Transaction) => Promise<T>) {
        return this.sequelize.transaction(async (t) => {
            return work(t);
        });
    }

    sequelizeFn = (...args: Parameters<typeof Sequelize.fn>) => {
        return this.sequelize.fn(...args)
    }

    sequelizeCol = (column: string) => {
        return this.sequelize.col(column)
    }
}

export default SequelizeManager