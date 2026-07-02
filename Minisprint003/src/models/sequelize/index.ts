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
        HotelID: {
            type: DataTypes.INTEGER,
            references: {
                model:Hotel,
                key: 'GlobalPropertyID'
            }
        },
        UserID: {
            type: DataTypes.INTEGER,
            allowNull:false,
            references:{
                model: User,
                key: 'UserID'
            }
        },
        Title:{
            type: DataTypes.STRING(255),
            allowNull:true
        },
        Message:{
            type: DataTypes.TEXT,
            allowNull:true
        },
        TripType:{
            type: DataTypes.STRING(50),
            allowNull:true
        },
        DateOfStay:{
            type: DataTypes.STRING(25),
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
        HotelGroupID:{
            type:DataTypes.INTEGER,
            primaryKey:true
        },
        Group_name:{
            type: DataTypes.STRING("50")
        }
    })

    const Airport = sequelize.define("Airport",{
        AirportID: {
            type: DataTypes.INTEGER,
            primaryKey:true
        },
        Iata_code: {
            type: DataTypes.STRING(3)
        },
        Airport_name: {
            type: DataTypes.STRING(100)
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
        PriceOfferID: {
            type: DataTypes.INTEGER,
            primaryKey:true
        },
        HotelID: {
            type:DataTypes.INTEGER,
            references:{
                model:Hotel,
                key:'GlobalPropertyID'
            }
        },
        Category:{
            type:DataTypes.ENUM('budget','standard','comfort','premium','luxury'),
        },
        Price:{
            type:DataTypes.DECIMAL
        }
    },
    {
        indexes:[{
            unique:true,
            fields: ["HotelID","Category"]
        }]
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

    HotelGroup.hasMany(Hotel,{
        foreignKey:{
            name: "HotelGroupID",
            allowNull:true
        }}
    );
    Hotel.belongsTo(HotelGroup,{
        foreignKey:{
            name: "HotelGroupID",
            allowNull:true
        }
    });

    Hotel.hasMany(Review,{
        foreignKey:{
            name: "HotelID",
            allowNull:true
        }
    });
    Review.belongsTo(Hotel,{
        foreignKey:{
            name: "HotelID",
            allowNull:true
        }
    });

    Hotel.hasMany(PriceOffer,{
        foreignKey:{
            name: "HotelID",
            allowNull:true
        }
    });

    PriceOffer.belongsTo(Hotel,{
        foreignKey:{
            name: "HotelID",
            allowNull:true
        }
    });

    User.hasMany(Review,{
        foreignKey:'UserID'
    });
    Review.belongsTo(User,{
        foreignKey:'UserID'
    });
}