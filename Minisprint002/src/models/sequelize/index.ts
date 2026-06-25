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
            allowNull: false,
        },
        GlobalPropertyName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        GlobalChainCode: {
            type: DataTypes.STRING(10),
            allowNull: false,
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
            allowNull: false,
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
            type: DataTypes.DECIMAL(3,1)
        },
        PropertyLatitude: {
            type: DataTypes.DECIMAL(9,6)
        },
        PropertyLongitude: {
            type: DataTypes.DECIMAL(9,6)
        },
        SourceGroupCode: {
            type: DataTypes.STRING(10)
        }

    }
    //,{
    //    timestamps:false
    //}
    )

    City.hasMany(Hotel, {
        foreignKey: 'CityID',
    })
    Hotel.belongsTo(City, {
        foreignKey: 'CityID',
    })

    Region.hasMany(Hotel, {
        foreignKey: 'PropertyStateProvinceID',
    })
    Hotel.belongsTo(Region, {
        foreignKey: 'PropertyStateProvinceID',
    })
}