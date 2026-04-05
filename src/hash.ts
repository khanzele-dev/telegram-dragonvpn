import argon2 from "argon2"

async function generate() {
  const passwd = "PxBskkalsfkj2";
  const hash = await argon2.hash(passwd);
  console.log(hash);
}

generate();