import TransactionManager from "../managers/sequelizeManager.ts"
import HotelGroupRepository from "../repositories/HotelGroupRepository.ts"
import type { activateHotelGroupMembershipDTO, createHotelGroupDTO, inviteHotelGroupUsersDTO, updateHotelGroupDTO } from "../models/data-transfer-object/index.ts";

type ManagerRole = "OWNER" | "MAIN" | "MANAGER";

function normalizeEditableRole(role?: string): Exclude<ManagerRole, "OWNER"> {
    return role === "MAIN" ? "MAIN" : "MANAGER";
}

class HotelGroupService {
    private readonly transactionManager: TransactionManager
    private readonly Repo: HotelGroupRepository;

    constructor({sequelizeManager,hotelgroupRepository}
        :{sequelizeManager: TransactionManager,hotelgroupRepository:HotelGroupRepository} ){
        this.transactionManager = sequelizeManager
        this.Repo = hotelgroupRepository
    }

    async createHotelGroup(newHotelGroup:createHotelGroupDTO, creatorId?: number) {
        if (creatorId == null) {
            throw new Error("Unauthorized")
        }

        return this.transactionManager.runInTransaction(async (t) => {
            const hotelgroup = await this.Repo.create(newHotelGroup, creatorId, t)
            return hotelgroup
        })
    }

    private getMembershipRole(group: any, userId?: number): ManagerRole | null {
        if (userId == null || !group?.Users) {
            return null;
        }

        const member = group.Users.find((entry: any) => Number(entry.UserID) === userId);
        const membership = member?.HotelGroupManagers ?? member;

        if (membership?.MembershipStatus === "PENDING" && membership?.ManagerRole !== "OWNER") {
            return null;
        }

        return membership?.ManagerRole ?? null;
    }

    private canEditGroup(actorRole?: string, membershipRole?: ManagerRole | null) {
        return actorRole === "Admin" || membershipRole === "OWNER";
    }

    private canManageMembers(actorRole?: string, membershipRole?: ManagerRole | null) {
        return actorRole === "Admin" || membershipRole === "OWNER" || membershipRole === "MAIN";
    }

    private canEditMemberPerms(actorRole?: string, membershipRole?: ManagerRole | null) {
        return actorRole === "Admin" || membershipRole === "OWNER";
    }

    async readHotelGroup(){
        const hotelgroup = await this.Repo.read()
        return hotelgroup
    }

    async findHotelGroup(name:string) {
        const hotelgroup = await this.Repo.findByName(name)
        return hotelgroup
    }

    async updateHotelGroup(ID: number, updatedHotelGroup: updateHotelGroupDTO, editorId?: number, role?: string) {
        return this.transactionManager.runInTransaction(async (t) => {
            if (editorId == null) {
                throw new Error("Unauthorized")
            }

            if (role !== "Admin") {
                const group = await this.Repo.findByID(ID, t)

                if (!group) {
                    throw new Error("Hotel group not found")
                }

                const membershipRole = this.getMembershipRole(group, editorId)
                const ownsGroup = this.canEditGroup(role, membershipRole)

                if (!ownsGroup) {
                    throw new Error("You can only edit your own hotel groups")
                }
            }

            const hotelgroup= await this.Repo.update(ID,updatedHotelGroup,t)
            return hotelgroup
        })
    }

    async deleteHotelGroup(ID: number, editorId?: number, role?: string) {
        return this.transactionManager.runInTransaction(async (t)=> {
            if (editorId == null) {
                throw new Error("Unauthorized")
            }

            if (role !== "Admin") {
                const group = await this.Repo.findByID(ID, t)

                if (!group) {
                    throw new Error("Hotel group not found")
                }

                const membershipRole = this.getMembershipRole(group, editorId)
                const ownsGroup = this.canEditGroup(role, membershipRole)

                if (!ownsGroup) {
                    throw new Error("You can only delete your own hotel groups")
                }
            }

            const DeletedHotelGroup = await this.Repo.delete(ID,t)

            return { DeletedHotelGroup }
        })
    }

