import type { Request, Response } from "express";
import AirportService from "../../services/airportServices.ts";

class AirportController {
    private airportService: AirportService;

    constructor(repositories:any) {
        this.airportService = new AirportService(repositories);
    }

    getAirportByIataCode = async (req: Request, res: Response) => {
        try {
            const { iataCode } = req.params;
            if (iataCode !== 'string') return res.status(404).json({message: 'Error'})
            const airport = await this.airportService.getAirportByIataCode(iataCode);

            return res.status(200).json({
                success: true,
                data: airport
            });

        } catch (error: any) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
    };

    createAirport = async (req: Request, res:Response) => {
        const airport = this.airportService.createAirport(req.body);
        return res.json(airport)
    }
    deleteAirport = async (req: Request, res:Response) => {
        const airport = this.airportService.deleteAirport(Number(req.params.id));
        return res.json(airport)
    }

    getClosestHotelOffers = async (req: Request, res: Response) => {
        try {
            const { iataCode } = req.params;
            if (typeof iataCode !== 'string') return res.status(401).json({message:'Define correctly string parameter "IataCode"'})

            const limit = req.query.limit
                ? Number(req.query.limit)
                : 10;

            const data = await this.airportService.getClosestHotelOffers(
                iataCode,
                limit
            );

            return res.status(200).json({
                success: true,
                airport: iataCode,
                count: data.length,
                data
            });

        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
    
}

export default AirportController;