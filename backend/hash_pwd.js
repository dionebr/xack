
const bcrypt = require('bcryptjs');

async function hashPassword() {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('xackadmin123', salt);
    console.log(hash);
}

hashPassword();
