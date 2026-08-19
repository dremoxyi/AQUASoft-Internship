import { Transaction } from "sequelize";
import type { createHotelGroupDTO, updateHotelGroupDTO } from "../models/data-transfer-object/index.ts";
import { randomBytes } from "node:crypto";


class HotelGroupRepository {
    private readonly models: any;
    
    constructor(models:any){
        this.models = models;
    }

    async create(newHotelGroup:createHotelGroupDTO, creatorId?: number, transaction?:Transaction) {
        const hotelgroup = await this.models.HotelGroup.create(newHotelGroup, {transaction})

        if (creatorId != null) {
            await this.models.HotelGroupManagers.create({
                UserID: creatorId,
                HGroupID: hotelgroup.HGroupId,
                ManagerRole: "OWNER",
                MembershipStatus: "ACTIVE",
                ActivatedAt: new Date(),
            }, { transaction })
        }

        return hotelgroup
    }

    async read(){
        const hotelgroups = await this.models.HotelGroup.findAll({
            include: [
                {
                    model: this.models.User,
                    through: { attributes: ["ManagerRole", "MembershipStatus", "InviteTokenExpiresAt", "ActivatedAt"] },
                },
                {
                    model: this.models.Hotel,
                },
            ],
            order: [["HGroupId", "ASC"]],
        });
        return hotelgroups;
    }

    async findByName(Name:string, transaction?:Transaction) {
        const hotelgroup = await this.models.HotelGroup.findOne({where: {GroupName: Name}, transaction})
        return hotelgroup
    }

    async findByID(ID:number, transaction?:Transaction) {
        const hotelgroup = await this.models.HotelGroup.findOne({
            where: { HGroupId: ID },
            transaction,
            include: [
                {
                    model: this.models.User,
                    through: { attributes: ["ManagerRole", "MembershipStatus", "InviteTokenExpiresAt", "ActivatedAt"] },
                },
                {
                    model: this.models.Hotel,
                },
            ],
        })

        return hotelgroup
    }

    async findMember(groupId: number, userId: number, transaction?: Transaction) {
        return this.models.HotelGroupManagers.findOne({
            where: {
                HGroupID: groupId,
                UserID: userId,
            },
            transaction,
        })
    }

    async upsertMember(groupId: number, userId: number, managerRole: "OWNER" | "MAIN" | "MANAGER", transaction?: Transaction, membershipStatus: "PENDING" | "ACTIVE" = "PENDING") {
        const existing = await this.findMember(groupId, userId, transaction)

        if (existing) {
            existing.ManagerRole = managerRole
            existing.MembershipStatus = membershipStatus
            await existing.save({ transaction })
            return existing
        }

        return this.models.HotelGroupManagers.create({
            UserID: userId,
            HGroupID: groupId,
            ManagerRole: managerRole,
            MembershipStatus: membershipStatus,
        }, { transaction })
    }

    async updateMemberRole(groupId: number, userId: number, managerRole: "OWNER" | "MAIN" | "MANAGER", transaction?: Transaction) {
        const member = await this.findMember(groupId, userId, transaction)

        if (!member) {
            return null
        }

        member.ManagerRole = managerRole
        await member.save({ transaction })
        return member
    }

    async issueInvites(groupId: number, userIds: number[], transaction?: Transaction) {
        const uniqueUserIds = [...new Set(userIds.filter((value) => Number.isInteger(value)))]
        const invites = []

        for (const userId of uniqueUserIds) {
            const member = await this.findMember(groupId, userId, transaction)

            if (!member) {
                throw new Error(`Member ${userId} not found`)
            }

            const InviteToken = randomBytes(24).toString("hex")
            const InviteTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

            member.MembershipStatus = "PENDING"
            member.InviteToken = InviteToken
            member.InviteTokenExpiresAt = InviteTokenExpiresAt
            await member.save({ transaction })

            invites.push(member)
        }

        return invites
    }

    async activateInvite(token: string, transaction?: Transaction) {
        const member = await this.models.HotelGroupManagers.findOne({
            where: { InviteToken: token },
            include: [
                { model: this.models.User, attributes: ["Email", "UserName"] },
                { model: this.models.HotelGroup, attributes: ["GroupName"] },
            ],
            transaction,
        });

        if (!member) {
            return null
        }

        if (member.InviteTokenExpiresAt && new Date(member.InviteTokenExpiresAt).getTime() < Date.now()) {
            throw new Error("Invitation link expired")
        }

        member.MembershipStatus = "ACTIVE"
        member.InviteToken = null
        member.InviteTokenExpiresAt = null
        member.ActivatedAt = new Date()
        await member.save({ transaction })

        return member
    }

    async removeMember(groupId: number, userId: number, transaction?: Transaction) {
        return this.models.HotelGroupManagers.destroy({
            where: {
                HGroupID: groupId,
                UserID: userId,
            },
            transaction,
        })
    }

    async update(ID:number,updHotelGroup:updateHotelGroupDTO, transaction?:Transaction) {
        const hotelgroup = await this.models.HotelGroup.update(updHotelGroup, {where : {HGroupId: ID}, returning: true, transaction} )
        return hotelgroup
    }

    async delete(ID:number, transaction?:Transaction) {
        const hotelgroup = await this.models.HotelGroup.destroy({where: {HGroupId: ID}, transaction})
        return hotelgroup
    }
}

export default HotelGroupRepository