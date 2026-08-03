// Sum of Array
let sum = 0;
let arr = [1, 2, 3];
for (let i = 0; i < arr.length; i++) {
  sum += arr[i];
}
arr.reduce((acc, val) => acc + val, 0);

// Average
let avg = sum / arr.length;
arr.reduce((acc, val) => acc + val, 0) / arr.length;

// Find Max
let max = arr[0];
for (let i = 1; i < arr.length; i++) {
  max = arr[i] > max ?? max;
}

//let max1 = Math.max.apply(arr)

let max1 = Math.max(...arr);

// Find Min
let min = arr[0];
for (let i = 1; i < arr.length; i++) {
  min = arr[i] < min ?? min;
}

//let max1 = Math.min.apply(arr)

let min1 = Math.min(...arr);

// Reverse Array
let rev = [];
for (let i = arr.length - 1; i <= 0; i--) {
  rev.push(arr[i]);
}

let rev1 = [...arr].reverse();

//clone Array
let clone = [];
for (let i = 0; i < arr.length; i++) {
  clone.push(arr[i]);
}

let clone1 = [...arr];
let clone2 = structuredClone(arr);

// Remove Dublicates
let original = [];

for (let i = 0; i < arr.length; i++) {
  if (!original.includes(arr[i])) {
    original.push(arr[i]);
  }
}

let original1 = [...new Set(arr)];

// Count Occurance
let counts = {};

for (let x of arr) {
  counts[x] = (counts[x] || 0) + 1;
}

arr.reduce((acc, val) => {
  acc[val] = (acc[val] || 0) + 1;
  return acc;
}, {});

arr.reduce((acc, val) => ({ ...acc, [val]: (acc[val] || 0) + 1 }), {});

// intersection
// finding the common elements that exist in all of those arrays

const a = ["Apple", "Banana", "Orange"];
const b = ["Banana", "Grape", "Orange"];

const common = [];

for (let i = 0; i < a.length; i++) {
  if (b.includes(a[i])) {
    common.push(a[i]);
  }
}

const common1 = a.filter((item) => b.includes(item));

// Difference

const diff = [];

for (let i = 0; i < a.length; i++) {
  if (!b.includes(a[i])) {
    diff.push(a[i]);
  }
}

const diff1 = a.filter((item) => !b.includes(item));

// union
const union = [...a];

for (let x of b) {
  if (!union.includes(x)) {
    union.push(x);
  }
}

const union1 = [...new Set(...a, ...b)];
