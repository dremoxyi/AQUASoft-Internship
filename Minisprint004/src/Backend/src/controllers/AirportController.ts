import AirportService from "../services/AirportService.ts"
import type { Request, Response } from 'express';


export default class AirportController {
    private readonly airportService: AirportService;

    constructor(dependencies:any){
        this.airportService = new AirportService(dependencies)
    }

    createAirport = async (req:Request, res:Response) => {
        if (!req.body) {
            return res.status(400).json({message : "Missing required field > 'JSON request body' required"})
        }
        const user = await this.airportService.createAirport(req.body)
        return res.json(user)
    }

    readAirport = async (req:Request, res:Response) => {
        const user = await this.airportService.readAirport()
        return res.json(user)
    }

    findAirport = async (req:Request, res:Response) => {
        if (typeof req.params.iata !== 'string'){
            return res.status(400).json({message: "Parameter 'iata' must be defined and as a string"})
        }
        const user = await this.airportService.findAirport(req.params.iata)
        return res.json(user)
    }

    updateAirport = async (req:Request, res:Response) => {
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
        const user = await this.airportService.updateAirport(id,req.body)
        return res.json(user)
    }

    deleteAirport = async (req:Request, res:Response) => {
        if (typeof req.params.id !== 'string') {
            return res.status(400).json({message: "Missing required field > 'parameter id' required"})
        }
        if (isNaN(Number(req.params.id))) {
            return res.status(400).json({message: "Parameter 'id' must be a number"})
        }
        const id = Number(req.params.id)
        const user = await this.airportService.deleteAirport(id)
        return res.json(user)
    }


}