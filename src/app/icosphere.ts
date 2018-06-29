let t: number = (1 + Math.sqrt(5)) / 2;

export let ICOSPHERE: number[] = [
    -1,  t,  0, -t,  0,  1,  0,  1,  t,
    -1,  t,  0,  0,  1,  t,  1,  t,  0,
    -1,  t,  0,  1,  t,  0,  0,  1, -t,
    -1,  t,  0,  0,  1, -t, -t,  0, -1,
    -1,  t,  0, -t,  0, -1, -t,  0,  1,
    
     1,  t,  0,  0,  1,  t,  t,  0,  1,
     0,  1,  t, -t,  0,  1,  0, -1,  t,
    -t,  0,  1, -t,  0, -1, -1, -t,  0,
    -t,  0, -1,  0,  1, -t,  0, -1, -t,
     0,  1, -t,  1,  t,  0,  t,  0, -1,
    
     1, -t,  0,  t,  0,  1,  0, -1,  t,
     1, -t,  0,  0, -1,  t, -1, -t,  0,
     1, -t,  0, -1, -t,  0,  0, -1, -t,
     1, -t,  0,  0, -1, -t,  t,  0, -1,
     1, -t,  0,  t,  0, -1,  t,  0,  1,
    
     0, -1,  t,  t,  0,  1,  0,  1,  t,
    -1, -t,  0,  0, -1,  t, -t,  0,  1,
     0, -1, -t, -1, -t,  0, -t,  0, -1,
     t,  0, -1,  0, -1, -t,  0,  1, -t,
     t,  0,  1,  t,  0, -1,  1,  t,  0
];