    async readHotelGroupUsers(ID: number, actorId?: number, actorRole?: string) {
        const group = await this.Repo.findByID(ID)

        if (!group) {
            throw new Error("Hotel group not found")
        }

        if (actorRole !== "Admin") {
            const membershipRole = this.getMembershipRole(group, actorId)

            if (!membershipRole) {
                throw new Error("Unauthorized")
            }
        }

        return group
    }

    async addHotelGroupUser(ID: number, userId: number, actorId?: number, actorRole?: string, requestedRole?: string) {
        return this.transactionManager.runInTransaction(async (t) => {
            if (actorId == null) {
                throw new Error("Unauthorized")
            }

            const group = await this.Repo.findByID(ID, t)

            if (!group) {
                throw new Error("Hotel group not found")
            }

            const membershipRole = this.getMembershipRole(group, actorId)

            if (!this.canManageMembers(actorRole, membershipRole)) {
                throw new Error("Unauthorized")
            }

            const nextRole = this.canEditMemberPerms(actorRole, membershipRole)
                ? normalizeEditableRole(requestedRole)
                : "MANAGER"

            const member = await this.Repo.upsertMember(ID, userId, nextRole, t, "PENDING")
            return member
        })
    }

    async inviteHotelGroupUsers(ID: number, payload: inviteHotelGroupUsersDTO, actorId?: number, actorRole?: string) {
        return this.transactionManager.runInTransaction(async (t) => {
            if (actorId == null) {
                throw new Error("Unauthorized")
            }

            const group = await this.Repo.findByID(ID, t)

            if (!group) {
                throw new Error("Hotel group not found")
            }

            const membershipRole = this.getMembershipRole(group, actorId)

            if (!this.canManageMembers(actorRole, membershipRole)) {
                throw new Error("Unauthorized")
            }

            if (!Array.isArray(payload?.UserIDs) || payload.UserIDs.length === 0) {
                throw new Error("At least one user must be selected")
            }

            return this.Repo.issueInvites(ID, payload.UserIDs, t)
        })
    }

    async activateHotelGroupMembership(payload: activateHotelGroupMembershipDTO) {
        if (!payload?.token) {
            throw new Error("Invitation token is required")
        }

        return this.transactionManager.runInTransaction(async (t) => {
            const member = await this.Repo.activateInvite(payload.token, t)

            if (!member) {
                throw new Error("Invitation not found")
            }

            return member
        })
    }

    async updateHotelGroupUserRole(ID: number, userId: number, actorId?: number, actorRole?: string, requestedRole?: string) {
        return this.transactionManager.runInTransaction(async (t) => {
            if (actorId == null) {
                throw new Error("Unauthorized")
            }

            const group = await this.Repo.findByID(ID, t)

            if (!group) {
                throw new Error("Hotel group not found")
            }

            const membershipRole = this.getMembershipRole(group, actorId)

            if (!this.canEditMemberPerms(actorRole, membershipRole)) {
                throw new Error("Unauthorized")
            }

            const member = await this.Repo.updateMemberRole(ID, userId, normalizeEditableRole(requestedRole), t)

            if (!member) {
                throw new Error("Member not found")
            }

            return member
        })
    }

    async removeHotelGroupUser(ID: number, userId: number, actorId?: number, actorRole?: string) {
        return this.transactionManager.runInTransaction(async (t) => {
            if (actorId == null) {
                throw new Error("Unauthorized")
            }

            const group = await this.Repo.findByID(ID, t)

            if (!group) {
                throw new Error("Hotel group not found")
            }

            const membershipRole = this.getMembershipRole(group, actorId)

            if (!this.canManageMembers(actorRole, membershipRole)) {
                throw new Error("Unauthorized")
            }

            const targetRole = this.getMembershipRole(group, userId)

            if (targetRole === "OWNER" && actorRole !== "Admin") {
                throw new Error("Only admins can remove the owner")
            }

            const result = await this.Repo.removeMember(ID, userId, t)
            return { removed: result }
        })
    }
}

export default HotelGroupService