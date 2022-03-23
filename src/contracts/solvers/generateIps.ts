//GENERATE IP ADDRESSES
export function generateIps(num: string) {
  num = num.toString();

  const length = num.length;

  let ips: string[] = [];

  for (let i = 1; i < length - 2; i++) {
    for (let j = i + 1; j < length - 1; j++) {
      for (let k = j + 1; k < length; k++) {
        const ip = [
          num.slice(0, i),
          num.slice(i, j),
          num.slice(j, k),
          num.slice(k, num.length),
        ];
        let isValid = true;

        ip.forEach((seg) => {
          isValid = isValid && isValidIpSegment(seg);
        });

        if (isValid) ips.push(ip.join("."));
      }
    }
  }

  return ips;
}

function isValidIpSegment(segment: any) {
  if (segment[0] == "0" && segment != "0") return false;
  segment = Number(segment);
  if (segment < 0 || segment > 255) return false;
  return true;
}
