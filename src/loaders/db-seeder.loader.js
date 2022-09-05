const Role = require('../api/v1/models/role.model');
const User = require('../api/v1/models/user.model');
const City = require('../api/v1/models/city.model');
const District = require('../api/v1/models/district.model');
const Country = require('../api/v1/models/country.model');
const { passwordToHash } = require('../api/v1/scripts/helpers/password.helper');
const fs = require('fs');

const createRole = async (roleName, roleDescription) => {
    const role = await Role.findOne({ name: roleName });

    let roleId = null;

    if (!role) {
        const createdRole = new Role({
            name: roleName,
            description: roleDescription,
        });

        roleId = await createdRole.save();
    } else {
        roleId = role._id;
    }

    return roleId;
};

const createSuperAdmin = async (superAdminRoleId) => {
    const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (adminUser) {
        if (
            !adminUser.roles.some(
                (role) => role._id.toString() === superAdminRoleId.toString()
            )
        ) {
            // SuperAdmin account only has SuperAdmin role
            adminUser.roles = [superAdminRoleId];
            await adminUser.save();
        }
    } else {
        const password = passwordToHash(process.env.ADMIN_PASSWORD);

        const newAdmin = new User({
            first_name: process.env.ADMIN_FIRST_NAME,
            last_name: process.env.ADMIN_LAST_NAME,
            email: process.env.ADMIN_EMAIL,
            password: password.hashedPassword,
            salt: password.hashedSalt,
            roles: [superAdminRoleId],
            last_login: Date.now(),
            email_verified: true,
        });

        newAdmin.save();
    }
};

const createCountry = async () => {
    const currentCity = await Country.findOne({ name: 'Türkiye' });

    let countryId = null;

    if (!currentCity) {
        const newCountry = new Country({
            name: 'Türkiye',
        }).save();

        countryId = await (await newCountry).save();
    } else {
        countryId = currentCity._id;
    }

    return countryId;
};

const createCity = async (country, city) => {
    const currentCity = await City.findOne({ name: city.city_name });

    let cityId = null;

    if (!currentCity) {
        const newCity = new City({
            country: country,
            name: city.city_name,
            region: city.region,
            zip_code: city.zip_code,
        }).save();

        cityId = await (await newCity).save();
    } else {
        cityId = currentCity._id;
    }

    return cityId;
};

const createDistrict = async (city, district) => {
    const currentDistrict = await District.findOne({ name: district.name });

    let districtId = null;

    if (!currentDistrict) {
        const newDistrict = new District({
            city: city,
            name: district.name,
            zip_code: district.zip_code,
        }).save();

        districtId = await (await newDistrict).save();
    } else {
        districtId = currentDistrict._id;
    }

    return districtId;
};

module.exports = async () => {
    // ? Create super admin role
    const superAdminRoleId = await createRole(
        'SUPERADMIN',
        'User with access to everything'
    );

    // ? Create super admin user
    await createSuperAdmin(superAdminRoleId);

    // ? Create admin user
    await createRole('Admin', 'Admin role');

    // ? Create countries-cities-districts
    const countryId = await createCountry();

    const data = fs.readFileSync('src/loaders/data/turkey.json');

    const cities = JSON.parse(data.toString()).data;

    for (const city of cities) {
        const cityId = await createCity(countryId, city);

        for (const district of city.districts) {
            await createDistrict(cityId, district);
        }
    }

    console.log('DB Seeded');
};
