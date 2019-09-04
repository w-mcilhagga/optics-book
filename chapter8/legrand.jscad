// LeGrand eye.

function main () {
  let rez = 128,
      half = cube({size:30}).translate([0,0,0]),
      lens = intersection(
        sphere({r:10.2,fn:rez}).translate([0,0.55+3.05+10.2,0]),
        sphere({r:6,fn:rez}).translate([0,0.55+3.05+4-6])
      ).setColor(0,0,1),
      fcornea = sphere({r:7.8,fn:rez}).translate([0,7.8,0]),
      bcornea = sphere({r:6.5,fn:rez}).translate([0,0.55+6.5,0]),
      ballr = 11.7,
      innerball = sphere({r:ballr,fn:rez}).translate([0,0.55+3.05+4+16.6-ballr,0]).setColor([1,0,0]),
      ballt = 0.3,
      outerball = sphere({r:ballr+ballt,fn:rez}).translate([0,0.55+3.05+4+16.6-ballr,0]).setColor([1,1,1]),
      sclera = difference(outerball, innerball, fcornea, half.setColor(1,1,1)),
      cornea = difference(fcornea, bcornea, innerball,half).setColor(0,0,1,0.3)
  
  return  [cornea, lens.setColor(0,0,1,0.4), sclera]
}