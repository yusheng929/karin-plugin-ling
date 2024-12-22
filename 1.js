const obj = {
  a: true
}

const test = {
  a: false
}
console.log({ ...obj, ...test })
