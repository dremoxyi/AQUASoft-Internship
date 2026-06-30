import { DataTypes, type Sequelize } from "sequelize";


export default (sequelize: Sequelize) => {
     const City = sequelize.define('City',{
        CityID: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        CityName: {
            type: DataTypes.STRING(100)
        },
        Country:{
            type: DataTypes.STRING(50)
        }
    }
    //,{
    //    timestamps:false
    //}
    )
    const Region = sequelize.define('Region',{
        PropertyStateProvinceID: {
            type: DataTypes.INTEGER,
            primaryKey:true
        },
        PropertyStateProvinceName: {
            type: DataTypes.STRING(100)
        },
    }  
    //,{
    //    timestamps:false
    //}
    )
    const Hotel = sequelize.define('Hotel',{
        GlobalPropertyID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        SourcePropertyID: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        GlobalPropertyName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        GlobalChainCode: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        PropertyAddress1: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        PropertyAddress2: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        PrimaryAirportCode: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        CityID: { // THIS IS A FOREIGN KEY ("City" Primary Key)
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: City,
                key: 'CityID'
            }
        },
        PropertyStateProvinceID: { // THIS IS A FOREIGN KEY ("Region" Primary Key)
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Region,
                key: 'PropertyStateProvinceID'
            }
        },
        PropertyZipPostal: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        PropertyPhoneNumber: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        PropertyFaxNumber: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        SabrePropertyRating: {
            type: DataTypes.DECIMAL(3,1),
            allowNull: true
        },
        PropertyLatitude: {
            type: DataTypes.DECIMAL(9,6),
            allowNull: true
        },
        PropertyLongitude: {
            type: DataTypes.DECIMAL(9,6),
            allowNull: true
        },
        SourceGroupCode: {
            type: DataTypes.STRING(10),
            allowNull: true
        }

    }
    //,{
    //    timestamps:false
    //}
    )

    const User = sequelize.define("User",{
        UserID: {
            type: DataTypes.INTEGER,
            primaryKey:true
        },
        Username: {
            type: DataTypes.STRING(100)
        }
    })

    const Review = sequelize.define("Review",{
        ReviewID: {
            type: DataTypes.INTEGER,
            primaryKey:true
        },
        UserID: {
            type: DataTypes.INTEGER,
            allowNull:false,
            references:{
                model: User,
                key: 'UserID'
            }
        },
        Message:{
            type: DataTypes.TEXT,
            allowNull:true
        },
        OverallRating: {
            type: DataTypes.DECIMAL(3,2)
        },
        LocationRating: {
            type: DataTypes.DECIMAL(3,2),
            allowNull:true
        },
        RoomsRating: {
            type: DataTypes.DECIMAL(3,2),
            allowNull:true
        },
        ValueRating: {
            type: DataTypes.DECIMAL(3,2),
            allowNull:true
        },
        CleanlinessRating: {
            type: DataTypes.DECIMAL(3,2),
            allowNull:true
        },
        ServiceRating: {
            type: DataTypes.DECIMAL(3,2),
            allowNull:true
        },
        SleepQualityRating: {
            type: DataTypes.DECIMAL(3,2),
            allowNull:true
        }
    })

    const HotelGroup = sequelize.define("HotelGroup",{
        ID:{
            type:DataTypes.INTEGER,
            primaryKey:true
        },
        Group_name:{
            type: DataTypes.STRING("50")
        }
    })

    const Airport = sequelize.define("Airport",{
        ID: {
            type: DataTypes.INTEGER,
            primaryKey:true
        },
        Iata_code: {
            type: DataTypes.INTEGER
        },
        Airport_name: {
            type: DataTypes.INTEGER
        },
        CityID: {
            type: DataTypes.INTEGER,
            references: {
                model: City,
                key:'CityID'
            }
        },
        Latitude: {
            type: DataTypes.DECIMAL(9,6)
        },
        Longitude: {
            type: DataTypes.DECIMAL(9,6)
        }

    })

    const PriceOffer =  sequelize.define("PriceOffer",{
        ID: {
            type: DataTypes.INTEGER,
            primaryKey:true
        },
        Price1: {
            type: DataTypes.INTEGER,
        },
        Price2: {
            type: DataTypes.INTEGER,
        },
        Price3: {
            type: DataTypes.INTEGER,
        },
        Price4: {
            type: DataTypes.INTEGER,
        },
        Price5: {
            type: DataTypes.INTEGER,
        },
    })


    City.hasMany(Hotel, {
        foreignKey: 'CityID',
    })
    Hotel.belongsTo(City, {
        foreignKey: 'CityID',
    })

    City.hasMany(Airport, {
        foreignKey: 'CityID'
    })
    Airport.belongsTo(City,{
        foreignKey: 'CityID'
    })


    Region.hasMany(Hotel, {
        foreignKey: 'PropertyStateProvinceID',
    })
    Hotel.belongsTo(Region, {
        foreignKey: 'PropertyStateProvinceID',
    })

    HotelGroup.hasMany(Hotel);
    Hotel.belongsTo(HotelGroup);

    Hotel.hasMany(Review);
    Review.belongsTo(Hotel);
}