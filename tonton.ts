import {z} from "zod";

const sc = z.literal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])


function main() {
  const totest = 20

  const a = sc.parse(totest)

  console.log('a', a);
}


main()
