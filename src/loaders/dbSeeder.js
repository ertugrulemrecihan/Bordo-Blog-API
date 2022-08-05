const Role = require("../api/v1/models/Role");
const User = require("../api/v1/models/User");
const { passwordToHash } = require("../api/v1/scripts/utils/password");

const createRole = async (roleName, roleDescription) => {
    const role = await Role.findOne({ name: roleName });

    let roleId = null;

    if (!role) {
        const createdRole = new Role({
            name: roleName,
            description: roleDescription
        });

        roleId = await createdRole.save();
    } else {
        roleId = role._id;
    }
    return roleId;
};

const createAdminUser = async (adminRoleId) => {
    const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (adminUser) {
        // adminUser._id
        if (!adminUser.roles.some(role => role._id.toString() === adminRoleId.toString())) {
            adminUser.roles = [adminRoleId];  // Admin account only has Admin role
            await adminUser.save();
        }
    }
    else {
        const password = passwordToHash(process.env.ADMIN_PASSWORD);

        const newAdmin = new User({
            first_name: process.env.ADMIN_FIRST_NAME,
            last_name: process.env.ADMIN_LAST_NAME,
            email: process.env.ADMIN_EMAIL,
            password: password.hashedPassword,
            salt: password.hashedSalt,
            roles: [adminRoleId],
        });
        newAdmin.save();
    }

};

module.exports = async () => {
    const adminRoleId = await createRole("Admin", "User with access to everything");
    await createAdminUser(adminRoleId);
};