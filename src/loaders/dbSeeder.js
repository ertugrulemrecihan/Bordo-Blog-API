const Role = require("../api/v1/models/Role")
const User = require("../api/v1/models/User");
const { passwordToHash } = require("../api/v1/scripts/utils/password");

const createRole = async () => {
    const adminRole = await Role.findOne({ name: "Admin" });

    let adminRoleId = null;

    if (!adminRole) {
        const role = new Role({
            name: "Admin",
            description: "Highest-Ranked Authority"
        });

        adminRoleId = await role.save();
    } else {
        adminRoleId = adminRole._id;
    }
    return adminRoleId;
}

const createAdminUser = async (adminRoleId) => {
    const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (adminUser) {
        // adminUser._id
        if (adminUser.roles[0]._id != adminRoleId) {
            adminUser.roles[0]._id = adminRoleId;
            adminUser.save()
        }
    }
    else {
        const password = passwordToHash(process.env.ADMIN_PASSWORD)

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

}

module.exports = async () => {
    const adminRoleId = await createRole();
    await createAdminUser(adminRoleId);
};