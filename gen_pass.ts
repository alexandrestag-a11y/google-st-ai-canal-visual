import bcrypt from "bcryptjs";

async function gen() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash("admin123", salt);
  console.log(hash);
}
gen();
