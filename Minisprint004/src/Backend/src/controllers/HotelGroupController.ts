import HotelGroupService from "../services/HotelGroupService.ts"
import type { Request, Response } from 'express';
import UserService from "../services/UserService.ts";


export default class HotelGroupController {
    private readonly hotelgroupService: HotelGroupService;
    private readonly userService: UserService;

    constructor(dependencies:any){
        this.hotelgroupService = new HotelGroupService(dependencies)
        this.userService = new UserService(dependencies)
    }

    createHotelGroup = async (req:Request, res:Response) => {
        try {
            if (!req.body) {
                return res.status(400).json({message : "Missing required field > 'JSON request body' required"})
            }

            const actor = res.locals.user as { id?: string | number } | undefined
            const creatorId = actor?.id != null ? Number(actor.id) : undefined

            const user = await this.hotelgroupService.createHotelGroup(req.body, creatorId)
            return res.json(user)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to create hotel group"
            const status = message === "Unauthorized" ? 401 : 400
            return res.status(status).json({ message })
        }
    }

    readHotelGroupUsers = async (req:Request, res:Response) => {
        if (typeof req.params.id !== 'string') {
            return res.status(400).json({message: "Parameter 'id' must be defined and as a string"})
        }

        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).json({message: "Parameter 'id' must be a number"})
        }

        try {
            const actor = res.locals.user as { id?: string | number, rolename?: string } | undefined
            const actorId = actor?.id != null ? Number(actor.id) : undefined
            const user = await this.hotelgroupService.readHotelGroupUsers(id, actorId, actor?.rolename)
            return res.json(user)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to load hotel group"
            const status = message === "Unauthorized" ? 403 : 400
            return res.status(status).json({ message })
        }
    }

    readHotelGroup = async (req:Request, res:Response) => {
        const actor = res.locals.user as { id?: string | number, rolename?: string } | undefined
        const user = await this.hotelgroupService.readHotelGroup()

        if (actor?.rolename === "Admin" || actor?.id == null) {
            return res.json(user)
        }

        const currentId = Number(actor.id)
        const filtered = user.filter((group: any) =>
            (group.Users ?? []).some((manager: any) => {
                const membership = manager.HotelGroupManagers ?? manager
                return Number(manager.UserID) === currentId && membership?.MembershipStatus !== "PENDING"
            })
        )

        return res.json(filtered)
    }

    findHotelGroup = async (req:Request, res:Response) => {
        if (typeof req.params.name !== 'string'){
            return res.status(400).json({message: "Parameter 'name' must be defined and as a string"})
        }
        const user = await this.hotelgroupService.findHotelGroup(req.params.name)
        return res.json(user)
    }

    updateHotelGroup = async (req:Request, res:Response) => {
        try {
            if (typeof req.params.id !== 'string') {
                return res.status(400).json({message: "Missing required field > 'parameter id' required"})
            }
            if (isNaN(Number(req.params.id))) {
                return res.status(400).json({message: "Parameter 'id' must be a number"})
            }
            const id = Number(req.params.id)
            if (!req.body) {
                return res.status(400).json({message : "Missing required field > 'JSON request body' required"})
            }

            const actor = res.locals.user as { id?: string | number, rolename?: string } | undefined
            const editorId = actor?.id != null ? Number(actor.id) : undefined
            const role = actor?.rolename

            const user = await this.hotelgroupService.updateHotelGroup(id,req.body, editorId, role)
            return res.json(user)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to update hotel group"
            const status = message === "Unauthorized" ? 401 : 400
            return res.status(status).json({ message })
        }
    }

    deleteHotelGroup = async (req:Request, res:Response) => {
        try {
            if (typeof req.params.id !== 'string') {
                return res.status(400).json({message: "Missing required field > 'parameter id' required"})
            }
            if (isNaN(Number(req.params.id))) {
                return res.status(400).json({message: "Parameter 'id' must be a number"})
            }
            const id = Number(req.params.id)

            const actor = res.locals.user as { id?: string | number, rolename?: string } | undefined
            const editorId = actor?.id != null ? Number(actor.id) : undefined
            const role = actor?.rolename

            const user = await this.hotelgroupService.deleteHotelGroup(id, editorId, role)
            return res.json(user)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to delete hotel group"
            const status = message === "Unauthorized" ? 401 : 400
            return res.status(status).json({ message })
        }
    }

    addHotelGroupUser = async (req: Request, res: Response) => {
        try {
            if (typeof req.params.id !== 'string') {
                return res.status(400).json({message: "Parameter 'id' must be defined and as a string"})
            }

            const id = Number(req.params.id)
            if (isNaN(id)) {
                return res.status(400).json({message: "Parameter 'id' must be a number"})
            }

            const username = req.body?.UserName
            if (typeof username !== 'string' || !username.trim()) {
                return res.status(400).json({message: "Parameter 'UserName' must be defined and as a string"})
            }
            const targetUser = await this.userService.findUser(username)

            if (!targetUser) {
                return res.status(404).json({message: "User not found"})
            }
            const guestId = targetUser.UserID

            const actor = res.locals.user as { id?: string | number, rolename?: string } | undefined
            const actorId = actor?.id != null ? Number(actor.id) : undefined

            const user = await this.hotelgroupService.addHotelGroupUser(
                id,
                guestId,
                actorId,
                actor?.rolename,
                req.body?.ManagerRole,
            )

            return res.json(user)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to add user to hotel group"
            const status = message === "Unauthorized" ? 403 : 400
            return res.status(status).json({ message })
        }
    }

    inviteHotelGroupUsers = async (req: Request, res: Response) => {
        try {
            if (typeof req.params.id !== 'string') {
                return res.status(400).json({message: "Parameter 'id' must be defined and as a string"})
            }

            const id = Number(req.params.id)
            if (isNaN(id)) {
                return res.status(400).json({message: "Parameter 'id' must be a number"})
            }

            const actor = res.locals.user as { id?: string | number, rolename?: string } | undefined
            const actorId = actor?.id != null ? Number(actor.id) : undefined

            const invited = await this.hotelgroupService.inviteHotelGroupUsers(id, req.body, actorId, actor?.rolename)
            return res.json(invited)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to send magic links"
            const status = message === "Unauthorized" ? 403 : 400
            return res.status(status).json({ message })
        }
    }

    activateHotelGroupMembership = async (req: Request, res: Response) => {
        try {
            const token = typeof req.query.token === 'string' ? req.query.token : undefined
            const activated = await this.hotelgroupService.activateHotelGroupMembership({ token: token ?? "" })
            return res.json(activated)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to activate membership"
            return res.status(400).json({ message })
        }
    }

    updateHotelGroupUserRole = async (req: Request, res: Response) => {
        try {
            if (typeof req.params.id !== 'string' || typeof req.params.userId !== 'string') {
                return res.status(400).json({message: "Missing required route parameters"})
            }

            const id = Number(req.params.id)
            const userId = Number(req.params.userId)

            if (Number.isNaN(id) || Number.isNaN(userId)) {
                return res.status(400).json({message: "Parameters must be numbers"})
            }

            const actor = res.locals.user as { id?: string | number, rolename?: string } | undefined
            const actorId = actor?.id != null ? Number(actor.id) : undefined

            const user = await this.hotelgroupService.updateHotelGroupUserRole(
                id,
                userId,
                actorId,
                actor?.rolename,
                req.body?.ManagerRole,
            )

            return res.json(user)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to update group member role"
            const status = message === "Unauthorized" ? 403 : 400
            return res.status(status).json({ message })
        }
    }

    removeHotelGroupUser = async (req: Request, res: Response) => {
        try {
            if (typeof req.params.id !== 'string' || typeof req.params.userId !== 'string') {
                return res.status(400).json({message: "Missing required route parameters"})
            }

            const id = Number(req.params.id)
            const userId = Number(req.params.userId)

            if (Number.isNaN(id) || Number.isNaN(userId)) {
                return res.status(400).json({message: "Parameters must be numbers"})
            }

            const actor = res.locals.user as { id?: string | number, rolename?: string } | undefined
            const actorId = actor?.id != null ? Number(actor.id) : undefined

            const user = await this.hotelgroupService.removeHotelGroupUser(
                id,
                userId,
                actorId,
                actor?.rolename,
            )

            return res.json(user)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to remove user from hotel group"
            const status = message === "Unauthorized" ? 403 : 400
            return res.status(status).json({ message })
        }
    }


}