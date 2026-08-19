import { DataTypes, Sequelize } from "sequelize";

export default (sequelize:Sequelize) => {
    //                                                        \\
    const Role = sequelize.define("Role",{
        RoleID: {
            type: DataTypes.INTEGER,
            primaryKey:true
        },
        RoleName: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
    //                                                        \\
    const Permission = sequelize.define("Permission",{
        PermissionID: {
            type:DataTypes.INTEGER,
            primaryKey:true
        },
        PermissionName: {
            type:DataTypes.STRING(20),
            allowNull:false
        }
    })
    //--------------------------------------------------------\\
    const User = sequelize.define("User",{
        UserID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true,
        },
        UserName:{
            type: DataTypes.STRING,
            unique:true
        },
        Email: {
            type: DataTypes.STRING
        },
        Password: {
            type: DataTypes.STRING
        },
        RoleID: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
    //--------------------------------------------------------\\
    const Hotel = sequelize.define("Hotel",{
        HotelID:{
            type: DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        HotelName:{
            type: DataTypes.STRING,
        },
        Address:{
            type:DataTypes.STRING
        },
        Longitude:{
            type: DataTypes.DECIMAL(9,6)
        },
        Latitude:{
            type: DataTypes.DECIMAL(9,6)
        },
        AquaRating:{
            type: DataTypes.INTEGER,
            defaultValue:0,
        },
        RatingSum:{
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        RatingCounts:{
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        AmenitiesRate:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        CleanlinessRate:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        FoodBeverageRate:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        SleepQualityRate:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        InternetQualityRate:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        CityID:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        HGroupID:{
            type: DataTypes.INTEGER,
            allowNull:true
        }
    },
    {
        indexes: [{
            unique:true,
            fields: ["HotelName","Address","CityID"]
        }]
    });
    //--------------------------------------------------------\\
    const Review = sequelize.define("Review",{
        ReviewId:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        Title:{
            type: DataTypes.STRING(255),
        },
        Text:{
            type: DataTypes.TEXT
        },
        Rating:{
            type: DataTypes.FLOAT
        },
        AmenitiesRate:{
            type: DataTypes.FLOAT
        },
        CleanlinessRate:{
            type: DataTypes.FLOAT
        },
        FoodBeverageRate:{
            type: DataTypes.FLOAT
        },
        SleepQualityRate:{
            type: DataTypes.FLOAT
        },
        InternetQualityRate:{
            type: DataTypes.FLOAT
        },
        UserID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        HotelID: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
    //--------------------------------------------------------\\ 
    const HotelGroup = sequelize.define("HotelGroup",{
        HGroupId: {
            type: DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        GroupName:{
            type: DataTypes.STRING,
            unique:true
        }
    })  
    //--------------------------------------------------------\\
    const Airport = sequelize.define("Airport",{
        AirportID:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        IataCode:{
            type: DataTypes.STRING(3),
            unique: true
        },
        AirportName:{
            type: DataTypes.STRING
        },
        Longitude:{
            type: DataTypes.DECIMAL(9,6)
        },
        Latitude:{
            type: DataTypes.DECIMAL(9,6)
        },
        CityID:{
            type: DataTypes.INTEGER,
            allowNull:false
        }
    })
    //--------------------------------------------------------\\ 
    const PriceOffer =  sequelize.define("PriceOffer",{
        PriceOfferID: {
            type: DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        Category:{
            type: DataTypes.ENUM('budget','standard','comfort','premium','luxury'),
        },
        Price:{
            type: DataTypes.DECIMAL
        },
        Currency:{
            type: DataTypes.ENUM('USD','EUR','GBP','RON','JPY','CNY','CHF','RUB')
        },
        HotelID: {
            type: DataTypes.INTEGER,
        }
    })
    //--------------------------------------------------------\\
    const City = sequelize.define("City",{
        CityID: {
            type: DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        CityName:{
            type: DataTypes.STRING,
            allowNull:false,
        },
        ProvinceID:{
            type: DataTypes.INTEGER,
            allowNull:false,
        },
    },
    {
        indexes: [{
            unique:true,
            fields: ["CityName","ProvinceID"]
        }]
    })
    //--------------------------------------------------------\\
    const Province = sequelize.define("Province",{
        ProvinceID: {
            type: DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        ProvinceName:{
            type: DataTypes.STRING,
            allowNull:false,
        },
        CountryID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    },
    {
        indexes:[{
            unique:true,
            fields:["ProvinceName","CountryID"]
        }]
    })
    //--------------------------------------------------------\\
    const Country = sequelize.define("Country",{
        CountryID: {
            type: DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        CountryName:{
            type: DataTypes.STRING,
            allowNull:false,
        }
    })
    //========================================================\\
    //========================================================\\
    const HotelManager = sequelize.define("HotelManager",{
        UserID:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull:false
        },
        HotelID:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull:false
        }
    })
    //--------------------------------------------------------\\
    const RolePermission = sequelize.define("RolePermission",{
        RoleID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull:false
        },
        PermissionID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull:false
        }
    })
    //--------------------------------------------------------\\ 
    const HotelGroupManagers = sequelize.define("HotelGroupManagers",{
        UserID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull:false
        },
        HGroupID:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull:false
        },
        ManagerRole: {
            type: DataTypes.ENUM("OWNER","MAIN","MANAGER"),
            defaultValue:"MANAGER",
        }
        ,
        MembershipStatus: {
            type: DataTypes.ENUM("PENDING", "ACTIVE"),
            allowNull: false,
            defaultValue: "PENDING",
        },
        InviteToken: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        InviteTokenExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        ActivatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    })
    //________________________________________________________\\
    //                     USER >-> ROLE                      \\
    User.belongsTo(Role, {
        foreignKey: "RoleID"
    });
    //--
    Role.hasMany(User, {
        foreignKey: "RoleID"
    });
    //________________________________________________________\\
    //                   HOTEL >-> HOTEL GROUP                \\
    Hotel.belongsTo(HotelGroup, {
        foreignKey: "HGroupID"
    });
    //--
    HotelGroup.hasMany(Hotel, {
        foreignKey: "HGroupID"
    })
    //________________________________________________________\\
    //                    REVIEW >-> USER                     \\
    Review.belongsTo(User,{
        foreignKey: "UserID"
    });
    //--
    User.hasMany(Review,{
        foreignKey:"UserID"
    });
    //________________________________________________________\\
    //                    REVIEW >-> HOTEL                    \\
    Review.belongsTo(Hotel,{
        foreignKey: "HotelID",
        onDelete: "CASCADE"
    });
    Hotel.hasMany(Review,{
        foreignKey: "HotelID",
        onDelete: "CASCADE"
    })
    //________________________________________________________\\
    //                      HOTEL >-> CITY                    \\
    Hotel.belongsTo(City,{
        foreignKey: "CityID",
    })
    City.hasMany(Hotel,{
        foreignKey: "CityID",
    })
    //________________________________________________________\\
    //                    AIRPORT >-> CITY                    \\
    Airport.belongsTo(City,{
        foreignKey: "CityID",
    })
    City.hasMany(Airport,{
        foreignKey: "CityID",
    })
    //________________________________________________________\\
    //                     CITY >-> PROVINCE                  \\
    City.belongsTo(Province,{
        foreignKey: "ProvinceID",
    })
    Province.hasMany(City,{
        foreignKey: "ProvinceID",
    })
    //________________________________________________________\\
    //                  PROVINCE >-> COUNTRY                  \\
    Province.belongsTo(Country,{
        foreignKey: "CountryID",
    })
    Country.hasMany(Province,{
        foreignKey: "CountryID",
    })
    //________________________________________________________\\
    //                    OFFERS >-> HOTEL                    \\
    Hotel.hasMany(PriceOffer,{
        foreignKey:"HotelID",
        onDelete: "CASCADE"
    })
    //--
    PriceOffer.belongsTo(Hotel, {
        foreignKey:"HotelID",
        onDelete: "CASCADE"
    })
    //========================================================\\
    //========================================================\\
    //                   USER <-> HOTEL MANAGER               \\
    User.belongsToMany(Hotel, {
        through: HotelManager,
        foreignKey: "UserID",
        otherKey: "HotelID",
        onDelete: "CASCADE"
    });
    //--
    Hotel.belongsToMany(User,{
        through: HotelManager,
        foreignKey: "HotelID",
        otherKey: "UserID",
        onDelete: "CASCADE"
    });
    //________________________________________________________\\
    //                 USER <-> HOTEL GROUP MANAGER           \\
    User.belongsToMany(HotelGroup,{
        through: HotelGroupManagers,
        foreignKey: "UserID",
        otherKey: "HGroupID",
        onDelete: "CASCADE"
    });
    //--
    HotelGroup.belongsToMany(User,{
        through: HotelGroupManagers,
        foreignKey: "HGroupID",
        otherKey: "UserID",
        onDelete: "CASCADE"
    })

    HotelGroupManagers.belongsTo(User, {
        foreignKey: "UserID"
    });

    User.hasMany(HotelGroupManagers, {
        foreignKey: "UserID"
    });

    HotelGroupManagers.belongsTo(HotelGroup, {
        foreignKey: "HGroupID"
    });

    HotelGroup.hasMany(HotelGroupManagers, {
        foreignKey: "HGroupID"
    });
    //________________________________________________________\\
    //                    ROLE <-> PERMISSION                 \\
    Role.belongsToMany(Permission, {
        through: RolePermission,
        foreignKey: "RoleID",
        otherKey: "PermissionID",
        onDelete: "CASCADE"
    });
    //--
    Permission.belongsToMany(Role, {
        through: RolePermission,
        foreignKey: "PermissionID",
        otherKey: "RoleID",
        onDelete: "CASCADE"
    });

};